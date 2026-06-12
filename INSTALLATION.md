# Installation — Cyna Web

## Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | 20.x |
| npm | 10.x |

Vérifie tes versions :

```bash
node -v
npm -v
```

---

## Cloner le dépôt

```bash
git clone https://dev.azure.com/2028DI1P5G3/DIIAGE%202028%20DI1%20P5%20G3/_git/Cyna-Web
cd Cyna-Web
```

---

## Installer les dépendances

```bash
npm install
```

---

## Configuration de l'environnement

Crée un fichier `.env` à la racine à partir du modèle fourni :

```bash
cp .env.example .env
```

### Variables disponibles

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `VITE_API_URL` | Oui | URL de base du backend .NET (ex : `http://localhost:5104`) |
| `VITE_MOCK_API` | Non | `true` pour activer le système de mock MSW (pas de backend nécessaire) |
| `VITE_MOCK_DELAY` | Non | Délai simulé en ms pour les requêtes mockées (défaut : `400`) |
| `VITE_OVERRIDE_ROLE` | Non | `true` pour dériver la vue admin depuis le chemin URL en développement |

**Mode mock** — pour travailler sans backend :

```env
VITE_MOCK_API=true
VITE_API_URL=http://localhost:5104   # ignoré en mode mock, mais doit être défini
```

**Mode backend réel** :

```env
VITE_MOCK_API=false
VITE_API_URL=http://localhost:5104
```

> Le serveur Vite proxy les requêtes `/api/*` vers `https://localhost:7169` (HTTPS du backend .NET local).
> `VITE_API_URL` cible le port HTTP direct ; ajuste selon ton environnement.

---

## Lancer en développement

```bash
npm run dev
```

L'application est disponible sur [http://localhost:5173](http://localhost:5173) par défaut.

---

## Build de production

```bash
npm run build
```

Les fichiers compilés sont générés dans `dist/`. Pour prévisualiser le build localement :

```bash
npm run preview
```

---

## Structure des dossiers

```
Cyna-Web/
├── public/
│   └── locales/            # Fichiers JSON de traduction (fr, en, ar, he)
│       └── {lang}/
│           └── {namespace}.json
├── src/
│   ├── api/                # Appels HTTP (apiClient, un fichier par domaine)
│   ├── components/
│   │   ├── ui/             # Composants shadcn/ui (Button, Card, Input…)
│   │   ├── layout/         # Header, Footer, Layout, LangSwitcher, Search
│   │   ├── home/           # Carrousel, CategoryGrid, FeaturedProducts…
│   │   ├── product/        # Galerie, infos, tarifs, table paliers
│   │   ├── cart/           # CartRow, CartSummary, CartSkeleton
│   │   ├── search/         # ProductCard, filtres, pagination
│   │   ├── catalog/        # CategoryHeader
│   │   ├── account/        # AccountNav, OrderGroup, Subscription…
│   │   └── admin/          # Tableaux et formulaires d'administration
│   ├── contexts/           # AuthContext (rôle, token, isAdmin)
│   ├── hooks/              # useAuth, useDebounce, useAsRef…
│   ├── lib/                # Utilitaires (cn, formatPrice, pricing-utils, i18n)
│   ├── mocks/              # Système MSW : handlers, store, factories
│   ├── pages/
│   │   ├── account/        # Profile, OrderHistory
│   │   ├── admin/          # AdminProducts, AdminProductForm, AdminCategories
│   │   └── specials/       # Loading, NotFound (404), Unauthorized (401)
│   ├── App.jsx             # Arbre de routes React Router
│   ├── wrapper.jsx         # Gardes UserRoute / AdminRoute
│   └── main.tsx            # Point d'entrée (initialise MSW si VITE_MOCK_API=true)
├── .env.example
├── vite.config.ts
└── package.json
```

---

## Conventions

### i18n

Les traductions sont chargées à la demande via `i18next-http-backend` depuis `public/locales/`.

```
public/locales/
├── fr/
│   ├── common.json
│   ├── home.json
│   └── …
├── en/
├── ar/
└── he/
```

- 4 langues : `fr`, `en`, `ar`, `he`
- Utilisation dans les composants :

```jsx
const { t } = useTranslation("namespace")
t("clé.imbriquée")
```

- Le namespace par défaut est `common`. Chaque page ou domaine fonctionnel a son propre namespace.
- La langue active est persistée dans `localStorage` (clé `i18nextLng`).

### Routing

- React Router v7 avec `BrowserRouter`
- Deux gardes dans `src/wrapper.jsx` :
  - `UserRoute` — redirige vers `/login` si non authentifié
  - `AdminRoute` — redirige vers `/unauthorized` si l'utilisateur n'a pas le rôle admin
- Les rôles admin reconnus : `"Administrateur"` et `"Super Administrateur"`
- En développement, `VITE_OVERRIDE_ROLE=true` déduit automatiquement la vue admin depuis le préfixe `/admin` dans l'URL

### shadcn/ui

Les composants shadcn sont dans `src/components/ui/`. Pour en ajouter un :

```bash
npx shadcn@latest add <composant>
```

Les composants utilisent les variables CSS Tailwind (`--primary`, `--foreground`…) et s'adaptent automatiquement au thème.

### Mock API

Le système de mock (MSW) est activé via `VITE_MOCK_API=true`. Les handlers sont déclarés dans `src/mocks/handlers/` et enregistrés dans `src/mocks/registry.js`. Les données sont générées par `src/mocks/factories/factories.js` et persistées en mémoire dans `src/mocks/store.js`.
