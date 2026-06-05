# API Panier (localStorage)

`src/api/cart.js`

Le panier est persisté dans `localStorage` sous la clé `cyna_cart`. Toutes les fonctions retournent des `Promise` pour être drop-in compatibles avec de vraies API futures.

---

## Fonctions

### `getCart()`
```ts
getCart(): Promise<CartItem[]>
```
Retourne tous les items du panier.

---

### `addToCart(item)`
```ts
addToCart(item: CartItemInput): Promise<CartItem[]>
```

Si un item avec le même `pricingPlanId` existe déjà → **mise à jour des quantités et prix**.  
Sinon → **ajout** d'un nouvel item avec un UUID généré côté client.

**Paramètres attendus :**

| Champ | Type | Description |
|---|---|---|
| `pricingPlanId` | string | ID du plan choisi |
| `productName` | string | Nom du produit (affiché dans le panier) |
| `billingPeriod` | BillingPeriod | `"monthly"` / `"yearly"` / `"lifetime"` |
| `quantityUsers` | number | Nombre d'utilisateurs |
| `quantityDevices` | number | Nombre d'appareils |
| `unitPriceUsers` | number | Prix/utilisateur au moment de l'ajout (snapshot) |
| `unitPriceDevices` | number | Prix/appareil au moment de l'ajout (snapshot) |
| `pricingTiers` | PricingTier[] | Copie des tiers (pour recalcul en panier) |
| `maxUsersCheckout` | number | Seuil au-delà duquel → devis |
| `maxDevicesCheckout` | number | Seuil au-delà duquel → devis |

---

### `updateCartItem(id, body)`
```ts
updateCartItem(id: string, body: Partial<CartItem>): Promise<CartItem | null>
```
Merge partiel sur l'item identifié par `id`. Utilisé pour mettre à jour les quantités et prix recalculés.

---

### `removeFromCart(id)`
```ts
removeFromCart(id: string): Promise<null>
```
Supprime un item du panier.

---

### `clearCart()`
```ts
clearCart(): Promise<null>
```
Vide entièrement le panier. Appelé après confirmation de commande.

---

## Structure complète d'un CartItem

```json
{
  "id": "uuid-généré-côté-client",
  "pricingPlanId": "plan-uuid-backend",
  "productName": "Cyna EDR Pro",
  "billingPeriod": "monthly",
  "quantityUsers": 3,
  "quantityDevices": 20,
  "unitPriceUsers": 199.00,
  "unitPriceDevices": 23.88,
  "pricingTiers": [
    { "unitType": "user",   "minQty": 1, "maxQty": 5,  "unitPrice": 199.00 },
    { "unitType": "device", "minQty": 1, "maxQty": 50, "unitPrice": 23.88 }
  ],
  "maxUsersCheckout": 10,
  "maxDevicesCheckout": 100
}
```

---

## Calcul du total ligne

```js
lineTotal(item) = (unitPriceUsers × quantityUsers) + (unitPriceDevices × quantityDevices)
               = (199.00 × 3) + (23.88 × 20)
               = 597.00 + 477.60
               = 1 074,60 €
```

---

## Migration vers une vraie API

Pour remplacer localStorage par des appels réseau, il suffit de modifier `src/api/cart.js` :
- Remplacer `readCart()` / `writeCart()` par `apiClient.get("/cart")` / `apiClient.post("/cart", ...)`
- Les composants (`CartRow`, `CartSummary`, `pages/cart.jsx`) n'ont pas besoin de changer.
