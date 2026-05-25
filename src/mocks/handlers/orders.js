/**
 * @file handlers/orders.js
 * @description Handlers mock pour les commandes, le panier, les abonnements,
 * la recherche, les catégories, le carrousel et le tableau de bord admin.
 * Toutes les données sont générées aléatoirement via Faker au démarrage.
 */

import { faker } from "@faker-js/faker"
import {
  makeMany,
  makeOrder,
  makeSubscription,
  makeProduct,
  makeCarouselItem,
  makeCategory,
} from "../factories/factories.js"

// ---------------------------------------------------------------------------
// Stores en mémoire — initialisés une fois au démarrage
// ---------------------------------------------------------------------------

/** @type {object[]} Commandes existantes */
let _orders = makeMany(5, makeOrder)

/** @type {object[]} Contenu du panier courant */
let _cart = []

/** @type {object[]} Abonnements de l'utilisateur */
const _subscriptions = makeMany(3, makeSubscription)

/** @type {object[]} Catégories disponibles */
const _categories = makeMany(6, makeCategory)

/**
 * Pool de 40 produits répartis aléatoirement entre les catégories.
 * Taille volontairement grande pour permettre une vraie pagination.
 * @type {object[]}
 */
const _products = makeMany(40, () =>
  makeProduct({ categoryId: faker.helpers.arrayElement(_categories).id })
)

/** @type {object[]} Éléments du carrousel */
const _carousel = makeMany(3, (_, i) => makeCarouselItem({ displayOrder: i }))

// ---------------------------------------------------------------------------
// Handlers de commandes
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
      const order = makeOrder({ ...body, status: "paid" })
      _orders.push(order)
      return order
    },
    status: 201,
  },
]

// ---------------------------------------------------------------------------
// Handlers du panier
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
// Handlers des abonnements
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
// Handlers du catalogue — filtrage, tri et pagination côté serveur
// ---------------------------------------------------------------------------

/**
 * Taille de page par défaut pour le catalogue.
 * @type {number}
 */
const CATALOG_PAGE_SIZE = 9

/** @type {import("../registry.js").MockHandler[]} */
export const catalogHandlers = [
  /**
   * GET /catalog/products
   * Supporte les paramètres :
   *   - q           : recherche textuelle
   *   - categoryIds : liste d'IDs séparés par des virgules
   *   - maxPrice    : prix mensuel maximum
   *   - available   : "true" pour filtrer les services disponibles uniquement
   *   - sortBy      : "relevance" | "price_asc" | "price_desc" | "name"
   *   - page        : numéro de page (base 1)
   *   - pageSize    : nombre d'éléments par page
   */
  {
    method: "GET",
    path: "/catalog/products",
    resolver: ({ params }) => {
      const q          = (params.q ?? "").toLowerCase()
      const catIds     = params.categoryIds
        ? params.categoryIds.split(",").filter(Boolean)
        : []
      const maxPrice   = params.maxPrice ? parseFloat(params.maxPrice) : null
      const available  = params.available === "true"
      const sortBy     = params.sortBy ?? "relevance"
      const page       = Math.max(1, parseInt(params.page ?? "1", 10))
      const pageSize   = Math.max(1, parseInt(params.pageSize ?? String(CATALOG_PAGE_SIZE), 10))

      // --- Filtrage ---
      let filtered = _products.filter((p) => {
        if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) {
          return false
        }
        if (catIds.length > 0 && !catIds.includes(p.categoryId)) return false
        if (maxPrice !== null && p.priceMonthly > maxPrice) return false
        if (available && !p.isAvailable) return false
        return true
      })

      // --- Tri ---
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case "price_asc":  return a.priceMonthly - b.priceMonthly
          case "price_desc": return b.priceMonthly - a.priceMonthly
          case "name":       return a.name.localeCompare(b.name)
          default:           return 0 // pertinence : ordre naturel
        }
      })

      const total      = filtered.length
      const totalPages = Math.max(1, Math.ceil(total / pageSize))
      const safePage   = Math.min(page, totalPages)
      const offset     = (safePage - 1) * pageSize
      const items      = filtered.slice(offset, offset + pageSize)

      return { items, total, page: safePage, pageSize, totalPages }
    },
  },
]

// ---------------------------------------------------------------------------
// Handlers des catégories
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
]

// ---------------------------------------------------------------------------
// Handlers du carrousel (CMS admin)
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
// Handlers du tableau de bord admin
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