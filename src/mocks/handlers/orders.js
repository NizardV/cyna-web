/**
 * @file handlers/orders.js
 * @description Mock handlers for orders, cart, subscriptions and search.
 */

import { faker } from "@faker-js/faker";
import {
  makeMany,
  makeOrder,
  makeSubscription,
  makeProduct,
  makeCarouselItem,
  makeCategory,
} from "../factories/factories.js";

// ---------------------------------------------------------------------------
// In-memory stores
// ---------------------------------------------------------------------------
let _orders = makeMany(5, makeOrder);
let _cart = [];
const _subscriptions = makeMany(3, makeSubscription);
const _categories = makeMany(6, makeCategory);
const _products = makeMany(20, () =>
  makeProduct({ categoryId: faker.helpers.arrayElement(_categories).id })
);
const _carousel = makeMany(3, (_, i) => makeCarouselItem({ displayOrder: i }));

// ---------------------------------------------------------------------------
// Order handlers
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const orderHandlers = [
  {
    method: "GET",
    path: "/orders",
    resolver: () => _orders,
  },
  {
    method: "GET",
    path: "/orders/:id",
    resolver: ({ params }) => _orders.find((o) => o.id === params.id) ?? null,
  },
  {
    method: "POST",
    path: "/orders",
    resolver: ({ body }) => {
      const order = makeOrder({ ...body, status: "paid" });
      _orders.push(order);
      return order;
    },
    status: 201,
  },
];

// ---------------------------------------------------------------------------
// Cart handlers
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const cartHandlers = [
  {
    method: "GET",
    path: "/cart",
    resolver: () => _cart,
  },
  {
    method: "POST",
    path: "/cart",
    resolver: ({ body }) => {
      const existing = _cart.find(
        (i) => i.productId === body.productId && i.duration === body.duration
      );
      if (existing) {
        existing.quantity += body.quantity ?? 1;
        return existing;
      }
      const item = {
        id: faker.string.uuid(),
        productId: body.productId,
        productName: _products.find((p) => p.id === body.productId)?.name ?? "Unknown",
        quantity: body.quantity ?? 1,
        duration: body.duration ?? "monthly",
        unitPrice: body.unitPrice ?? 99,
      };
      _cart.push(item);
      return item;
    },
    status: 201,
  },
  {
    method: "PUT",
    path: "/cart/:id",
    resolver: ({ params, body }) => {
      const item = _cart.find((i) => i.id === params.id);
      if (!item) return null;
      Object.assign(item, body);
      return item;
    },
  },
  {
    method: "DELETE",
    path: "/cart/:id",
    resolver: ({ params }) => {
      _cart = _cart.filter((i) => i.id !== params.id);
      return null;
    },
    status: 204,
  },
];

// ---------------------------------------------------------------------------
// Subscription handlers
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const subscriptionHandlers = [
  {
    method: "GET",
    path: "/subscriptions",
    resolver: () => _subscriptions,
  },
  {
    method: "DELETE",
    path: "/subscriptions/:id",
    resolver: () => null,
    status: 204,
  },
];

// ---------------------------------------------------------------------------
// Search handlers
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const searchHandlers = [
  {
    method: "GET",
    path: "/search",
    resolver: ({ params }) => {
      const q = (params.q ?? "").toLowerCase();
      const results = _products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
      return {
        hits: results.slice(0, 20),
        total: results.length,
        query: q,
      };
    },
  },
];

// ---------------------------------------------------------------------------
// Category handlers
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const categoryHandlers = [
  {
    method: "GET",
    path: "/categories",
    resolver: () => _categories,
  },
  {
    method: "GET",
    path: "/categories/:id",
    resolver: ({ params }) =>
      _categories.find((c) => c.id === params.id) ?? null,
  },
];

// ---------------------------------------------------------------------------
// Carousel handlers (admin CMS)
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const carouselHandlers = [
  {
    method: "GET",
    path: "/carousel",
    resolver: () => _carousel,
  },
  {
    method: "PUT",
    path: "/carousel/:id",
    resolver: ({ params, body }) => {
      const item = _carousel.find((c) => c.id === params.id);
      if (!item) return null;
      Object.assign(item, body);
      return item;
    },
  },
];

// ---------------------------------------------------------------------------
// Admin dashboard
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const adminHandlers = [
  {
    method: "GET",
    path: "/admin/dashboard",
    resolver: () => ({
      salesByDay: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
        total: faker.number.float({ min: 500, max: 5000, fractionDigits: 2 }),
      })).reverse(),
      salesByCategory: _categories.map((c) => ({
        category: c.name,
        total: faker.number.float({ min: 1000, max: 20000, fractionDigits: 2 }),
      })),
      totalRevenue: faker.number.float({ min: 50000, max: 200000, fractionDigits: 2 }),
      totalOrders: faker.number.int({ min: 100, max: 1000 }),
      totalUsers: faker.number.int({ min: 200, max: 2000 }),
    }),
  },
];