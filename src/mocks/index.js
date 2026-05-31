/**
 * @file mocks/index.js
 * @description Enregistre tous les handlers mock dans le registry.
 * Importé dans main.tsx avant le rendu de l'application (mode mock uniquement).
 */

import { mockRegistry } from "./registry.js"
import { productHandlers } from "./handlers/products.js"
import { authHandlers } from "./handlers/auth.js"
import { userHandlers } from "./handlers/user.js"
import { accountOrderHandlers } from "./handlers/orders-account.js"
import {
  orderHandlers,
  cartHandlers,
  subscriptionHandlers,
  searchHandlers,
  categoryHandlers,
  carouselHandlers,
  adminHandlers,
} from "./handlers/orders.js"

mockRegistry.registerMany([
  ...productHandlers,
  ...authHandlers,
  ...userHandlers,
  ...accountOrderHandlers,
  ...orderHandlers,
  ...cartHandlers,
  ...subscriptionHandlers,
  ...searchHandlers,
  ...categoryHandlers,
  ...carouselHandlers,
  ...adminHandlers,
])

if (import.meta.env.DEV) {
  console.group("[Mock] Registered routes")
  mockRegistry.listRoutes().forEach((r) => console.log(r))
  console.groupEnd()
}

// Seed le panier localStorage avec des articles de démo si vide
const CART_KEY = "cyna_cart"
if (!localStorage.getItem(CART_KEY)) {
  localStorage.setItem(
    CART_KEY,
    JSON.stringify([
      {
        id: crypto.randomUUID(),
        productId: "mock-product-1",
        productName: "Cyna EDR Advanced",
        quantity: 50,
        duration: "monthly",
        unitPrice: 12,
      },
      {
        id: crypto.randomUUID(),
        productId: "mock-product-2",
        productName: "Cyna XDR Entreprise",
        quantity: 10,
        duration: "monthly",
        unitPrice: 45,
      },
    ])
  )
}