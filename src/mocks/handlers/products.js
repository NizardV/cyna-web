/**
 * @file handlers/products.js
 * @description Mock handlers for the /products API resource.
 *
 * Registered automatically in index.js.
 * All data is generated via factories (Faker) — no static JSON needed.
 */

import { makeMany, makeProduct } from "../factories/factories.js";

// In-memory store so mutations (POST/PUT/DELETE) persist during the session
let _products = makeMany(12, makeProduct);

/** @type {import("../registry.js").MockHandler[]} */
export const productHandlers = [
  // -------------------------------------------------------------------------
  // GET /products
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/products",
    resolver: () => _products,
  },

  // -------------------------------------------------------------------------
  // GET /products/:id
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/products/:id",
    resolver: ({ params }) => {
      const product = _products.find((p) => p.id === params.id);
      if (!product) throw new Error("Product not found");
      return product;
    },
  },

  // -------------------------------------------------------------------------
  // GET /products/similar/:id — 6 random products from same category
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/products/similar/:id",
    resolver: ({ params }) => {
      const product = _products.find((p) => p.id === params.id);
      const pool = _products.filter((p) => p.id !== params.id);
      return pool
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
    },
  },

  // -------------------------------------------------------------------------
  // POST /products (admin)
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/products",
    resolver: ({ body }) => {
      const newProduct = makeProduct({ ...body });
      _products.push(newProduct);
      return newProduct;
    },
    status: 201,
  },

  // -------------------------------------------------------------------------
  // PUT /products/:id (admin)
  // -------------------------------------------------------------------------
  {
    method: "PUT",
    path: "/products/:id",
    resolver: ({ params, body }) => {
      const index = _products.findIndex((p) => p.id === params.id);
      if (index === -1) throw new Error("Product not found");
      _products[index] = { ..._products[index], ...body };
      return _products[index];
    },
  },

  // -------------------------------------------------------------------------
  // DELETE /products/:id (admin)
  // -------------------------------------------------------------------------
  {
    method: "DELETE",
    path: "/products/:id",
    resolver: ({ params }) => {
      _products = _products.filter((p) => p.id !== params.id);
      return null;
    },
    status: 204,
  },
];