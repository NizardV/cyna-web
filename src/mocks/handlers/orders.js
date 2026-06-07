/**
 * @file handlers/orders.js
 * @description Handlers mock pour les commandes, le panier, les abonnements,
 * la recherche, les catégories, le carrousel et le tableau de bord admin.
 *
 * Routes v1 modifiées :
 *   GET /recherche/catalog     (ex /catalog/products)
 *   GET /recherche/categories  (ex /categories)
 *   GET /user/subscriptions    → déplacé dans handlers/user.js
 *
 * Tous les autres handlers (orders, cart, carousel, admin) conservent
 * leurs routes internes non exposées dans le contrat v1.
 */

import { faker } from "@faker-js/faker"
import {
  makeMany,
  makeOrder,
  makeSubscription,
  makeCarouselItem,
} from "../factories/factories.js"
import { _categories, _products } from "../store.js"

// ---------------------------------------------------------------------------
// Stores en mémoire
// ---------------------------------------------------------------------------

let _orders = makeMany(5, makeOrder)
let _cart = []
const _subscriptions = makeMany(3, makeSubscription)
const _carousel = makeMany(3, (_, i) => makeCarouselItem({ displayOrder: i }))

// ---------------------------------------------------------------------------
// Handlers de commandes (internes)
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
    resolver: ({ params }) => _orders.find((o) => String(o.id) === params.id) ?? null,
  },
  {
    method: "POST",
    path: "/orders",
    resolver: ({ body }) => {
      const order = makeOrder({ ...body, status: "Paid" })
      _orders.push(order)
      return order
    },
    status: 201,
  },
]

// ---------------------------------------------------------------------------
// Handlers du panier (internes)
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
      )
      if (existing) {
        existing.quantity += body.quantity ?? 1
        return existing
      }
      const item = {
        id: faker.string.uuid(),
        productId: body.productId,
        productName: _products.find((p) => p.id === body.productId)?.name ?? "Inconnu",
        quantity: body.quantity ?? 1,
        duration: body.duration ?? "monthly",
        unitPrice: body.unitPrice ?? 99,
      }
      _cart.push(item)
      return item
    },
    status: 201,
  },
  {
    method: "PUT",
    path: "/cart/:id",
    resolver: ({ params, body }) => {
      const item = _cart.find((i) => i.id === params.id)
      if (!item) return null
      Object.assign(item, body)
      return item
    },
  },
  {
    method: "DELETE",
    path: "/cart/:id",
    resolver: ({ params }) => {
      _cart = _cart.filter((i) => i.id !== params.id)
      return null
    },
    status: 204,
  },
]

// ---------------------------------------------------------------------------
// Handlers des abonnements (ancienne route interne — conservée pour /profile)
// La route v1 GET /user/subscriptions est gérée dans handlers/user.js
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
]

// ---------------------------------------------------------------------------
// Handlers du catalogue  →  GET /recherche/catalog  (v1)
//
// Paramètres supportés :
//   q, categoryIds, maxPrice, available, sortBy, page, pageSize, locale (ignoré)
//
// Filtrage par `status` : "Active" = disponible (ex isAvailable)
// Filtrage par `price`  : prix unitaire du ProductDto (ex priceMonthly)
// ---------------------------------------------------------------------------

const CATALOG_PAGE_SIZE = 9

/** @type {import("../registry.js").MockHandler[]} */
export const catalogHandlers = [
  {
    method: "GET",
    path: "/recherche/catalog",
    resolver: ({ params }) => {
      const q         = (params.q ?? "").toLowerCase()
      const catIds    = params.categoryIds
        ? params.categoryIds.split(",").map(Number).filter(Boolean)
        : []
      const maxPrice  = params.maxPrice ? parseFloat(params.maxPrice) : null
      // "available" param is boolean string — filter to status === "Active"
      const onlyAvail = params.available === "true"
      const sortBy    = params.sortBy ?? "relevance"
      const page      = Math.max(1, parseInt(params.page ?? "1", 10))
      const pageSize  = Math.max(1, parseInt(params.pageSize ?? String(CATALOG_PAGE_SIZE), 10))
      // locale is accepted but ignored in mock

      // --- Filtrage ---
      let filtered = _products.filter((p) => {
        if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q))
          return false
        if (catIds.length > 0 && !catIds.includes(p.categoryId))
          return false
        // ProductDto.price replaces priceMonthly
        if (maxPrice !== null && p.price > maxPrice)
          return false
        // ProductDto.status "Active" replaces isAvailable
        if (onlyAvail && p.status !== "Active")
          return false
        return true
      })

      // --- Tri ---
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case "price_asc":  return a.price - b.price
          case "price_desc": return b.price - a.price
          case "name":       return a.name.localeCompare(b.name)
          default:           return 0
        }
      })

      const total      = filtered.length
      const totalPages = Math.max(1, Math.ceil(total / pageSize))
      const safePage   = Math.min(page, totalPages)
      const offset     = (safePage - 1) * pageSize
      const items      = filtered.slice(offset, offset + pageSize)

      // Return CatalogPageDto shape
      return { items, total, page: safePage, pageSize, totalPages }
    },
  },
]

// ---------------------------------------------------------------------------
// Handlers des catégories  →  GET /recherche/categories  (v1)
// CategoryDto : { id: int, slug, name, description, imageUrl, displayOrder }
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const categoryHandlers = [
  {
    method: "GET",
    path: "/recherche/categories",
    resolver: () => _categories,
    // locale param accepted and ignored
  },
  {
    method: "GET",
    path: "/recherche/categories/:id",
    resolver: ({ params }) =>
      _categories.find((c) => String(c.id) === params.id) ?? null,
  },
]

// ---------------------------------------------------------------------------
// Handlers du carrousel (CMS admin — route interne)
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
      const item = _carousel.find((c) => c.id === params.id)
      if (!item) return null
      Object.assign(item, body)
      return item
    },
  },
]

// ---------------------------------------------------------------------------
// Handlers du tableau de bord admin (route interne)
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const adminHandlers = [
  {
    method: "GET",
    path: "/admin/dashboard",
    resolver: () => ({
      ventesParJour: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 86_400_000).toISOString().split("T")[0],
        total: faker.number.float({ min: 500, max: 5000, fractionDigits: 2 }),
      })).reverse(),
      ventesParCategorie: _categories.map((c) => ({
        categorie: c.name,
        total: faker.number.float({ min: 1000, max: 20_000, fractionDigits: 2 }),
      })),
      chiffreAffaires: faker.number.float({ min: 50_000, max: 200_000, fractionDigits: 2 }),
      totalCommandes: faker.number.int({ min: 100, max: 1000 }),
      totalUtilisateurs: faker.number.int({ min: 200, max: 2000 }),
    }),
  },
]