# Mock et données de test

## Vue d'ensemble

```
VITE_MOCK_API=true
    │
main.tsx → import("./mocks/index.js")   ← chargé avant tout premier rendu
    │
mocks/index.js
    └─ mockRegistry.registerMany(authHandlers)
    └─ mockRegistry.registerMany(productHandlers)
    └─ mockRegistry.registerMany(orderHandlers)
    └─ mockRegistry.registerMany(homeHandlers)
    └─ mockRegistry.registerMany(adminUserHandlers)
    │
ApiClient.get/post/…()
    └─ interceptMock(method, path, body)
            └─ MockRegistry.getHandlers()
                    └─ match → resolver({ params, body })
                                    └─ Store / Factories
```

Le système mock est **entièrement en mémoire** — aucune requête réseau ne part quand `VITE_MOCK_API=true`. Les données sont générées par `@faker-js/faker` au démarrage et partagées entre tous les handlers via `store.js`.

---

## MockRegistry

```js
// src/mocks/registry.js
class MockRegistry {
  register(handler)         // enregistre un handler
  registerMany(handlers[])  // enregistre plusieurs handlers
  getHandlers()             // retourne la liste ordonnée
  clear()                   // efface tout (utile en test)
  listRoutes()              // retourne "GET    /products" × N (debug)
}

export const mockRegistry = new MockRegistry()
```

### Structure d'un handler

```js
/**
 * @typedef {Object} MockHandler
 * @property {"GET"|"POST"|"PUT"|"DELETE"|"PATCH"} method
 * @property {string} path   — supporte les segments :param  ex: "/products/:id"
 * @property {Function|unknown} resolver
 *   — Function : appelée avec ({ params, body }) → retourne les données mock
 *   — Valeur directe : retournée telle quelle
 * @property {number} [status]   — code HTTP (défaut 200)
 */
```

---

## Store — source unique de vérité

```js
// src/mocks/store.js
export const _categories = makeMany(6, makeCategory)

export const _products = makeMany(40, () =>
  makeProduct({ categoryId: faker.helpers.arrayElement(_categories).id })
)

export const _adminUsers = [
  // SuperAdmin — 2FA déjà activé
  makeUser({ id: 1, email: "superadmin@cyna.fr", role: "SuperAdmin", hasTwoFactor: true }),

  // Admin — 2FA non configuré (bootstrap)
  makeUser({ id: 2, email: "admin@cyna.fr", role: "Admin", hasTwoFactor: false }),

  // 8 utilisateurs standard (générés automatiquement)
  ...makeMany(8, (_, i) => makeUser({ id: 100 + i, role: "User" })),
]
```

Tous les handlers importent depuis `store.js` pour garantir la cohérence des IDs entre les routes (ex : un produit référencé dans une commande aura le même ID que dans `/products`).

---

## Factories

```js
// src/mocks/factories/factories.js
// Fonctions pures — aucun état

makeMany(n, factory)          // génère n éléments
makeUser(overrides?)          // → UserProfileDto
makeCategory(overrides?)      // → CategoryDto (avec translations FR/EN)
makeProduct(overrides?)       // → ProductDto + pricingPlans + images
makeOrderItem(overrides?)     // → OrderItemDto
makeSubscription(overrides?)  // → SubscriptionDto
makeOrder(overrides?)         // → OrderSummaryDto
makeCarouselItem(overrides?)  // → CarouselItemDto
makeAuthResponse(overrides?)  // → { token, user }
makeAddress(overrides?)       // → AddressDto
makePaymentMethod(overrides?) // → PaymentMethodDto
```

### Exemple — makeProduct

```js
makeProduct({ categoryId: "abc" })
// →
{
  id: 42,
  name: "Cyna EDR Pro",
  descriptionFr: "…",
  descriptionEn: "…",
  status: "Available",           // Available | Unavailable | OutOfStock | Preview
  categoryId: "abc",
  isFeatured: false,
  imageUrl: "https://picsum.photos/seed/…/800/400",
  images: ["…", "…"],
  displayOrder: 3,
  technicalSpecs: ["Agent léger", "Détection comportementale", …],
  pricingPlans: [
    {
      id: 1,
      billingPeriod: "monthly",
      discountPercent: 0,
      maxUsersCheckout: 100,
      maxDevicesCheckout: 100,
      pricingTiers: [
        { unitType: "user",   minQty: 1,  maxQty: 10,  unitPrice: 12.5 },
        { unitType: "user",   minQty: 11, maxQty: 50,  unitPrice: 10.0 },
        { unitType: "device", minQty: 1,  maxQty: 10,  unitPrice: 8.0 },
      ]
    },
    { billingPeriod: "yearly", … },
  ]
}
```

---

## Handlers — référence complète

### `handlers/auth.js`

| Méthode | Route | Comportement |
|---------|-------|-------------|
| `POST` | `/auth/login` | Vérifie email + `"password"`. Retourne token + user. 401 si inconnu/désactivé. |
| `POST` | `/auth/register` | Crée user dans `_registeredUsers`. Retourne `{ message }`. |
| `POST` | `/auth/refresh` | Retourne 200 si session active. |
| `POST` | `/auth/logout` | Vide `_sessions`. Retourne 204. |
| `GET` | `/auth/me` | Retourne l'user de la session mock courante. 401 si absent. |
| `POST` | `/auth/forgot-password` | Log dans la console. Retourne 204. |
| `POST` | `/auth/reset-password` | Vérifie code `"123456"`. Retourne `{ message }` ou 400. |
| `POST` | `/auth/confirm-email` | Vérifie code `"654321"`. Retourne `{ message }` ou 400. |
| `POST` | `/auth/admin/login` | Voir flux 2FA. Bootstrap, phase 1, phase 2. |
| `POST` | `/auth/2fa/setup` | Retourne `{ secret: "MOCK…", otpAuthUrl: "otpauth://…" }`. |
| `POST` | `/auth/2fa/confirm` | Accepte n'importe quel code. Retourne 200. |

