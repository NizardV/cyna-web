# Routes API

Toutes les routes sont interceptées par MSW en développement. Les handlers sont dans `src/mocks/handlers/`.

---

## Produits

| Méthode | Route | Handler | Description |
|---|---|---|---|
| `GET` | `/products` | `products.js` | Liste tous les produits |
| `GET` | `/products/:id` | `products.js` | Détail d'un produit |
| `GET` | `/products/similar/:id` | `products.js` | 6 produits similaires |
| `POST` | `/products` | `products.js` | Crée un produit (admin) |
| `PUT` | `/products/:id` | `products.js` | Met à jour un produit (admin) |
| `DELETE` | `/products/:id` | `products.js` | Supprime un produit (admin) |

---

## Catalogue

| Méthode | Route | Handler | Description |
|---|---|---|---|
| `GET` | `/catalog/products` | `orders.js` | Produits filtrés + paginés |

### Paramètres de `/catalog/products`

| Paramètre | Type | Description |
|---|---|---|
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
|---|---|---|---|
| `GET` | `/categories` | `orders.js` | Liste toutes les catégories |
| `GET` | `/categories/:id` | `orders.js` | Détail d'une catégorie |

---

## Accueil

| Méthode | Route | Handler | Description |
|---|---|---|---|
| `GET` | `/home/featured` | `home.js` | Produits mis en avant |
| `GET` | `/home/carousel` | `home.js` | Slides du carrousel |

---

## Commandes

| Méthode | Route | Handler | Description |
|---|---|---|---|
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
|---|---|---|---|
| `GET` | `/cart` | `orders.js` | Contenu du panier |
| `POST` | `/cart` | `orders.js` | Ajoute un article |
| `PUT` | `/cart/:id` | `orders.js` | Modifie un article |
| `DELETE` | `/cart/:id` | `orders.js` | Supprime un article |

> Le frontend utilise `localStorage` via `src/api/cart.js`. Ces handlers ne sont pas appelés.

---

## Abonnements

| Méthode | Route | Handler | Description |
|---|---|---|---|
| `GET` | `/subscriptions` | `orders.js` | Abonnements actifs de l'utilisateur |
| `DELETE` | `/subscriptions/:id` | `orders.js` | Annule un abonnement |

---

## Authentification

| Méthode | Route | Handler | Description |
|---|---|---|---|
| `POST` | `/auth/login` | `auth.js` | Connexion → retourne token + user |
| `POST` | `/auth/register` | `auth.js` | Inscription → retourne token + user |
| `POST` | `/auth/logout` | `auth.js` | Déconnexion |

---

## Utilisateur

| Méthode | Route | Handler | Description |
|---|---|---|---|
| `GET` | `/user/profile` | `user.js` | Profil courant |
| `PUT` | `/user/profile` | `user.js` | Met à jour le profil |

---

## Carrousel (admin)

| Méthode | Route | Handler | Description |
|---|---|---|---|
| `GET` | `/carousel` | `orders.js` | Slides du carrousel |
| `PUT` | `/carousel/:id` | `orders.js` | Met à jour un slide |

---

## Admin

| Méthode | Route | Handler | Description |
|---|---|---|---|
| `GET` | `/admin/dashboard` | `orders.js` | KPIs : CA, commandes, ventes/jour, ventes/catégorie |
