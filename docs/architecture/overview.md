# Architecture — Vue d'ensemble

## Stack technique

| Couche | Technologie |
|---|---|
| UI | React 18 + Vite |
| Routing | React Router v6 |
| Composants UI | shadcn/ui (Radix + Tailwind) |
| Style | Tailwind CSS v3 |
| i18n | react-i18next |
| Mock API | MSW (Mode Service Worker) |
| Génération de données | @faker-js/faker |
| Notifications | Sonner |

---

## Structure des dossiers

```
src/
├── api/               Appels HTTP vers le backend (wrappers apiClient)
│   ├── auth.js
│   ├── cart.js        ← localStorage uniquement
│   ├── catalog.js
│   ├── home.js
│   ├── orders.js
│   ├── products.js
│   └── user.js
│
├── components/        Composants réutilisables
│   ├── cart/          Composants de la page panier
│   │   ├── cart-row.jsx
│   │   ├── cart-skeleton.jsx
│   │   └── cart-summary.jsx
│   ├── home/          Composants de la page d'accueil
│   │   ├── category-grid.jsx
│   │   ├── featured-products.jsx
│   │   ├── fixed-text.jsx
│   │   └── home-carousel.jsx
│   ├── layout/        Header, footer, layout global
│   ├── product/       Composants de la page produit
│   │   ├── pricing-tiers-table.jsx
│   │   ├── product-gallery.jsx
│   │   ├── product-info.jsx
│   │   └── product-pricing.jsx
│   └── ui/            shadcn + composants catalogue
│       ├── catalog/
│       └── [shadcn components]
│
├── contexts/          React Contexts (auth)
├── hooks/             Hooks custom
├── lib/
│   ├── pricing.js     Enums + findTier (logique métier pricing)
│   └── utils.js       cn(), formatPrice(), etc.
│
├── mocks/             Système de mock API (MSW)
│   ├── factories/     Génération de données avec Faker
│   ├── handlers/      Handlers par domaine
│   ├── registry.js    Enregistrement centralisé des handlers
│   ├── store.js       Source unique des données mock
│   └── index.js       Initialisation MSW
│
├── pages/             Pages (orchestrateurs légers)
│   ├── account/
│   ├── specials/
│   ├── cart.jsx
│   ├── catalog.jsx
│   ├── checkout.jsx
│   ├── home.jsx
│   └── product.jsx
│
└── App.jsx            Routeur principal
```

---

## Patterns principaux

### Pages minces / composants riches
Les pages (`pages/`) ne contiennent que le state global de la page et les handlers d'événements. Le JSX métier est dans `components/`.

```
pages/product.jsx          → state: billingPeriod, quantityUsers, quantityDevices
                           → calcule: currentPlan, tierUser, tierDevice, totalPrice
                           → délègue à: ProductInfo, PricingTiersTable, ProductPricing
```

### State lifting
Le state de sélection (billing period, quantités) est remonté dans la page et passé en props aux composants enfants.

### API en couche fine
Tous les appels HTTP passent par `apiClient` dans `src/api/client.js`. En mode développement, MSW intercepte les requêtes et retourne les données mock. En production, les vraies URLs sont appelées.

### Panier localStorage
Le panier est géré entièrement en localStorage via `src/api/cart.js`. Les fonctions retournent des `Promise` pour être compatibles avec un remplacement futur par de vraies API.
