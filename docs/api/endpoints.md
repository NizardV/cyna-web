# Routes API

Toutes les routes sont interceptées par MSW en développement. Les handlers sont dans `src/mocks/handlers/`.

---

## Authentification

| Méthode | Route | Handler | Description |
|---------|-------|---------|-------------|
| `POST` | `/auth/login` | `auth.js` | Connexion utilisateur → token + user |
| `POST` | `/auth/register` | `auth.js` | Inscription → token + user + OTP email envoyé |
| `POST` | `/auth/refresh` | `auth.js` | Renouvellement de token |
| `POST` | `/auth/logout` | `auth.js` | Déconnexion (204) |
| `GET` | `/auth/me` | `auth.js` | Profil courant (rehydratation session) |
| `POST` | `/auth/forgot-password` | `auth.js` | Envoi OTP reset mdp (toujours 204) |
| `POST` | `/auth/reset-password` | `auth.js` | Validation OTP + nouveau mdp |
| `POST` | `/auth/confirm-email` | `auth.js` | Validation OTP confirmation email |
| `POST` | `/auth/admin/login` | `auth.js` | Connexion admin (2FA TOTP — 2 phases) |
| `POST` | `/auth/2fa/setup` | `auth.js` | Génère secret TOTP + otpAuthUrl |
| `POST` | `/auth/2fa/confirm` | `auth.js` | Active définitivement le 2FA |

### Body de `POST /auth/admin/login`

```json
// Phase 1 (sans code)
{ "email": "admin@cyna.fr", "password": "password", "totpCode": null }

// Phase 2 (avec code)
{ "email": "admin@cyna.fr", "password": "password", "totpCode": "000000" }
```

### Réponse de `POST /auth/admin/login`

| Scénario | Réponse |
|----------|---------|
| Identifiants invalides | `401` |
| Non-admin | `403` |
| Admin sans 2FA configuré | `200` + `{ requiresTwoFactorSetup: true }` |
| Credentials OK, TOTP attendu | `200` + `{ totpRequired: true }` |
| TOTP invalide | `401` |
| Succès complet | `200` + `{ token, user }` |

---

## Produits

| Méthode | Route | Handler | Description |
|---------|-------|---------|-------------|
| `GET` | `/products` | `products.js` | Liste tous les produits |
| `GET` | `/products/:id` | `products.js` | Détail d'un produit |
| `GET` | `/products/similar/:id` | `products.js` | 6 produits similaires |
| `POST` | `/products` | `products.js` | Crée un produit (admin) |
| `PUT` | `/products/:id` | `products.js` | Met à jour un produit (admin) |
| `DELETE` | `/products/:id` | `products.js` | Supprime un produit (admin) |

---

## Catalogue

| Méthode | Route | Handler | Description |
|---------|-------|---------|-------------|
| `GET` | `/catalog/products` | `orders.js` | Produits filtrés + paginés |

### Paramètres de `/catalog/products`

| Paramètre | Type | Description |
|-----------|------|-------------|
| `q` | string | Recherche dans nom et description |
| `categoryIds` | string | IDs séparés par virgule |
| `maxPrice` | number | Prix mensuel d'entrée max |
| `available` | boolean | Filtre "disponible uniquement" |
| `sortBy` | `relevance\|price_asc\|price_desc\|name` | Tri |
| `page` | number | Page courante (défaut : 1) |
| `pageSize` | number | Taille de page (défaut : 9) |

**Réponse :**
```json
{
  "items": [...],
  "total": 40,
  "page": 1,
  "pageSize": 9,
  "totalPages": 5
}
```

---

## Catégories

| Méthode | Route | Handler | Description |
|---------|-------|---------|-------------|
| `GET` | `/categories` | `orders.js` | Liste toutes les catégories |
| `GET` | `/categories/:id` | `orders.js` | Détail d'une catégorie |
| `POST` | `/categories` | (à créer) | Crée une catégorie (admin) |
| `PUT` | `/categories/:id` | (à créer) | Met à jour une catégorie (admin) |
| `DELETE` | `/categories/:id` | (à créer) | Supprime une catégorie (admin) |

---

## Accueil

| Méthode | Route | Handler | Description |
|---------|-------|---------|-------------|
| `GET` | `/home/featured` | `home.js` | Produits mis en avant |
| `GET` | `/home/carousel` | `home.js` | Slides du carrousel |

---

## Commandes

| Méthode | Route | Handler | Description |
|---------|-------|---------|-------------|
| `GET` | `/orders` | `orders.js` | Liste toutes les commandes |
| `GET` | `/orders/:id` | `orders.js` | Détail d'une commande |
| `POST` | `/orders` | `orders.js` | Crée une commande (checkout) |
| `GET` | `/account/orders` | `orders-account.js` | Commandes du compte utilisateur |

### Body de `POST /orders`

Envoyé depuis `src/pages/checkout.jsx` :
```json
{
  "items": [...],
  "address": { ... },
  "total": 1074.60
}
```

> ⚠️ Le champ `items` utilise encore l'ancienne structure. À mettre à jour pour le vrai backend.

---

## Panier (mock — non utilisé par le frontend)

| Méthode | Route | Handler | Description |
|---------|-------|---------|-------------|
| `GET` | `/cart` | `orders.js` | Contenu du panier |
| `POST` | `/cart` | `orders.js` | Ajoute un article |
| `PUT` | `/cart/:id` | `orders.js` | Modifie un article |
| `DELETE` | `/cart/:id` | `orders.js` | Supprime un article |

> Le frontend utilise `localStorage` via `src/api/cart.js`. Ces handlers ne sont pas appelés.

---

## Abonnements

| Méthode | Route | Handler | Description |
|---------|-------|---------|-------------|
| `GET` | `/subscriptions` | `orders.js` | Abonnements actifs de l'utilisateur |
| `DELETE` | `/subscriptions/:id` | `orders.js` | Annule un abonnement |

---

## Utilisateur

| Méthode | Route | Handler | Description |
|---------|-------|---------|-------------|
| `GET` | `/user/profile` | `user.js` | Profil courant |
| `PUT` | `/user/profile` | `user.js` | Met à jour le profil |

---

## Admin — Utilisateurs

| Méthode | Route | Handler | Description |
|---------|-------|---------|-------------|
| `GET` | `/admin/users` | (à créer) | Liste tous les utilisateurs |
| `PUT` | `/admin/users/:id/role` | (à créer) | Change le rôle d'un utilisateur |
| `PUT` | `/admin/users/:id/disable` | (à créer) | Désactive un compte |
| `PUT` | `/admin/users/:id/enable` | (à créer) | Réactive un compte |

---

## Carrousel (admin)

| Méthode | Route | Handler | Description |
|---------|-------|---------|-------------|
| `GET` | `/carousel` | `orders.js` | Slides du carrousel |
| `PUT` | `/carousel/:id` | `orders.js` | Met à jour un slide |

---

## Admin — Dashboard

| Méthode | Route | Handler | Description |
|---------|-------|---------|-------------|
| `GET` | `/admin/dashboard` | `orders.js` | KPIs : CA, commandes, ventes/jour, ventes/catégorie |

> ⚠️ Le composant Dashboard (`/admin/dashboard`) est un placeholder — la page affiche `<Loading />` en attendant l'implémentation. Voir `admin/dashboard.md`.
