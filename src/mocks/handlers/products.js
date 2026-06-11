/**
 * @file handlers/products.js
 * @description Handlers mock pour les produits.
 * Les données sont partagées via store.js pour garantir la cohérence
 * entre le catalogue, la page détail et les produits similaires.
 */

import { makeProduct } from "../factories/factories.js"
import { _products } from "../store.js"

/** @type {import("../registry.js").MockHandler[]} */
export const productHandlers = [
  /**
   * GET /products
   * Retourne tous les produits.
   */
  {
    method: "GET",
    path: "/products",
    resolver: () => _products,
  },

  /**
   * GET /products/:id
   * Retourne un produit par son ID.
   * Lève une erreur 404 si introuvable.
   */
  {
    method: "GET",
    path: "/products/:id",
    resolver: ({ params }) => {
      const product = _products.find((p) => String(p.id) === String(params.id))
      if (!product) throw new Error("Product not found")
      return product
    },
  },

  /**
   * GET /products/similar/:id
   * Retourne jusqu'à 6 produits similaires au produit donné.
   * Priorité : même catégorie → disponibles en premier → ordre aléatoire.
   * Si moins de 6 dans la même catégorie, complète avec d'autres catégories.
   */
  {
    method: "GET",
    path: "/products/similar/:id",
    resolver: ({ params }) => {
      const product = _products.find((p) => String(p.id) === String(params.id))
      if (!product) throw new Error("Product not found")

      let pool = _products.filter(
        (p) => p.id !== params.id && p.categoryId === product.categoryId
      )
      if (pool.length < 6) {
        const others = _products.filter(p => p.id !== params.id && p.categoryId !== product.categoryId)
        pool = [...pool, ...others]
      }

      return pool
        .sort((a, b) => {
          if (a.status === "available" && b.status !== "available") return -1
          if (a.status !== "available" && b.status === "available") return 1
          return Math.random() - 0.5
        })
        .slice(0, 6)
    },
  },

  /**
   * GET /products/:id/admin
   * Retourne un produit pour le formulaire d'édition admin.
   * En mock, même forme que GET /products/:id (le formulaire a des fallbacks
   * name → nameFr/nameEn) ; en réel, l'API renvoie les deux locales.
   */
  {
    method: "GET",
    path: "/products/:id/admin",
    resolver: ({ params }) => {
      const product = _products.find((p) => String(p.id) === String(params.id))
      if (!product) throw new Error("Product not found")
      return product
    },
  },

  /**
   * POST /products
   * Crée un nouveau produit (admin uniquement).
   * Génère les champs manquants via makeProduct si non fournis.
   */
  {
    method: "POST",
    path: "/products",
    resolver: ({ body }) => {
      const newProduct = makeProduct({ ...body })
      _products.push(newProduct)
      return newProduct
    },
    status: 201,
  },

  /**
   * PUT /products/:id
   * Met à jour un produit existant (admin uniquement).
   * Merge partiel : seuls les champs fournis dans body sont modifiés.
   */
  {
    method: "PUT",
    path: "/products/:id",
    resolver: ({ params, body }) => {
      const index = _products.findIndex((p) => String(p.id) === String(params.id))
      if (index === -1) throw new Error("Product not found")
      Object.assign(_products[index], body)
      return _products[index]
    },
  },

  /**
   * DELETE /products/:id
   * Supprime un produit (admin uniquement).
   * Utilise splice() car _products est une référence importée depuis store.js
   * (impossible de réassigner une exportation ES module).
   */
  {
    method: "DELETE",
    path: "/products/:id",
    resolver: ({ params }) => {
      const index = _products.findIndex((p) => String(p.id) === String(params.id))
      if (index !== -1) _products.splice(index, 1)
      return null
    },
    status: 204,
  },
]
