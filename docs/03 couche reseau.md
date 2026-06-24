# Couche réseau — ApiClient

## Vue d'ensemble

```
Page / Composant
    └── src/api/*.js              ← fonctions métier par domaine
            └── ApiClient         ← singleton (src/api/client.js)
                    ├── interceptMock()   (VITE_MOCK_API=true)
                    │       └── MockRegistry → handlers → resolver()
                    └── coreFetch()       (VITE_MOCK_API=false)
                            └── fetch() → { credentials: "include" }
                                    → cookie JWT envoyé automatiquement
```

Tous les appels réseau passent par `apiClient`, singleton exporté depuis `src/api/client.js`. Les pages et composants **n'importent jamais `apiClient` directement** — ils passent par les fonctions de domaine dans `src/api/*.js`.

---

## Configuration

```js
// src/api/client.js
const BASE_URL       = import.meta.env.VITE_API_URL ?? "/api"
const MOCK_ENABLED   = import.meta.env.VITE_MOCK_API === "true"
const MOCK_DELAY_MS  = Number(import.meta.env.VITE_MOCK_DELAY ?? 400)
```

| Variable | Rôle |
|----------|------|
| `VITE_API_URL` | URL de base de l'API (ex : `http://localhost:5104`) |
| `VITE_MOCK_API` | Active l'interception mock sur tous les appels |
| `VITE_MOCK_DELAY` | Délai artificiel en ms pour simuler la latence réseau |

---

## API de l'ApiClient

```js
// GET avec paramètres de query
apiClient.get("/categories", { params: { q: "edr", page: 1, pageSize: 5 } })

// GET avec paramètre de chemin (:id)
apiClient.get("/products/:id", { params: { id: "abc-123" } })

// POST avec body JSON
apiClient.post("/auth/login", { email, password })

// PUT
apiClient.put("/categories/:id", payload, { params: { id } })

// DELETE
apiClient.delete("/categories/:id", { params: { id } })

// PATCH
apiClient.patch("/products/:id", body, { params: { id } })

// Surcharge du mode mock par appel
apiClient.get("/products", { mock: true })   // force mock même si VITE_MOCK_API=false
apiClient.get("/products", { mock: false })  // force réseau même si VITE_MOCK_API=true
```

---

## Créer un fichier API de domaine

Chaque ressource métier a son propre fichier dans `src/api/`. Il ne contient que des fonctions pures — aucun état.

```js
// src/api/notifications.js
import { apiClient } from "./client.js"

/**
 * Récupère les notifications de l'utilisateur connecté.
 * @returns {Promise<NotificationDto[]>}
 */
export const getNotifications = () =>
  apiClient.get("/notifications")

/**
 * Marque une notification comme lue.
 * @param {string} id
 */
export const markAsRead = (id) =>
  apiClient.post(`/notifications/${id}/read`, {})

/**
 * Supprime une notification.
 * @param {string} id
 */
export const deleteNotification = (id) =>
  apiClient.delete("/notifications/:id", { params: { id } })
```

---

## Correspondance route / paramètre de chemin

`apiClient` résout les paramètres de chemin (`:param`) automatiquement via `buildUrl()` :

```js
// Pattern : /products/:id
// params : { id: "abc-123" }
// Résultat : /products/abc-123

apiClient.put("/products/:id", body, { params: { id: "abc-123" } })
// → PUT /api/products/abc-123
```

Pour les paramètres de **query string**, passer les mêmes `params` — ils seront ajoutés en `?key=value` si non présents dans le pattern de chemin :

```js
apiClient.get("/categories", { params: { q: "edr", page: 1 } })
// → GET /api/categories?q=edr&page=1
```

Les valeurs `undefined`, `null` et `""` sont ignorées dans le query string.

---

## Gestion des erreurs

### Classe ApiError

```js
// src/api/client.js
export class ApiError extends Error {
  constructor(message, status, data = {}) {
    super(message)
    this.name   = "ApiError"
    this.status = status   // code HTTP (401, 403, 409…)
    this.data   = data     // corps JSON de la réponse d'erreur
  }
}
```

### Pattern de traitement dans une page

