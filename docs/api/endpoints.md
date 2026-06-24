# Référence des endpoints API

Table de toutes les routes appelées par le frontend, regroupées par domaine.
Chaque route est définie par une fonction métier dans `src/api/` (jamais
appelée directement, voir [Faire un appel API](./Appels%20api.md)) et, en mode
mock, par un handler dans `src/mocks/handlers/` (voir
[Lier l'API et le mock](./Lier%20api%20et%20mock.md)).

> Base d'URL : `VITE_API_URL` (défaut `/api`, proxifié vers le backend .NET en
> dev). Toutes les requêtes envoient le cookie de session
> (`credentials: "include"`) — l'auth **n'utilise pas** de token Bearer.
>
> ℹ️ L'interception mock se fait via un **`MockRegistry` maison**
> (`src/mocks/registry.js`), pas via MSW.

Légende **Accès** : 🟢 public · 🔵 connecté · 🟠 admin.

---

## Authentification — `src/api/auth.js`

| Méthode | Route | Fonction | Accès | Handler mock |
|---|---|---|---|---|
| GET | `/auth/me` | *(via `AuthContext`)* | 🔵 | `auth.js` |
| POST | `/auth/login` | `loginUser` | 🟢 | `auth.js` |
| POST | `/auth/register` | `registerUser` | 🟢 | `auth.js` |
| POST | `/auth/refresh` | `refreshToken` | 🟢 | `auth.js` |
| POST | `/auth/logout` | `logout` | 🔵 | `auth.js` |
| POST | `/auth/forgot-password` | `forgotPassword` | 🟢 | `auth.js` |
| POST | `/auth/reset-password` | `resetPassword` | 🟢 | `auth.js` |
| POST | `/auth/confirm-email` | `confirmEmail` | 🟢 | `auth.js` |
| POST | `/auth/admin/login` | `adminLogin` | 🟢 | `auth.js` |
| POST | `/auth/2fa/setup` | `setupTwoFactor` | 🟠 | `auth.js` |
| POST | `/auth/2fa/confirm` | `confirmTwoFactor` | 🟠 | `auth.js` |

### Body de `POST /auth/admin/login`

```json
// Phase 1 (sans code)
{ "email": "admin@cyna.fr", "password": "password" }

// Phase 2 (avec code TOTP)
{ "email": "admin@cyna.fr", "password": "password", "totpCode": "000000" }
```

### Réponses de `POST /auth/admin/login`

| Scénario | Réponse |
|---|---|
| Identifiants invalides | `401` |
| Non-admin | `403` |
| Admin sans 2FA configuré | `200` + `{ requiresTwoFactorSetup: true }` |
| Credentials OK, TOTP attendu | `200` + `{ totpRequired: true }` |
| TOTP invalide | `401` |
| Succès complet | `200` + session (cookie posé) |

Détails du flux : [Authentification](../04%20authentification.md).

---

## Produits — `src/api/products.js`

| Méthode | Route | Fonction | Accès |
|---|---|---|---|
| GET | `/products` | `getProducts` | 🟢 |
| GET | `/products/:id` | `getProduct` | 🟢 |
| GET | `/products/similar/:id` | `getSimilarProducts` | 🟢 |
| GET | `/products/:id/admin` | `getProductAdmin` (bilingue FR/EN) | 🟠 |
| GET | `/catalog/category/:slug` | `getCategoryCatalog` | 🟢 |
| POST | `/products` | `createProduct` | 🟠 |
| PUT | `/products/:id` | `updateProduct` | 🟠 |
| DELETE | `/products/:id` | `deleteProduct` | 🟠 |

Détails : [CRUD Produits admin](../admin/product-admin-crud.md) ·
[Page Catalogue](../components/catalog-page.md).

---

## Recherche / Catalogue — `src/api/search.js`

| Méthode | Route | Fonction | Accès |
|---|---|---|---|
| GET | `/search` | `getCatalogProducts` | 🟢 |

### Paramètres de `/search`

| Paramètre | Type | Description |
|---|---|---|
| `q` | string | Recherche dans nom et description |
| `categoryIds` | string | IDs séparés par virgule |
| `maxPrice` | number | Prix mensuel d'entrée max |
| `available` | boolean | Filtre « disponible uniquement » |
| `sortBy` | `relevance\|price_asc\|price_desc\|name` | Tri |
| `page` | number | Page courante (défaut : 1) |
| `pageSize` | number | Taille de page (défaut : 9) |
| `locale` | `fr\|en` | Langue des libellés (défaut `fr`) |

**Réponse (page paginée) :**
```json
{ "items": [...], "total": 40, "page": 1, "pageSize": 9, "totalPages": 5 }
```

---

## Catégories — `src/api/categories.js`

| Méthode | Route | Fonction | Accès |
|---|---|---|---|
| GET | `/categories` | `getCategories` | 🟢 |
| GET | `/categories/search` | `searchCategories` (admin : `q`, `page`, `sortBy`…) | 🟠 |
| GET | `/categories/:id` | `getCategory` (inclut `translations[]`) | 🟠 |
| POST | `/categories` | `createCategory` | 🟠 |
| PUT | `/categories/:id` | `updateCategory` | 🟠 |
| DELETE | `/categories/:id` | `deleteCategory` | 🟠 |

---

## Accueil — `src/api/home.js`

| Méthode | Route | Fonction | Accès |
|---|---|---|---|
| GET | `/home` | `fetchHomeData` (carrousel, mission, catégories, top produits) | 🟢 |

---

## Compte utilisateur — `src/api/user.js`

| Méthode | Route | Fonction | Accès |
|---|---|---|---|
| GET | `/user/profile` | `getMe` | 🔵 |
| PUT | `/user/profile` | `updateProfile` | 🔵 |
| PUT | `/user/password` | `updatePassword` | 🔵 |
| GET | `/user/subscriptions` | `getSubscriptions` | 🔵 |
| GET | `/user/orders` | `getAccountOrders` | 🔵 |

---

## Panier — `src/api/cart.js` (⚠️ pas d'HTTP)

Le panier **n'appelle pas le réseau** : il est persisté dans `localStorage`
(clé `cyna_cart`). Les fonctions retournent des `Promise` pour rester
compatibles avec une future API. Détails : [API Panier](./cart.md).

| « Route » logique | Fonction |
|---|---|
| lire le panier | `getCart` |
| ajouter / fusionner | `addToCart` |
| modifier une ligne | `updateCartItem` |
| supprimer une ligne | `removeFromCart` |
| vider | `clearCart` |

> Des handlers mock HTTP `/cart` existent dans `handlers/orders.js` mais ne sont
> **pas** appelés par le frontend actuel.

---

## Commandes & checkout — `handlers/orders.js`

| Méthode | Route | Accès | Note |
|---|---|---|---|
| GET | `/orders` | 🟠 | Liste des commandes |
| GET | `/orders/:id` | 🔵 | Détail d'une commande |
| POST | `/orders` | 🔵 | Création au checkout |
| GET | `/account/orders` | 🔵 | Commandes du compte (`handlers/orders-account.js`) |
| GET | `/account/orders/:id` | 🔵 | Détail (`handlers/orders-account.js`) |

### Body de `POST /orders` (depuis `pages/checkout.jsx`)

```json
{ "items": [...], "address": { ... }, "total": 1074.60 }
```

> ⚠️ Le champ `items` utilise encore l'ancienne structure tarifaire. À
> resynchroniser avec le modèle à paliers ([pricing](../pricing/overview.md))
> avant branchement backend.

---

## Abonnements & carrousel — `handlers/orders.js`

| Méthode | Route | Accès |
|---|---|---|
| GET | `/subscriptions` | 🔵 |
| DELETE | `/subscriptions/:id` | 🔵 |
| GET | `/carousel` | 🟢 |
| PUT | `/carousel/:id` | 🟠 |

---

## Administration des utilisateurs — `src/api/admin-users.js`

| Méthode | Route | Fonction | Accès |
|---|---|---|---|
| GET | `/admin/users` | `getAdminUsers` (tous sauf l'admin connecté) | 🟠 |
| PATCH | `/admin/users/:id/disable` | `disableUser` | 🟠 |
| PATCH | `/admin/users/:id/enable` | `enableUser` | 🟠 |
| PATCH | `/admin/users/:id/role` | `changeUserRole` (body `{ role }`) | 🟠 |

Rôles : `User` · `Admin` · `SuperAdmin`. Handler mock : `handlers/admin-user.js`.

---

## Tableau de bord admin — `src/api/dashboard.js`

Toutes les routes acceptent `period` (`week\|month\|year\|all`, défaut `month`),
`from`/`to` (dates ISO) et `mock`. Handler mock : `handlers/dashboard.js`.

| Méthode | Route | Fonction | Accès |
|---|---|---|---|
| GET | `/dashboard/ca` | `getRevenueStats` | 🟠 |
| GET | `/dashboard/orders` | `getOrderStats` | 🟠 |
| GET | `/dashboard/users` | `getUserStats` | 🟠 |
| GET | `/dashboard/subscriptions` | `getSubscriptionStats` | 🟠 |
| GET | `/dashboard/products/top` | `getTopProducts` (`sortBy`, `limit`) | 🟠 |

> `getDashboardData()` agrège ces 5 appels en parallèle (`Promise.all`) pour la
> page dashboard.

---

## Conventions de statut HTTP

| Code | Signification | Géré côté front |
|---|---|---|
| 200 / 201 | Succès | Données retournées |
| 204 | Succès sans contenu | `null` (ex. DELETE) |
| 400 | Validation échouée | Toast d'erreur de formulaire |
| 401 | Non authentifié | Session `null`, redirection `/login` |
| 404 | Introuvable | Message « non trouvé » |
| 409 | Conflit (ressource liée) | Toast spécifique (ex. produit lié à commandes) |
| 5xx | Erreur serveur | Toast générique |

Toutes les erreurs non-2xx lèvent une `ApiError` exposant `.status` et
`.message`. Voir [Gestion des erreurs](./Appels%20api.md#gestion-des-erreurs).
