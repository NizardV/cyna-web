/**
 * @file handlers/products.js
 * @description Mock handlers for the /products API resource.
 *
 * Registered automatically in index.js.
 * All data is generated via factories (Faker) — no static JSON needed.
 */

import { makeMany, makeProduct } from "../factories/factories.js";

// In-memory store so mutations (POST/PUT/DELETE) persist during the session
// on ajoute export pour que Home puisse aussi accéder à cette liste de produits et les afficher dans la section "Top Produits"
export let _products = makeMany(12, makeProduct);

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
      if (!product) throw new Error("Product not found");

      // 1. On filtre pour n'avoir QUE la même catégorie
      let pool = _products.filter(
        (p) => p.id !== params.id && p.categoryId === product.categoryId
      );

      // Si on n'a pas assez de produits dans la même catégorie
      // on complète avec le reste des produits pour avoir nos 6 cartes.
      if (pool.length < 6) {
        const others = _products.filter(p => p.id !== params.id && p.categoryId !== product.categoryId);
        pool = [...pool, ...others];
      }

      // 2. On trie : les produits "available" en premier, et on mélange le reste
      const sortedPool = pool.sort((a, b) => {
        if (a.status === "available" && b.status !== "available") return -1;
        if (a.status !== "available" && b.status === "available") return 1;
        return Math.random() - 0.5; // Mélange aléatoire pour ceux qui ont le même statut
      });

      // 3. On ne garde que les 6 premiers
      return sortedPool.slice(0, 6);
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