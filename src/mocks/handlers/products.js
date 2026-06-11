/**
 * @file handlers/products.js
 * @description Handlers mock pour les produits.
 * Les données sont partagées via store.js pour garantir la cohérence
 * entre le catalogue, la page détail et les produits similaires.
 */

import { makeProduct } from "../factories/factories.js"
import { _products, _categories } from "../store.js"

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
// -------------------------------------------------------------------------
  // GET /catalog/category/:slug — Page Catalogue par Catégorie
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/catalog/category/:slug",
    resolver: ({ params }) => {
      const locale = params?.locale ?? "fr"
      const slug = params.slug

      // 1. Trouver la catégorie (404 si introuvable)
      const category = _categories.find((c) => c.slug === slug)
      if (!category) {
        throw new Error("Category not found") // Ton intercepteur gérera le 404
      }

      // Résolution de la traduction de la catégorie
      const catTranslation = category.translations?.find((t) => t.locale === locale) 
        ?? category.translations?.find((t) => t.locale === "fr") 
        ?? { name: category.name, description: category.description }

      // 2. Filtrer les produits de cette catégorie
      let categoryProducts = _products.filter((p) => p.categoryId === category.id)

      const q = (params.q ?? "").toLowerCase()
      if (q) {
        categoryProducts = categoryProducts.filter((p) => 
          p.name.toLowerCase().includes(q) || 
          p.description.toLowerCase().includes(q)
        )
      }

      const maxPrice = parseFloat(params.maxPrice)
      if (!isNaN(maxPrice) && maxPrice > 0 && maxPrice < 1000) {
        categoryProducts = categoryProducts.filter((p) => p.price <= maxPrice)
      }

      if (params.available === "true") {
        categoryProducts = categoryProducts.filter((p) => p.status === "Active")
      }
      
      // 3. Algorithme de tri "catalog_priority" (Exactement comme le SQL)
      categoryProducts.sort((a, b) => {
        // Règle 1 : Disponibilité (Les "Active" en premier, les autres à la fin)
        const aAvailable = a.status === "Active" ? 1 : 0
        const bAvailable = b.status === "Active" ? 1 : 0
        if (aAvailable !== bAvailable) return bAvailable - aAvailable

        // Règle 2 : Priorité Admin (isFeatured en premier)
        const aFeatured = a.isFeatured ? 1 : 0
        const bFeatured = b.isFeatured ? 1 : 0
        if (aFeatured !== bFeatured) return bFeatured - aFeatured

        // Règle 3 : Ordre d'affichage manuel (Ascendant)
        if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder

        // Règle 4 : Ordre de création (ID Ascendant)
        return a.id - b.id
      })

      // 4. Pagination
      const page = Math.max(1, parseInt(params.page ?? "1", 10))
      const pageSize = Math.max(1, parseInt(params.pageSize ?? "9", 10))
      const total = categoryProducts.length
      const totalPages = Math.max(1, Math.ceil(total / pageSize))
      const safePage = Math.min(page, totalPages)
      const offset = (safePage - 1) * pageSize
      const items = categoryProducts.slice(offset, offset + pageSize)

      // 5. Format de sortie : Le fameux CategoryCatalogPageDto
      return {
        categoryName: catTranslation.name ?? category.slug,
        categoryDescription: catTranslation.description ?? "",
        categoryImageUrl: category.imageUrl ?? null,
        total,
        page: safePage,
        pageSize,
        totalPages,
        items, // Contient déjà les mockProducts (ProductDto complet avec le prix)
      }
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
