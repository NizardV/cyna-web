/**
 * @file handlers/orders.js
 * @description Handlers mock pour les commandes, le panier, les abonnements,
 * la recherche, les catégories, le carrousel et le tableau de bord admin.
 *
 * Routes v1 :
 *   GET /recherche     → CatalogPageDto
 *
 * Note : ProductDto.status est PascalCase ("Active" | "Inactive" | "Archived")
 * conformément à l'enum .NET. Le filtre `available=true` isole status === "Active".
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
// Handlers des abonnements (route interne conservée pour /profile)
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
// Handlers du catalogue  →  GET /recherche  (v1)
//
// Paramètres supportés :
//   q, categoryIds, maxPrice, available, sortBy, page, pageSize, locale
//
// ProductDto.status : "Active" = disponible, "Inactive" / "Archived" = indisponible
// ProductDto.price  : prix unitaire de référence (remplace priceMonthly)
// ---------------------------------------------------------------------------

const CATALOG_PAGE_SIZE = 9

/** @type {import("../registry.js").MockHandler[]} */
export const catalogHandlers = [
  {
    method: "GET",
    path: "/search",
    resolver: ({ params }) => {
      const q         = (params.q ?? "").toLowerCase()
      const catIds    = params.categoryIds
        ? params.categoryIds.split(",").map(Number).filter(Boolean)
        : []
      const maxPrice  = params.maxPrice ? parseFloat(params.maxPrice) : null
      // available=true → ne garder que les produits dont status === "Active"
      const onlyAvail = params.available === "true"
      const sortBy    = params.sortBy ?? "relevance"
      const page      = Math.max(1, parseInt(params.page ?? "1", 10))
      const pageSize  = Math.max(1, parseInt(params.pageSize ?? String(CATALOG_PAGE_SIZE), 10))

      // --- Filtrage ---
      let filtered = _products.filter((p) => {
        if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q))
          return false
        if (catIds.length > 0 && !catIds.includes(p.categoryId))
          return false
        if (maxPrice !== null && p.price > maxPrice)
          return false
        // PascalCase "Active" = disponible (conforme à l'enum .NET)
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

      // Retourne CatalogPageDto
      return { items, total, page: safePage, pageSize, totalPages }
    },
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