### `handlers/products.js`

| Méthode | Route | Comportement |
|---------|-------|-------------|
| `GET` | `/products` | Retourne `_products`. |
| `GET` | `/products/:id` | Cherche dans `_products` par id (converti en nombre). |
| `GET` | `/products/similar/:id` | 6 produits aléatoires depuis `_products`. |
| `POST` | `/products` | Ajoute dans `_products`. Retourne le produit créé. |
| `PUT` | `/products/:id` | Met à jour dans `_products`. |
| `DELETE` | `/products/:id` | Retire de `_products`. Retourne 204. |

### `handlers/orders.js`

| Méthode | Route | Comportement |
|---------|-------|-------------|
| `GET` | `/catalog/products` | Filtrage par `q`, `categoryIds`, `sortBy`, pagination. |
| `GET` | `/categories` | Retourne `_categories` paginées + triées. |
| `GET` | `/categories/:id` | Cherche par id. |
| `GET` | `/home/featured` | 6 produits `isFeatured=true`. |
| `GET` | `/home/carousel` | 4 slides carousel. |
| `GET` | `/orders` | Liste de commandes générées. |
| `POST` | `/orders` | Crée une commande. |
| `GET` | `/account/orders` | Commandes de l'utilisateur courant. |
| `GET` | `/subscriptions` | Abonnements actifs. |
| `GET` | `/admin/dashboard` | KPIs : `{ revenue, orders, salesPerDay, salesPerCategory }`. |

### `handlers/admin-users.js`

| Méthode | Route | Comportement |
|---------|-------|-------------|
| `GET` | `/admin/users` | Retourne `_adminUsers`. |
| `PUT` | `/admin/users/:id/role` | Met à jour le rôle dans `_adminUsers`. |
| `PUT` | `/admin/users/:id/disable` | Passe `isDisabled=true`. |
| `PUT` | `/admin/users/:id/enable` | Passe `isDisabled=false`. |

---

## Écrire un handler mock

### Handler simple (GET statique)

```js
{
  method: "GET",
  path: "/notifications",
  resolver: () => makeMany(5, makeNotification),
}
```

### Handler avec paramètre de chemin

```js
{
  method: "GET",
  path: "/products/:id",
  resolver: ({ params }) => {
    const product = _products.find(p => p.id === Number(params.id))
    if (!product) throw Object.assign(new Error("Produit introuvable"), { status: 404 })
    return product
  },
}
```

### Handler avec body

```js
{
  method: "POST",
  path: "/categories",
  resolver: ({ body }) => {
    if (_categories.find(c => c.slug === body.slug)) {
      throw Object.assign(new Error("Slug déjà utilisé"), { status: 409 })
    }
    const newCat = { id: faker.number.int(), ...body }
    _categories.push(newCat)
    return newCat
  },
}
```

### Handler avec statut custom

```js
{
  method: "DELETE",
  path: "/subscriptions/:id",
  status: 204,
  resolver: ({ params }) => {
    const idx = _subscriptions.findIndex(s => s.id === Number(params.id))
    if (idx === -1) throw Object.assign(new Error("Introuvable"), { status: 404 })
    _subscriptions.splice(idx, 1)
    return null
  },
}
```

### Lancer une erreur HTTP depuis un handler

```js
// Syntaxe — erreur avec statut
throw Object.assign(new Error("Message d'erreur"), { status: 401 })

// Erreur avec data supplémentaire (lue par ApiError.data)
throw Object.assign(
  new Error("Code TOTP invalide"),
  { status: 401, data: { totpRequired: true } }
)
```

---

## Données de test — comptes disponibles

| Email | Password | Rôle | 2FA | Notes |
|-------|----------|------|-----|-------|
| `superadmin@cyna.fr` | `password` | Super Administrateur | ✅ | Connexion complète 2FA |
| `admin@cyna.fr` | `password` | Administrateur | ❌ | Bootstrap → redirect 2FA setup |
| *tout email* | `password` | User | — | Compte créé dynamiquement par `/register` |

### Codes OTP fixes

| Flux | Code |
|------|------|
| Reset mot de passe | `123456` |
| Confirmation email | `654321` |
| Code TOTP admin (phase 2) | `000000` |

---

## Ajouter des données mock — procédure

### 1. Factory (si nouveaux types de données)

```js
// src/mocks/factories/factories.js
export function makeNotification(overrides = {}) {
  return {
    id: faker.string.uuid(),
    message: faker.lorem.sentence(),
    read: false,
    createdAt: faker.date.recent().toISOString(),
    ...overrides,
  }
}
```

### 2. Store (si données partagées entre handlers)

```js
// src/mocks/store.js
export const _notifications = makeMany(10, makeNotification)
```

### 3. Handlers

```js
// src/mocks/handlers/notifications.js
import { _notifications } from "../store.js"
import { makeNotification } from "../factories/factories.js"

export const notificationHandlers = [
  { method: "GET", path: "/notifications", resolver: () => _notifications },
  {
    method: "PUT",
    path: "/notifications/:id/read",
    resolver: ({ params }) => {
      const n = _notifications.find(n => n.id === params.id)
      if (n) n.read = true
      return n
    },
  },
]
```

### 4. Enregistrement

```js
// src/mocks/index.js
import { notificationHandlers } from "./handlers/notifications.js"
mockRegistry.registerMany(notificationHandlers)
```