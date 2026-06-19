# Handlers mock — simuler les routes API

## Rôle

Un handler mock est un objet qui décrit comment répondre à une requête HTTP interceptée. Il remplace le vrai endpoint backend pendant le développement frontend.

Les handlers sont regroupés par domaine dans `src/mocks/handlers/` et enregistrés dans le `MockRegistry` via `src/mocks/index.js`.

---

## Structure d'un handler

```js
{
  method: "GET",            // Méthode HTTP
  path: "/products/:id",   // Chemin avec paramètres optionnels
  resolver: ({ params, body }) => { ... },  // Fonction qui retourne la réponse
  status: 200,             // Code HTTP (optionnel, 200 par défaut)
}
```

### Champs détaillés

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `method` | `string` | ✅ | `GET`, `POST`, `PUT`, `DELETE`, `PATCH` |
| `path` | `string` | ✅ | Chemin exact ou avec segments `:param` |
| `resolver` | `function \| value` | ✅ | Données à retourner, ou fonction qui les calcule |
| `status` | `number` | ❌ | Code HTTP de réponse (défaut : `200`) |

---

## Exemples de handlers

### GET simple

```js
{
  method: "GET",
  path: "/products",
  resolver: () => _products,   // Retourne le tableau en mémoire
}
```

### GET avec paramètre d'URL

```js
{
  method: "GET",
  path: "/products/:id",
  resolver: ({ params }) => {
    return _products.find((p) => p.id === params.id) ?? null
  },
}
```

`params` contient les segments dynamiques extraits de l'URL. Pour `/products/abc-123`, `params.id` vaut `"abc-123"`.

### POST — créer une ressource

```js
{
  method: "POST",
  path: "/products",
  resolver: ({ body }) => {
    const product = makeProduct({ ...body })
    _products.push(product)
    return product
  },
  status: 201,   // 201 Created
}
```

`body` contient l'objet envoyé par le client.

### PUT — mettre à jour

```js
{
  method: "PUT",
  path: "/products/:id",
  resolver: ({ params, body }) => {
    const index = _products.findIndex((p) => p.id === params.id)
    if (index === -1) return null
    _products[index] = { ..._products[index], ...body }
    return _products[index]
  },
}
```

### DELETE — supprimer

```js
{
  method: "DELETE",
  path: "/products/:id",
  resolver: ({ params }) => {
    _products = _products.filter((p) => p.id !== params.id)
    return null
  },
  status: 204,   // 204 No Content
}
```

---

## Store en mémoire

Pour que les mutations (POST, PUT, DELETE) persistent pendant la session, les données sont stockées dans des variables de module (`let _products = ...`). Elles sont réinitialisées à chaque rechargement de page.

```js
// Initialisation avec des données générées par Faker
let _products = makeMany(12, makeProduct)

export const productHandlers = [
  {
    method: "GET",
    path: "/products",
    resolver: () => _products,
  },
  {
    method: "DELETE",
    path: "/products/:id",
    resolver: ({ params }) => {
      _products = _products.filter((p) => p.id !== params.id)
      return null
    },
    status: 204,
  },
]
```

---

## Organiser les handlers par domaine

Chaque fichier de handlers exporte un ou plusieurs tableaux nommés :

```
src/mocks/handlers/
├── products.js    → productHandlers
├── auth.js        → authHandlers
└── orders.js      → orderHandlers, cartHandlers, subscriptionHandlers, ...
```

Regrouper les handlers liés dans le même fichier. Si un fichier dépasse ~150 lignes, le découper par sous-domaine.

---

## Enregistrement dans le registry

Tous les handlers doivent être enregistrés dans `src/mocks/index.js` pour être actifs :

```js
import { mockRegistry } from "./registry.js"
import { productHandlers } from "./handlers/products.js"
import { authHandlers } from "./handlers/auth.js"

mockRegistry.registerMany([
  ...productHandlers,
  ...authHandlers,
])
```

Pour vérifier les routes enregistrées, ouvrez la console du navigateur en mode développement — la liste est affichée au démarrage.

---

## Ajouter un nouveau handler

1. Identifier la méthode et le chemin de la route à simuler
2. Créer ou ouvrir le fichier de handlers du domaine concerné
3. Ajouter le handler dans le tableau exporté
4. L'enregistrer dans `src/mocks/index.js` si le tableau n'y est pas encore

```js
// src/mocks/handlers/notifications.js
import { faker } from "@faker-js/faker"

let _notifications = []

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
      const notif = _notifications.find((n) => n.id === params.id)
      if (notif) notif.read = true
      return notif
    },
  },
]
```

```js
// src/mocks/index.js — ajouter la ligne :
import { notificationHandlers } from "./handlers/notifications.js"

mockRegistry.registerMany([
  // ... handlers existants
  ...notificationHandlers,
])
```