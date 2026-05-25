/**
 * @file mocks/index.js
 * @description Registers all mock handlers into the registry.
 * Imported in main.tsx before the app renders (mock mode only).
 */

import { mockRegistry } from "./registry.js";
import { productHandlers } from "./handlers/products.js";
import { authHandlers } from "./handlers/auth.js";
import {
  orderHandlers,
  cartHandlers,
  subscriptionHandlers,
  catalogHandlers,
  categoryHandlers,
  carouselHandlers,
  adminHandlers,
} from "./handlers/orders.js";

mockRegistry.registerMany([
  ...productHandlers,
  ...authHandlers,
  ...orderHandlers,
  ...cartHandlers,
  ...subscriptionHandlers,
  ...catalogHandlers,
  ...categoryHandlers,
  ...carouselHandlers,
  ...adminHandlers,
]);

if (import.meta.env.DEV) {
  console.group("[Mock] Registered routes");
  mockRegistry.listRoutes().forEach((r) => console.log(r));
  console.groupEnd();
}