```jsx
const [loading, setLoading] = useState(false)
const [error,   setError]   = useState("")

async function handleSubmit() {
  setLoading(true)
  setError("")
  try {
    await createCategory(form)
    toast.success(t("categories.createSuccess"))
    fetchCategories()
  } catch (err) {
    if (err?.status === 409) {
      toast.error(t("categories.slugAlreadyUsed"))
    } else if (err?.status === 403) {
      setError(t("error.forbidden"))
    } else {
      setError(err?.message ?? t("error.generic"))
    }
  } finally {
    setLoading(false)
  }
}
```

### Codes HTTP notables

| Code | Signification | Action habituelle |
|------|--------------|-------------------|
| `204` | No Content | Retour `null` — pas de parse JSON |
| `400` | Bad Request | Afficher `err.message` |
| `401` | Unauthorized | Rediriger vers `/login` ou afficher erreur form |
| `403` | Forbidden | Toast "Accès refusé" |
| `404` | Not Found | Toast "Introuvable" |
| `409` | Conflict | Toast spécifique (slug déjà utilisé, catégorie référencée…) |
| `5xx` | Server error | Toast générique |

---

## Interception mock

Quand `VITE_MOCK_API=true`, chaque appel `apiClient.get/post/…` passe d'abord par `interceptMock()` avant d'atteindre `fetch()` :

```
interceptMock(method, path, body)
    │
    └─ MockRegistry.getHandlers()      ← liste ordonnée des handlers
            │
            for handler of handlers:
              if handler.method !== method → suivant
              params = matchPattern(handler.path, path)
              if params === null → suivant
                    │
              await delay(VITE_MOCK_DELAY)
                    │
              resolver({ params, body }) → data
              return { data, status: handler.status ?? 200 }
            │
    aucun handler trouvé → return null
    → apiClient fall-through vers coreFetch()
```

**Pattern matching** — le matcher `matchPattern` supporte les segments `:param` :

```
pattern : /categories/:id
url     : /categories/42
→ { id: "42" }

pattern : /admin/users/:id/role
url     : /admin/users/5/role
→ { id: "5" }
```

---

## Ajouter une nouvelle ressource — procédure complète

### 1. Fichier API

```js
// src/api/subscriptions.js
import { apiClient } from "./client.js"

export const getSubscriptions = () =>
  apiClient.get("/subscriptions")

export const cancelSubscription = (id) =>
  apiClient.delete("/subscriptions/:id", { params: { id } })
```

### 2. Handler mock

```js
// src/mocks/handlers/subscriptions.js
import { makeMany, makeSubscription } from "../factories/factories.js"

export const subscriptionHandlers = [
  {
    method: "GET",
    path: "/subscriptions",
    resolver: () => makeMany(3, makeSubscription),
  },
  {
    method: "DELETE",
    path: "/subscriptions/:id",
    status: 204,
    resolver: ({ params }) => {
      // suppression dans le store si nécessaire
      return null
    },
  },
]
```

### 3. Enregistrement dans l'index mock

```js
// src/mocks/index.js
import { subscriptionHandlers } from "./handlers/subscriptions.js"
mockRegistry.registerMany(subscriptionHandlers)
```

### 4. Utilisation dans une page

```jsx
import { getSubscriptions, cancelSubscription } from "@/api/subscriptions"

function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([])

  useEffect(() => {
    getSubscriptions().then(setSubscriptions).catch(console.error)
  }, [])

  async function handleCancel(id) {
    await cancelSubscription(id)
    setSubscriptions(s => s.filter(sub => sub.id !== id))
  }
  // …
}
```

---

## Proxy Vite (développement)

```js
// vite.config.ts
server: {
  proxy: {
    "/api": {
      target: "https://localhost:7169",   // backend .NET local
      changeOrigin: true,
      secure: false,                       // ignore le certificat auto-signé
      rewrite: (path) => path.replace(/^\/api/, ""),  // supprime /api du chemin
    }
  }
}
```

Les requêtes `/api/products` → `https://localhost:7169/products`.

> En production, il n'y a pas de proxy — `VITE_API_URL` est baked-in à la compilation via `--build-arg VITE_API_URL=https://api.projet-cyna.fr`.