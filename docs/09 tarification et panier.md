# Tarification et panier

## Vue d'ensemble

```
PricingPlan (backend)
    └── pricingTiers[]       ← paliers par unité (user / device)
            ├── unitType: "user" | "device"
            ├── minQty / maxQty
            └── unitPrice
                    │
                    ▼
          findTier(tiers, qty) ← src/lib/pricing-utils.js
                    │
          unitPrice × qty = coût par axe
                    │
          totalPrice = coût users + coût devices
                    │
          isQuoteRequired = qty > maxUsersCheckout || qty > maxDevicesCheckout
```

---

## Structure de données — PricingPlan

```js
// PricingPlanDto (tel que retourné par l'API)
{
  id:                   number,
  billingPeriod:        "monthly" | "yearly" | "lifetime",
  discountPercent:      number,     // 0–100, appliqué sur les paliers
  maxUsersCheckout:     number,     // seuil au-delà duquel → devis
  maxDevicesCheckout:   number,     // idem pour devices
  pricingTiers: [
    { unitType: "user",   minQty: 1,  maxQty: 10,  unitPrice: 12.5 },
    { unitType: "user",   minQty: 11, maxQty: 50,  unitPrice: 10.0 },
    { unitType: "user",   minQty: 51, maxQty: 999, unitPrice: 8.0  },
    { unitType: "device", minQty: 1,  maxQty: 10,  unitPrice: 5.0  },
    { unitType: "device", minQty: 11, maxQty: 50,  unitPrice: 4.0  },
  ]
}
```

---

## `BillingPeriod` et `UnitType`

```js
// src/lib/pricing-utils.js
export const BillingPeriod = Object.freeze({
  MONTHLY:  "monthly",
  YEARLY:   "yearly",
  LIFETIME: "lifetime",
})

export const UnitType = Object.freeze({
  USER:   "user",
  DEVICE: "device",
})
```

---

## `findTier()` — calcul du palier actif

```js
/**
 * Trouve le palier tarifaire correspondant à une quantité donnée.
 * Retourne null si aucun palier ne couvre la quantité.
 *
 * @param {PricingTier[]} tiers  — filtrés par unitType
 * @param {number}        qty
 * @returns {PricingTier | null}
 */
export function findTier(tiers, qty) {
  return tiers.find(t => qty >= t.minQty && qty <= t.maxQty) ?? null
}
```

Exemple :

```js
const userTiers = plan.pricingTiers.filter(t => t.unitType === "user")
const tier = findTier(userTiers, 15)
// qty=15 → palier { minQty: 11, maxQty: 50, unitPrice: 10.0 }
// coût users = 15 × 10.0 = 150 €
```

---

## Calcul du prix total (page produit)

```js
// src/pages/product.jsx — calculé à chaque changement de quantité ou de plan
const userTiers   = currentPlan?.pricingTiers?.filter(t => t.unitType === "user")   ?? []
const deviceTiers = currentPlan?.pricingTiers?.filter(t => t.unitType === "device") ?? []

const tierUser   = findTier(userTiers,   quantityUsers)
const tierDevice = findTier(deviceTiers, quantityDevices)

const costUsers   = tierUser   ? tierUser.unitPrice   * quantityUsers   : 0
const costDevices = tierDevice ? tierDevice.unitPrice * quantityDevices : 0

const totalPrice = costUsers + costDevices

const isQuoteRequired =
  (userTiers.length > 0   && quantityUsers   > currentPlan.maxUsersCheckout)   ||
  (deviceTiers.length > 0 && quantityDevices > currentPlan.maxDevicesCheckout) ||
  (!tierUser && userTiers.length > 0) ||
  (!tierDevice && deviceTiers.length > 0)
```

Si `isQuoteRequired = true` : affiche le bouton "Demander un devis" → `/contact` au lieu du bouton panier.

---

## Panier — `api/cart.js` (localStorage)

Le panier est stocké localement dans `localStorage` (clé `cyna_cart`). Aucun appel API n'est effectué pour la gestion du panier — les données sont envoyées au backend uniquement au moment du checkout.

```js
// src/api/cart.js — fonctions disponibles

getCart()                          // → CartItem[]
addToCart(item)                    // ajoute ou fusionne
updateCartItem(id, changes)        // met à jour quantités/prix
removeFromCart(id)                 // retire un article
clearCart()                        // vide le panier
getCartTotal()                     // → number (somme des totalPrice)
getCartCount()                     // → number (nombre d'articles)
```

### Structure d'un article du panier

