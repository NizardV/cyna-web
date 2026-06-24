# Cyna-Web

Frontend de **Cyna**, une plateforme e-commerce SaaS de cybersécurité. C'est une
**Single Page Application (SPA)** React, totalement découplée du backend .NET, et
capable de fonctionner **sans backend** grâce à une couche de mock interne.

---

## 🚀 Démarrage rapide

```bash
git clone <url-du-depot> Cyna-Web
cd Cyna-Web
npm install
cp .env.example .env.local      # PowerShell : Copy-Item .env.example .env.local
npm run dev                     # http://localhost:5173
```

Pour développer **sans backend**, mettez `VITE_MOCK_API=true` dans `.env.local`.

📖 Guide complet : [`docs/00 installation et demarrage.md`](./docs/00%20installation%20et%20demarrage.md)

---

## 🧱 Stack

| Domaine | Techno |
|---|---|
| Build / dev | Vite 8 |
| UI | React 19 (+ React Compiler), Tailwind CSS 4, shadcn/ui |
| Routing | React Router 7 |
| i18n | i18next — 4 langues (fr, en, ar, he) avec support RTL |
| Paiement | Stripe |
| Mocks | Faker + registry maison |

---

## 📂 Structure (résumé)

```
src/
├── api/          # Couche d'accès aux données (apiClient + modules par domaine)
├── mocks/        # Faux backend (actif si VITE_MOCK_API=true)
├── components/   # Composants (ui/ = shadcn, + composants métier par domaine)
├── contexts/     # État global (auth)
├── hooks/        # Hooks réutilisables
├── lib/          # Utilitaires purs (i18n, pricing-utils)
├── pages/        # Une page = une route
├── App.jsx       # Déclaration des routes
├── wrapper.jsx   # Gardes de routes (rôles)
└── main.tsx      # Point d'entrée + providers
```

Détail : [`docs/01 Structure et conventions.md`](./docs/01%20Structure%20et%20conventions.md) · [`docs/02 architecture.md`](./docs/02%20architecture.md)

---

## 📜 Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement (HMR) |
| `npm run build` | Build de production (`dist/`) |
| `npm run preview` | Prévisualise le build |
| `npm run lint` | Analyse ESLint |

---

## 📚 Documentation

Toute la documentation technique est dans [`docs/`](./docs/README.md) (index complet) :

- [00 Installation & démarrage](./docs/00%20installation%20et%20demarrage.md)
- [02 Architecture](./docs/02%20architecture.md) · [05 Routing et gardes](./docs/05%20routing%20et%20gardes.md)
- [04 Authentification](./docs/04%20authentification.md) · [07 i18n](./docs/07%20i18n.md)
- [12 Scalabilité](./docs/12%20scalabilite%20et%20performance.md) · [13 RGPD](./docs/13%20rgpd%20et%20donnees%20personnelles.md)
- [11 CI/CD et déploiement](./docs/11%20cicd%20et%20deploiement.md) · [Référence des endpoints API](./docs/api/endpoints.md)

> ⚠️ **Déploiement** : en production, le **fallback SPA** (toute route inconnue →
> `index.html`) est assuré par nginx. Voir
> [11 CI/CD et déploiement](./docs/11%20cicd%20et%20deploiement.md#nginxconf--spa-routing).
