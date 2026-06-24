# Documentation Cyna-Web

Documentation technique du frontend React de la plateforme SaaS cybersécurité Cyna.

---

## Structure

```
docs/
├── architecture/
│   ├── overview.md          Stack, arborescence, patterns principaux
│   ├── routing.md           Toutes les routes + gardes (UserRoute, AdminRoute…)
│   └── mock-system.md       MSW, store.js, factories, handlers
│
├── auth/
│   ├── login-user.md        Connexion utilisateur standard (/login)
│   ├── login-admin.md       Connexion admin 2FA (/admin/login) ← cas spécial
│   ├── forgot-password.md   Flux reset mot de passe par OTP
│   └── confirm-email.md     Confirmation d'email par OTP
│
├── api/
│   ├── endpoints.md         Tableau de toutes les routes API
│   ├── Appels api.md        Comment utiliser apiClient
│   ├── Handlers.md          Écrire des handlers mock
│   ├── Lier api et mock.md  Correspondance route ↔ handler
│   ├── Mock.md              Factories Faker
│   └── cart.md              API panier localStorage
│
├── architecture/
│   ├── overview.md          Vue d'ensemble stack + dossiers
│   ├── routing.md           Routes + gardes
│   └── mock-system.md       Système MSW complet
│
├── admin/
│   ├── dashboard.md         Tableau de bord admin ← cas spécial (mock btn)
│   ├── product-admin-crud.md  Interface CRUD produits
│   ├── categories-admin.md  Interface CRUD catégories
│   └── users-admin.md       Liste des utilisateurs
│
├── components/
│   ├── product-page.md      Décomposition page produit + state lifting
│   └── cart-page.md         Décomposition page panier + recalcul prix
│
├── pricing/
│   ├── overview.md          Modèle hybride à paliers, enums, structure JSON
│   ├── tiers.md             Grille, findTier, logique devis
│   └── cart-flow.md         Flux complet produit → panier → checkout
│
├── i18n/
│   └── overview.md          Namespaces, clés pricing et panier
│
├── Structure et conventions.md   Arborescence + conventions nommage + Tailwind
└── Outils externes.md            Prettier, ESLint, React Doctor, TypeScript
```

---

## Points d'entrée recommandés

| Je veux comprendre…                        | Lire                                             |
|--------------------------------------------|--------------------------------------------------|
| L'architecture du projet                   | `architecture/overview.md`                       |
| Toutes les routes de l'app                 | `architecture/routing.md`                        |
| Comment fonctionne le système mock         | `architecture/mock-system.md`                    |
| La connexion utilisateur                   | `auth/login-user.md`                             |
| La connexion admin (2FA)                   | `auth/login-admin.md`                            |
| Comment fonctionne la tarification         | `pricing/overview.md` + `pricing/tiers.md`       |
| Le flux complet d'un achat                 | `pricing/cart-flow.md`                           |
| Quelle route API appeler                   | `api/endpoints.md`                               |
| Comment faire un appel API                 | `api/Appels api.md`                              |
| Comment écrire un handler mock             | `api/Handlers.md`                                |
| La page produit en détail                  | `components/product-page.md`                     |
| Comment fonctionne le panier               | `components/cart-page.md` + `api/cart.md`        |
| Le tableau de bord admin (et mock btn)     | `admin/dashboard.md`                             |
| Gérer les produits en admin                | `admin/product-admin-crud.md`                    |
| Gérer les catégories en admin              | `admin/categories-admin.md`                      |
| Les conventions de code                    | `Structure et conventions.md`                    |
| Les outils du projet                       | `Outils externes.md`                             |

---

## Cas spéciaux documentés séparément

| Page / Feature                       | Doc dédiée                   | Pourquoi séparée                                          |
|--------------------------------------|------------------------------|-----------------------------------------------------------|
| `/admin/dashboard`                   | `admin/dashboard.md`         | Mock data button, KPI widgets, placeholder en attente     |
| `/admin/login` (2FA TOTP)            | `auth/login-admin.md`        | Flux à deux phases, gestion bootstrap 2FA, codes mock     |

---

## Points d'attention (TODO backend)

- `POST /orders` — le body `items` utilise encore l'ancienne structure (avant refonte pricing)
- `POST /cart` (mock) — handler non synchronisé avec la nouvelle structure localStorage
- `/admin/dashboard` — route active mais renvoie `<Loading />` : le composant Dashboard reste à créer
