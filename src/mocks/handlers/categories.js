/**
 * @file handlers/categories.js
 * @description Handlers mock pour la gestion des catégories.
 *
 * Routes v1 :
 *   GET    /categories
 *   GET    /categories/search   → CategoryAdminDto[] paginé + filtrable
 *   GET    /categories/:id
 *   POST   /categories
 *   PUT    /categories/:id
 *   DELETE /categories/:id
 *
 * CategoryDto :
 *   { id, slug, name, description, imageUrl, displayOrder, productCount }
 */

import { faker } from "@faker-js/faker"
import { _categories } from "../store.js"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PAGE_SIZE_DEFAULT = 10

function applyFilters(categories, params) {
  const q       = (params.q ?? "").toLowerCase()
  let filtered  = [...categories]

  if (q) {
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q)
    )
  }

  // tri
  const sortBy = params.sortBy ?? "displayOrder"
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "name":          return a.name.localeCompare(b.name)
      case "name_desc":     return b.name.localeCompare(a.name)
      case "displayOrder":  return a.displayOrder - b.displayOrder
      case "productCount":  return b.productCount - a.productCount
      default:              return 0
    }
  })

  return filtered
}

function paginate(items, params) {
  const page     = Math.max(1, parseInt(params.page ?? "1", 10))
  const pageSize = Math.max(1, parseInt(params.pageSize ?? String(PAGE_SIZE_DEFAULT), 10))
  const total    = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const offset   = (safePage - 1) * pageSize
  return {
    items: items.slice(offset, offset + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  }
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const categoryHandlers = [
  {
    method: "GET",
    path: "/categories",
    resolver: () => _categories,
  },

  // -------------------------------------------------------------------------
  // GET /categories — liste paginée + filtres
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/categories/search",
    resolver: ({ params }) => {
      const filtered = applyFilters(_categories, params)
      return paginate(filtered, params)
    },
  },

  // -------------------------------------------------------------------------
  // GET /categories/:id — détail d'une catégorie
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/categories/:id",
    resolver: ({ params }) =>
      _categories.find((c) => String(c.id) === params.id) ?? null,
  },

  // -------------------------------------------------------------------------
  // POST /categories — création
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/categories",
    resolver: ({ body }) => {
      const newCat = {
        id: faker.number.int({ min: 10000, max: 99999 }),
        slug: body.slug ?? faker.helpers.slugify(body.name ?? "new-category").toLowerCase(),
        name: body.name ?? "Nouvelle catégorie",
        description: body.description ?? null,
        imageUrl: body.imageUrl ?? null,
        displayOrder: body.displayOrder ?? _categories.length,
        productCount: 0,
      }
      _categories.push(newCat)
      return newCat
    },
    status: 201,
  },

  // -------------------------------------------------------------------------
  // PUT /categories/:id — mise à jour
  // -------------------------------------------------------------------------
  {
    method: "PUT",
    path: "/categories/:id",
    resolver: ({ params, body }) => {
      const idx = _categories.findIndex((c) => String(c.id) === params.id)
      if (idx === -1) throw new Error("Catégorie introuvable.")
      _categories[idx] = { ..._categories[idx], ...body }
      return _categories[idx]
    },
  },

  // -------------------------------------------------------------------------
  // DELETE /categories/:id — suppression
  // -------------------------------------------------------------------------
  {
    method: "DELETE",
    path: "/categories/:id",
    resolver: ({ params }) => {
      const idx = _categories.findIndex((c) => String(c.id) === params.id)
      if (idx !== -1) _categories.splice(idx, 1)
      return null
    },
    status: 204,
  },
]