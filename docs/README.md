# Documentation Cyna-Web

Documentation technique du frontend React de la plateforme SaaS cybersécurité Cyna.

---

## Structure

```
docs/
├── pricing/
│   ├── overview.md       Modèle de tarification hybride, enums, structure JSON
│   ├── tiers.md          Grille à paliers, findTier, logique devis
│   └── cart-flow.md      Flux complet : produit → panier → checkout
│
├── architecture/
│   ├── overview.md       Stack, arborescence des dossiers, patterns
│   ├── routing.md        Toutes les routes de l'app
│   └── mock-system.md    MSW, store.js, factories, handlers
│
├── api/
│   ├── endpoints.md      Tableau de toutes les routes API
│   └── cart.md           API panier localStorage
│
├── components/
│   ├── product-page.md   Décomposition page produit + state lifting
│   └── cart-page.md      Décomposition page panier + recalcul prix
│
├── paiement/
│   └── stripe-checkout.md   Stripe Elements, flux checkout, proxy Vite
│
├── admin/
│   └── product-admin-crud.md   Interface back-office gestion produits
│
└── i18n/
    └── overview.md       Namespaces, clés pricing et panier
```

---

## Points d'entrée recommandés

| Je veux comprendre… | Lire |
|---|---|
| Comment fonctionne la tarification | `pricing/overview.md` + `pricing/tiers.md` |
| Le flux complet d'un achat | `pricing/cart-flow.md` |
| L'architecture du projet | `architecture/overview.md` |
| Quelle route API appeler | `api/endpoints.md` |
| La page produit en détail | `components/product-page.md` |
| Comment fonctionne le panier | `components/cart-page.md` + `api/cart.md` |
| Le paiement Stripe (checkout) | `paiement/stripe-checkout.md` |
| Comment gérer les produits en admin | `admin/product-admin-crud.md` |

---

## Points d'attention

- **Paiement** : l'ancien `POST /orders` (qui passait la commande `Paid` à l'aveugle) a été
  **retiré**. Le paiement passe désormais par `POST /payments/subscription` + webhook Stripe
  (voir `paiement/stripe-checkout.md`).
- `POST /cart` (mock) — handler non synchronisé avec la nouvelle structure (mock uniquement)
- `PUT /cart/:id` (mock) — idem