```js
// CartItem
{
  id:               string,          // uuid généré au moment de l'ajout
  productId:        number,
  productName:      string,          // snapshot au moment de l'ajout
  imageUrl:         string,
  pricingPlanId:    number,
  billingPeriod:    "monthly" | "yearly" | "lifetime",
  pricingTiers:     PricingTier[],   // snapshot complet — pour recalcul dans le panier
  maxUsersCheckout: number,
  maxDevicesCheckout: number,
  quantityUsers:    number,
  quantityDevices:  number,
  unitPriceUsers:   number,          // prix unitaire au moment de l'ajout
  unitPriceDevices: number,
  totalPrice:       number,          // calculé = unitPriceUsers×qtyUsers + unitPriceDevices×qtyDevices
}
```

---

## Flux complet — Product → Cart → Checkout

```
1. Page produit (/products/:id)
    │
    │  Utilisateur :
    │  a. Sélectionne billingPeriod (monthly / yearly / lifetime)
    │  b. Ajuste quantityUsers et quantityDevices
    │  c. Voit le prix total mis à jour en temps réel
    │
    │  Clic "S'abonner"
    ▼
addToCart({
  productId, productName, imageUrl,
  pricingPlanId, billingPeriod,
  pricingTiers,                  ← snapshot
  maxUsersCheckout, maxDevicesCheckout,
  quantityUsers, quantityDevices,
  unitPriceUsers, unitPriceDevices,
  totalPrice
})
    │
    └─ localStorage["cyna_cart"] = [...items]
    │
    navigate("/cart")

2. Page panier (/cart)
    │
    │  Affiche CartRow pour chaque item
    │  CartRow : compteurs +/- → updateCartItem()
    │    → findTier(item.pricingTiers, newQty) → recalcul live
    │
    │  CartSummary : total de tous les articles
    │
    │  Clic "Passer à la caisse" → navigate("/checkout")

3. Page checkout (/checkout)
    │
    │  Récapitulatif + formulaire adresse
    │
    │  Clic "Confirmer" →
    POST /orders {
      items: getCart(),
      address: { … },
      total: getCartTotal()
    }
    │
    ├─ 201 → clearCart() + navigate("/order-confirmation")
    └─ Erreur → toast.error(message)
```

---

## `pricingPlansToState` — formulaire admin

Lors du chargement d'un produit en édition dans le backoffice admin, les plans API sont convertis vers l'état du formulaire :

```js
// src/lib/pricing-utils.js
export function pricingPlansToState(plans = []) {
  const state = defaultPricingState()  // { monthly: { enabled: false, … }, … }
  for (const plan of plans) {
    const period = plan.billingPeriod
    state[period] = {
      enabled:     true,
      userTiers:   plan.pricingTiers.filter(t => t.unitType === "user")
                     .map(({ maxQty, unitPrice }) => ({ maxQty, unitPrice })),
      deviceTiers: plan.pricingTiers.filter(t => t.unitType === "device")
                     .map(({ maxQty, unitPrice }) => ({ maxQty, unitPrice })),
    }
  }
  return state
}
```

Et inversement, à la soumission :

```js
export function stateToPricingPlans(state) {
  return ["monthly", "yearly", "lifetime"]
    .filter(key => state[key].enabled)
    .map(key => ({
      name:               PLAN_NAMES[key],   // "Mensuel" / "Annuel" / "Définitif"
      billingPeriod:      key,
      discountPercent:    0,
      maxUsersCheckout:   Math.max(...state[key].userTiers.map(t => t.maxQty)) || 999,
      maxDevicesCheckout: Math.max(...state[key].deviceTiers.map(t => t.maxQty)) || 999,
      pricingTiers: [
        ...state[key].userTiers.map((t, i) => ({
          unitType: "user",
          minQty: computeMin(state[key].userTiers, i),
          maxQty: Number(t.maxQty),
          unitPrice: Number(t.unitPrice),
        })),
        ...state[key].deviceTiers.map((t, i) => ({
          unitType: "device",
          minQty: computeMin(state[key].deviceTiers, i),
          maxQty: Number(t.maxQty),
          unitPrice: Number(t.unitPrice),
        })),
      ]
    }))
}
```

---

## Règles de validation des paliers (`computeMin`)

Les paliers sont définis avec uniquement `maxQty` dans le formulaire. Le `minQty` est calculé automatiquement :

```js
export const computeMin = (tiers, i) =>
  i === 0 ? 1 : (Number(tiers[i - 1].maxQty) || 0) + 1

// tiers = [{ maxQty: 10 }, { maxQty: 50 }, { maxQty: 999 }]
// computeMin(tiers, 0) = 1
// computeMin(tiers, 1) = 11
// computeMin(tiers, 2) = 51
```