# Factories mock — générer des données avec Faker

## Rôle

Les factories sont des fonctions qui génèrent des objets de données réalistes pour les mocks. Elles utilisent la bibliothèque `@faker-js/faker` pour produire des valeurs aléatoires mais cohérentes (noms, emails, UUID, prix…).

Elles se trouvent dans `src/mocks/factories/factories.js`.

---

## Pourquoi des factories ?

Sans factory :
```js
// Fastidieux, fragile, pas réaliste
const product = { id: "1", name: "Produit test", priceMonthly: 99 }
```

Avec factory :
```js
// Réaliste, cohérent avec le vrai DTO, facile à surcharger
const product = makeProduct()
// → { id: "a3f2...", name: "Cyna EDR Pro", priceMonthly: 247.50, ... }
```

---

## Structure d'une factory

Chaque factory suit le même patron :

```js
export function makeProduct(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    priceMonthly: faker.number.float({ min: 49, max: 999, fractionDigits: 2 }),
    isAvailable: true,
    // ... autres champs
    ...overrides,   // ← surcharge les valeurs par défaut
  }
}
```

Le paramètre `overrides` permet de fixer certains champs tout en laissant Faker générer le reste :

```js
// Créer un produit indisponible spécifiquement
const produit = makeProduct({ isAvailable: false, priceMonthly: 0 })
```

---

## Utilitaire `makeMany`

Pour générer une liste d'objets :

```js
export function makeMany(n, factory) {
  return Array.from({ length: n }, factory)
}
```

Utilisation :

```js
// 12 produits générés aléatoirement
const products = makeMany(12, makeProduct)

// 3 utilisateurs avec le rôle admin
const admins = makeMany(3, () => makeUser({ role: "admin" }))
```

---

## Factories disponibles

### `makeUser(overrides?)`

Génère un utilisateur correspondant au DTO de l'API :

```js
{
  id: "uuid",
  email: "jean.dupont@example.com",
  name: "Jean Dupont",
  role: "user",
  isConfirmed: true,
  is2faEnabled: false,
  createdAt: "2024-03-15T10:22:00.000Z"
}
```

### `makeProduct(overrides?)`

Génère un produit SaaS avec specs techniques :

```js
{
  id: "uuid",
  categoryId: "uuid",
  name: "Cyna EDR Pro",
  priceMonthly: 247.50,
  priceYearly: 2475.00,   // 2 mois offerts
  isAvailable: true,
  technicalSpecs: {
    platforms: ["Windows", "Linux"],
    sla: "98% uptime",
    maxDevices: 450
  }
}
```

### `makeCategory(overrides?)`

Génère une catégorie de produit (SOC, EDR, XDR, SIEM…).

### `makeOrder(overrides?)`

Génère une commande avec ses lignes (`items`), son adresse et son statut.

### `makeSubscription(overrides?)`

Génère un abonnement actif, annulé ou expiré.

### `makeAddress(overrides?)`

Génère une adresse de facturation complète.

### `makePaymentMethod(overrides?)`

Génère une référence Stripe (jamais de vraies données bancaires).

### `makeCarouselItem(overrides?)`

Génère un élément de carrousel pour la page d'accueil.

### `makeAuthResponse(userOverrides?)`

Génère la réponse d'un login réussi :

```js
{
  token: "eyJ.abc123...mock",
  user: { ... }
}
```

---

## Ajouter une nouvelle factory

1. Identifier les champs du DTO côté API .NET
2. Mapper chaque champ sur un générateur Faker adapté :

```js
// Référence rapide des générateurs Faker les plus utiles
faker.string.uuid()                          // ID unique
faker.internet.email()                       // email
faker.person.fullName()                      // nom complet
faker.lorem.sentence()                       // texte court
faker.lorem.paragraphs(2)                    // texte long
faker.number.int({ min: 1, max: 100 })       // entier
faker.number.float({ min: 0, max: 999, fractionDigits: 2 }) // décimal
faker.date.past().toISOString()              // date passée
faker.datatype.boolean()                     // true/false
faker.helpers.arrayElement(["a", "b", "c"]) // valeur aléatoire dans un tableau
faker.helpers.arrayElements(arr, 3)          // 3 valeurs aléatoires
```

3. Exporter la factory depuis `factories.js` et l'utiliser dans les handlers.

---

## Seed déterministe (optionnel)

Pour des tests reproductibles, Faker peut être initialisé avec une graine fixe :

```js
import { faker } from "@faker-js/faker"

faker.seed(12345)
// Les données générées seront toujours identiques avec cette graine
const user = makeUser()
```

Utile pour les tests unitaires ou les captures d'écran de documentation.