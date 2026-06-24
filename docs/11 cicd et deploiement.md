# CI/CD et déploiement

## Vue d'ensemble

```
git push (main ou dev)
        │
        ▼
Azure DevOps Pipeline CI (ci-web.yml)
    │  Agent: CyanPool (self-hosted)
    │
    ├─ 1. SonarCloud — analyse statique
    ├─ 2. Login GHCR
    ├─ 3. docker build --build-arg VITE_API_URL=…
    └─ 4. docker push → GHCR (3 tags)
                │
                ▼
Azure DevOps Pipeline CD (cd-cloud-web.yml)
    │  Déclenché par le succès du CI
    │
    ├─ 1. Calcul de l'environnement (staging / prod)
    ├─ 2. Versioning sémantique (prod uniquement)
    ├─ 3. Tag image Docker :vX.Y.Z (prod uniquement)
    ├─ 4. SSH → OVH Cloud : docker compose pull + up
    └─ 5. Health check HTTP
```

---

## Pipeline CI (`ci-web.yml`)

### Déclencheurs

```yaml
trigger:
  branches:
    include: [ "main", "dev" ]
```

Tout push sur `main` ou `dev` déclenche le CI.

### Environnements par branche

| Branche | `envName` | `VITE_API_URL` |
|---------|-----------|----------------|
| `main` | `prod` | `https://api.projet-cyna.fr` |
| `dev` | `staging` | `https://api.staging.projet-cyna.fr` |

### Étapes

#### 1. SonarCloud

```yaml
- task: SonarCloudPrepare@3
  inputs:
    SonarCloud: 'SonarCloud-CYNA'
    organization: '2028di1p5g3'
    cliProjectKey: '2028DI1P5G3_Cyna-Web'
    cliProjectName: 'CYNA - Frontend Web'
    extraProperties: |
      sonar.exclusions=**/node_modules/**,**/dist/**
- task: SonarCloudAnalyze@3
```

Analyse statique du code React/TypeScript : dette technique, code smells, couverture (si tests configurés).

#### 2. Build Docker

```yaml
- script: |
    docker build \
      --build-arg VITE_API_URL=$(VITE_API_URL) \
      -t $(FULL_IMAGE):$(envName) \
      -t $(FULL_IMAGE):sha-$(Build.SourceVersion) \
      -t $(FULL_IMAGE):build-$(Build.BuildId) \
      .
```

`VITE_API_URL` est injectée comme `ARG` Dockerfile à la compilation — l'URL de l'API est **baked-in** dans le bundle Vite, pas configurée à runtime.

#### 3. Push GHCR

Trois tags poussés par build :

| Tag | Valeur | Usage |
|-----|--------|-------|
| `:staging` / `:prod` | Environnement | Déploiement par environment |
| `:sha-{commit}` | SHA commit complet | Traçabilité précise |
| `:build-{id}` | ID build Azure | Rollback par build |

---

## Pipeline CD (`cd-cloud-web.yml`)

### Déclencheur

```yaml
trigger: none
resources:
  pipelines:
  - pipeline: 'ci-web'
    source: 'Cyna-Web CI'
    trigger:
      branches:
        include: [ "main", "dev" ]
```

Déclenché automatiquement par la complétion du CI.

### Étape 1 — Calcul de l'environnement

```bash
BRANCH_NAME=$(echo "$BUILD_SOURCEBRANCH" | sed 's|refs/heads/||')
if [ "$BRANCH_NAME" = "main" ]; then
  envName=production    composeEnv=prod    composeProject=cyna-prod    IS_PROD=true
else
  envName=staging       composeEnv=staging  composeProject=cyna-staging  IS_PROD=false
fi
```

### Étape 2 — Versioning sémantique (prod uniquement)

Analysé automatiquement depuis les messages de commit (Conventional Commits) :

```
feat!: / fix!: / refactor!:  → MAJOR (breaking change)
feat:                         → MINOR (nouvelle fonctionnalité)
fix: / chore: / docs: / …    → PATCH
```

Exemple :

```
Dernier tag : web/v1.3.2
Commits depuis le tag :
  feat: ajout page notifications
  fix: correction calcul prix lifetime
→ Bump: minor
→ Nouveau tag : web/v1.4.0
```

Le tag Git `web/vX.Y.Z` est créé via l'API Azure DevOps REST.

### Étape 3 — Tag image Docker (prod uniquement)

```bash
docker pull $(FULL_IMAGE):prod
docker tag $(FULL_IMAGE):prod $(FULL_IMAGE):$(NEW_VERSION)
docker push $(FULL_IMAGE):$(NEW_VERSION)
# ex: ghcr.io/nizardv/cyna-frontend:v1.4.0
```

### Étape 4 — Déploiement SSH

```bash
# Connexion GHCR sur le VPS OVH
echo "$(GHCR_PAT)" | docker login ghcr.io -u NizardV --password-stdin

# Mise à jour du docker-compose
cd ~/cyna-infra && git pull origin main
cd docker-compose/

# Pull de la nouvelle image + redémarrage du container web
docker compose -p $(composeProject) -f docker-compose.$(composeEnv).yml pull web
docker compose -p $(composeProject) -f docker-compose.$(composeEnv).yml up -d \
  --no-build --force-recreate --no-deps web
```

`--no-deps` : seul le container `web` est redémarré (pas l'API, pas la BDD).

### Étape 5 — Health check

```bash
sleep 5
curl -f http://localhost:$(API_PORT)/health || exit 1
```

Attend 5 secondes puis vérifie la réponse HTTP. Échec → le pipeline est marqué en erreur.

---

## Dockerfile — Build multi-stage

```dockerfile
# Stage 1 : build Vite
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci                         # lockfile strict
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL     # baked-in dans le bundle
RUN npm run build                  # → /app/dist/

# Stage 2 : serve nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Avantages du multi-stage :**

| Aspect | Bénéfice |
|--------|---------|
| Taille image | Node.js (~400 MB) absent du container final |
| Sécurité | `node_modules` et sources absent en production |
| Performance | nginx:alpine ultra-léger (~25 MB) |

---

## nginx.conf — SPA routing

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

`try_files $uri $uri/ /index.html` : toute URL non trouvée comme fichier statique renvoie `index.html`. React Router prend la main et affiche la bonne page côté client.

Sans cette ligne, actualiser la page sur `/admin/categories` retournerait un 404 nginx.

---

## Registre d'images (GHCR)

Image : `ghcr.io/nizardv/cyna-frontend`

| Tag | Description |
|-----|-------------|
| `:prod` | Dernière production |
| `:staging` | Dernier staging |
| `:sha-{commit}` | Image liée à un commit précis |
| `:build-{id}` | Image liée à un build Azure DevOps |
| `:v1.4.0` | Image liée à une version sémantique (prod uniquement) |

---

## Variables et secrets Azure DevOps

| Variable | Groupe | Description |
|----------|--------|-------------|
| `GHCR_PAT` | `GHCR` | Token GitHub → login GHCR |
| `ADO_PAT` | — | Token Azure DevOps → créer les tags Git |
| `VITE_API_URL` | Calculée | URL backend par environnement |
| `FULL_IMAGE` | Calculée | `ghcr.io/nizardv/cyna-frontend` |
| `envName` | Calculée | `staging` ou `prod` |
| `composeProject` | Calculée | `cyna-staging` ou `cyna-prod` |
| `IS_PROD` | Calculée | `true` ou `false` |