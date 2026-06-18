/**
 * @file mocks/index.js
 * @description Enregistre tous les handlers mock dans le registry.
 * Importé dans main.tsx avant le rendu de l'application (mode mock uniquement).
 */

import { mockRegistry } from "./registry.js"
import { productHandlers } from "./handlers/products.js"
import { authHandlers } from "./handlers/auth.js"
import { userHandlers } from "./handlers/user.js"
import { homeHandlers } from "./handlers/home.js"
import { accountOrderHandlers } from "./handlers/orders-account.js"
import {
  orderHandlers,
  cartHandlers,
  subscriptionHandlers,
  catalogHandlers,
  carouselHandlers,
} from "./handlers/orders.js"
import { seedCart } from "./handlers/cart.js"
import { categoryHandlers } from "./handlers/categories.js"
import { dashboardHandlers } from "./handlers/dashboard.js"

mockRegistry.registerMany([
  ...productHandlers,
  ...authHandlers,
  ...userHandlers,
  ...accountOrderHandlers,
  ...homeHandlers,
  ...orderHandlers,
  ...cartHandlers,
  ...subscriptionHandlers,
  ...catalogHandlers,
  ...categoryHandlers,
  ...carouselHandlers,
  ...dashboardHandlers,
])

if (import.meta.env.DEV) {
  console.group("[Mock] Registered routes")
  mockRegistry.listRoutes().forEach((r) => console.log(r))
  console.groupEnd()
}

// Seed le panier localStorage avec des articles de démo si vide
seedCart()