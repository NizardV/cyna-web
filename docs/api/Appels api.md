# Faire un appel API

## Principe général

Tous les appels réseau passent par le singleton `apiClient` défini dans `src/api/client.js`. Ce client intercepte automatiquement les requêtes en mode mock et injecte le token JWT en mode réel.

```
Composant React
    └── fonction métier (ex. getProducts)    ← src/api/products.js
            └── apiClient.get("/products")    ← src/api/client.js
                    ├── mock activé → MockRegistry
                    └── mock désactivé → fetch() vers le vrai backend
```

---

## Méthodes disponibles

```js
apiClient.get(path, { params?, mock? })
apiClient.post(path, body, { params?, mock? })
apiClient.put(path, body, { params?, mock? })
apiClient.patch(path, body, { params?, mock? })
apiClient.delete(path, { params?, mock? })
```

### Paramètres communs

| Paramètre | Type | Description |
|-----------|------|-------------|
| `path` | `string` | Chemin de la route, peut contenir des segments `:param` |
| `params` | `object` | Valeurs à injecter dans le chemin (ex. `{ id: "abc" }`) |
| `mock` | `boolean` | Surcharge le flag global `VITE_MOCK_API` pour cet appel uniquement |

---

## Créer un module API

Chaque ressource de l'API a son propre fichier dans `src/api/`. Ce fichier expose des fonctions métier nommées explicitement — jamais l'`apiClient` directement dans les composants.

```js
// src/api/products.js
import { apiClient } from "./client.js"

// Récupérer tous les produits
export const getProducts = () =>
  apiClient.get("/products")

// Récupérer un produit par son ID
export const getProduct = (id) =>
  apiClient.get("/products/:id", { params: { id } })

// Créer un produit (admin)
export const createProduct = (dto) =>
  apiClient.post("/products", dto)

// Mettre à jour un produit (admin)
export const updateProduct = (id, dto) =>
  apiClient.put("/products/:id", dto, { params: { id } })

// Supprimer un produit (admin)
export const deleteProduct = (id) =>
  apiClient.delete("/products/:id", { params: { id } })
```

---

## Utiliser les fonctions dans un composant

### Avec `useEffect` (chargement initial)

```jsx
import { useState, useEffect } from "react"
import { getProducts } from "@/api/products.js"

export function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Chargement…</p>
  if (error) return <p>Erreur : {error.message}</p>
  return <ul>{products.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
}
```

### Avec un gestionnaire d'événement (action utilisateur)

```jsx
import { deleteProduct } from "@/api/products.js"

export function ProductRow({ product, onDeleted }) {
  const handleDelete = async () => {
    try {
      await deleteProduct(product.id)
      onDeleted(product.id)
    } catch (err) {
      console.error("Suppression échouée :", err.message)
    }
  }

  return (
    <tr>
      <td>{product.name}</td>
      <td><button onClick={handleDelete}>Supprimer</button></td>
    </tr>
  )
}
```

---

## Gestion des erreurs

`apiClient` lève une `ApiError` pour toute réponse HTTP non-2xx :

```js
import { ApiError } from "@/api/client.js"

try {
  const data = await getProduct("id-inconnu")
} catch (err) {
  if (err instanceof ApiError) {
    console.log(err.status)   // ex. 404
    console.log(err.message)  // ex. "Product not found"
  }
}
```

---

## Authentification

Le token JWT est lu automatiquement depuis `localStorage` à chaque requête :

```js
// Stockage du token après login
localStorage.setItem("cyna_token", data.token)

// L'apiClient lit et injecte le token automatiquement :
// Authorization: Bearer <token>
```

Aucune configuration supplémentaire n'est nécessaire dans les fonctions API.

---

## Forcer le mode réel sur un appel spécifique

Même si `VITE_MOCK_API=true`, il est possible de bypasser le mock pour un appel précis :

```js
// Toujours appeler le vrai backend, même en mode mock
const data = await apiClient.get("/products", { mock: false })
```

Inversement, forcer le mock même si `VITE_MOCK_API=false` :

```js
const data = await apiClient.get("/products", { mock: true })
```

---

## Règles à respecter

- Ne jamais importer `apiClient` directement dans un composant — toujours passer par une fonction métier dans `src/api/`
- Typer les DTOs en TypeScript pour les nouveaux modules (`.ts`)
- Toujours gérer les états `loading` et `error` dans le composant
- Préférer les hooks personnalisés (`useProducts`, `useCart`…) pour la logique réutilisable