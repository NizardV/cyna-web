# Lier l'API et le mock

## Vue d'ensemble

Le système mock repose sur une correspondance exacte entre les routes définies dans `src/api/` et les handlers définis dans `src/mocks/handlers/`. Quand le mode mock est actif, chaque appel `apiClient.get("/products")` est intercepté avant d'atteindre le réseau et redirigé vers le handler correspondant.

```
apiClient.get("/products")
    │
    ├── VITE_MOCK_API=true
    │       └── MockRegistry.getHandlers()
    │               └── handler { method: "GET", path: "/products" }
    │                       └── resolver() → données Faker
    │
    └── VITE_MOCK_API=false
            └── fetch("http://localhost:5000/api/products")
```

---

## Correspondance route ↔ handler

Pour qu'un appel soit intercepté, il faut qu'un handler avec **la même méthode et le même chemin** soit enregistré dans le registry.

| Appel API | Handler attendu |
|-----------|----------------|
| `apiClient.get("/products")` | `{ method: "GET", path: "/products" }` |
| `apiClient.get("/products/:id", { params: { id } })` | `{ method: "GET", path: "/products/:id" }` |
| `apiClient.post("/auth/login", body)` | `{ method: "POST", path: "/auth/login" }` |
| `apiClient.delete("/cart/:id", { params: { id } })` | `{ method: "DELETE", path: "/cart/:id" }` |

Si aucun handler ne correspond, l'appel passe en mode dégradé (silencieux) et retourne `null` en mode mock, ou tente le vrai réseau en mode réel.

---

## Cycle de vie complet — exemple produit

### 1. Fonction API (`src/api/products.js`)

```js
export const getProduct = (id) =>
  apiClient.get("/products/:id", { params: { id } })
```

### 2. Handler mock (`src/mocks/handlers/products.js`)

```js
let _products = makeMany(12, makeProduct)

export const productHandlers = [
  {
    method: "GET",
    path: "/products/:id",
    resolver: ({ params }) => {
      return _products.find((p) => p.id === params.id) ?? null
    },
  },
]
```

### 3. Enregistrement (`src/mocks/index.js`)

```js
import { productHandlers } from "./handlers/products.js"

mockRegistry.registerMany([
  ...productHandlers,
])
```

### 4. Utilisation dans un composant

```jsx
import { getProduct } from "@/api/products.js"

useEffect(() => {
  getProduct("abc-123").then(setProduct)
}, [])
```

Le composant ne sait pas si la réponse vient du mock ou du backend réel.

---

## Ajouter une nouvelle route — procédure complète

Exemple : ajouter une route `GET /notifications`.

**Étape 1 — Créer le handler**

```js
// src/mocks/handlers/notifications.js
import { faker } from "@faker-js/faker"
import { makeMany } from "../factories/factories.js"

function makeNotification(overrides = {}) {
  return {
    id: faker.string.uuid(),
    message: faker.lorem.sentence(),
    read: false,
    createdAt: faker.date.recent().toISOString(),
    ...overrides,
  }
}

const _notifications = makeMany(5, makeNotification)

export const notificationHandlers = [
  {
    method: "GET",
    path: "/notifications",
    resolver: () => _notifications,
  },
  {
    method: "POST",
    path: "/notifications/:id/read",
    resolver: ({ params }) => {
      const n = _notifications.find((n) => n.id === params.id)
      if (n) n.read = true
      return n
    },
  },
]
```

**Étape 2 — Enregistrer dans le registry**

```js
// src/mocks/index.js
import { notificationHandlers } from "./handlers/notifications.js"

mockRegistry.registerMany([
  // ... handlers existants
  ...notificationHandlers,
])
```

**Étape 3 — Créer la fonction API**

```js
// src/api/notifications.js
import { apiClient } from "./client.js"

export const getNotifications = () =>
  apiClient.get("/notifications")

export const markAsRead = (id) =>
  apiClient.post("/notifications/:id/read", null, { params: { id } })
```

**Étape 4 — Utiliser dans un composant**

```jsx
import { getNotifications, markAsRead } from "@/api/notifications.js"
```

---

## Déboguer le mock

### Vérifier les routes enregistrées

En mode développement, la liste des routes mockées est affichée dans la console au démarrage :

```
[Mock] Registered routes
  GET     /products
  GET     /products/:id
  POST    /products
  ...
```

### Un appel n'est pas intercepté

Causes fréquentes :
1. Le handler n'est pas enregistré dans `src/mocks/index.js`
2. Le chemin du handler ne correspond pas exactement au chemin de l'appel (`/product` vs `/products`)
3. La méthode HTTP est différente (`POST` vs `PUT`)
4. `VITE_MOCK_API` n'est pas à `"true"` dans `.env.local`

### Vérifier `.env.local`

```bash
cat .env.local
# VITE_MOCK_API=true
# VITE_API_URL=http://localhost:5000/api
# VITE_MOCK_DELAY=400
```

Le fichier `.env.local` n'est pas versionné (voir `.gitignore`). Copier `.env.example` pour le créer :

```bash
cp .env.example .env.local
```

---

## Passer du mock au vrai backend

Quand le backend .NET est disponible, désactiver le mock en une seule ligne :

```bash
# .env.local
VITE_MOCK_API=false
VITE_API_URL=http://localhost:5000/api
```

Aucune modification du code applicatif n'est nécessaire — le switch est transparent.