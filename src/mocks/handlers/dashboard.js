/**
 * @file handlers/dashboard.js
 * @description Handlers mock pour le dashboard admin.
 *
 * Routes v1 :
 *   GET /dashboard/ca
 *   GET /dashboard/orders
 *   GET /dashboard/users
 *   GET /dashboard/subscriptions
 *   GET /dashboard/products/top
 *
 * NOTE : ces routes existent en mock car le module de paiement est développé
 * en parallèle (voir DashboardController.cs côté backend) — les montants/CA
 * réels ne sont pas encore fiables partout. Les handlers ci-dessous génèrent
 * des séries temporelles cohérentes via Faker, alignées sur les DTOs .NET :
 *   RevenueStatsDto, OrderStatsDto, UserStatsDto, SubscriptionStatsDto, TopProductDto[]
 *
 * Clés byStatus en minuscules (alignées sur l'enum .NET, ToString().ToLowerInvariant()).
 */

import { faker } from "@faker-js/faker"
import { _products } from "../store.js"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Résout [start, end) depuis les query params (from/to prioritaires sur period).
 * @param {{ period?: string, from?: string, to?: string }} params
 * @returns {{ start: Date, end: Date }}
 */
function resolveRange(params = {}) {
  const now = new Date()

  if (params.from && params.to) {
    const start = new Date(params.from)
    const end = new Date(params.to)
    end.setDate(end.getDate() + 1)
    return { start, end }
  }

  const start = new Date(now)
  switch (params.period) {
    case "week":
      start.setDate(start.getDate() - 7)
      break
    case "year":
      start.setFullYear(start.getFullYear() - 1)
      break
    case "all":
      start.setFullYear(2000)
      break
    case "month":
    default:
      start.setMonth(start.getMonth() - 1)
      break
  }

  return { start, end: now }
}

/**
 * Génère la liste des (year, month) couverts par [start, end), bornée à 24 mois.
 * @param {Date} start
 * @param {Date} end
 * @returns {{ year: number, month: number }[]}
 */
function generateMonthlyRange(start, end) {
  const safeStart = new Date(end)
  safeStart.setFullYear(safeStart.getFullYear() - 2)
  const effectiveStart = start < safeStart ? safeStart : start

  const months = []
  const cursor = new Date(effectiveStart.getFullYear(), effectiveStart.getMonth(), 1)
  const last = new Date(end.getFullYear(), end.getMonth(), 1)

  while (cursor <= last) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return months
}

const MOCK_PRODUCT_NAMES = [
  "Cyna EDR Pro",
  "Shield XDR Suite",
  "Guard SOC Manager",
  "Sentinel Zero Trust Gateway",
  "Apex SIEM Core",
  "Cyna MDM Lite",
]

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const dashboardHandlers = [

  // -------------------------------------------------------------------------
  // GET /dashboard/ca → RevenueStatsDto
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/dashboard/ca",
    resolver: ({ params }) => {
      const { start, end } = resolveRange(params)
      const months = generateMonthlyRange(start, end)

      const byMonth = months.map((m) => ({
        year: m.year,
        month: m.month,
        revenue: faker.number.float({ min: 2000, max: 15000, fractionDigits: 2 }),
      }))

      const currentPeriod = byMonth.reduce((sum, m) => sum + m.revenue, 0)
      const previousPeriod = faker.number.float({ min: 2000, max: 15000, fractionDigits: 2 })
      const total = currentPeriod + faker.number.float({ min: 50000, max: 200000, fractionDigits: 2 })
      const growthPercent = previousPeriod === 0
        ? 0
        : Math.round(((currentPeriod - previousPeriod) / previousPeriod) * 10000) / 100

      return {
        total,
        currentPeriod,
        previousPeriod,
        growthPercent,
        byMonth,
      }
    },
  },

  // -------------------------------------------------------------------------
  // GET /dashboard/orders → OrderStatsDto
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/dashboard/orders",
    resolver: ({ params }) => {
      const { start, end } = resolveRange(params)
      const months = generateMonthlyRange(start, end)

      const byMonth = months.map((m) => ({
        year: m.year,
        month: m.month,
        count: faker.number.int({ min: 10, max: 80 }),
      }))

      const total = byMonth.reduce((sum, m) => sum + m.count, 0)

      const byStatus = {
        pending: Math.round(total * 0.10),
        paid: Math.round(total * 0.65),
        failed: Math.round(total * 0.05),
        refunded: Math.round(total * 0.05),
        cancelled: Math.round(total * 0.15),
      }

      return { total, byStatus, byMonth }
    },
  },

  // -------------------------------------------------------------------------
  // GET /dashboard/users → UserStatsDto
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/dashboard/users",
    resolver: ({ params }) => {
      const { start, end } = resolveRange(params)
      const months = generateMonthlyRange(start, end)

      const byMonth = months.map((m) => ({
        year: m.year,
        month: m.month,
        count: faker.number.int({ min: 5, max: 40 }),
      }))

      const newInPeriod = byMonth.reduce((sum, m) => sum + m.count, 0)
      const total = newInPeriod + faker.number.int({ min: 200, max: 1000 })

      return {
        total,
        newInPeriod,
        verifiedEmail: Math.round(total * 0.85),
        byMonth,
      }
    },
  },

  // -------------------------------------------------------------------------
  // GET /dashboard/subscriptions → SubscriptionStatsDto
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/dashboard/subscriptions",
    resolver: ({ params }) => {
      const { start, end } = resolveRange(params)
      const months = generateMonthlyRange(start, end)

      const byMonth = months.map((m) => ({
        year: m.year,
        month: m.month,
        count: faker.number.int({ min: 8, max: 50 }),
      }))

      const total = byMonth.reduce((sum, m) => sum + m.count, 0)

      const byStatus = {
        active: Math.round(total * 0.55),
        cancelled: Math.round(total * 0.15),
        expired: Math.round(total * 0.15),
        suspended: Math.round(total * 0.05),
        pending: Math.round(total * 0.10),
      }

      return {
        total,
        active: byStatus.active,
        byStatus,
        byMonth,
      }
    },
  },

  // -------------------------------------------------------------------------
  // GET /dashboard/products/top → TopProductDto[]
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/dashboard/products/top",
    resolver: ({ params }) => {
      const sortBy = params.sortBy ?? "Revenue"
      const limit = Math.max(1, parseInt(params.limit ?? "5", 10))

      // Réutilise les produits du store partagé quand disponibles, pour des noms cohérents
      // avec le reste de l'app ; complète avec les noms mock dédiés si besoin.
      const pool = _products.length > 0
        ? _products.slice(0, Math.max(limit, MOCK_PRODUCT_NAMES.length))
        : []

      const names = pool.length > 0
        ? pool.map((p) => ({ id: p.id, name: p.name, imageUrl: p.images?.[0] ?? p.imageUrl ?? null }))
        : MOCK_PRODUCT_NAMES.map((name, i) => ({
            id: i + 1,
            name,
            imageUrl: `https://picsum.photos/seed/${name.replace(/\s+/g, "-").toLowerCase()}/400/300`,
          }))

      let topProducts = names.map((p) => ({
        productId: p.id,
        productName: p.name,
        imageUrl: p.imageUrl,
        revenue: faker.number.float({ min: 1000, max: 25000, fractionDigits: 2 }),
        ordersCount: faker.number.int({ min: 5, max: 200 }),
      }))

      topProducts = topProducts.sort((a, b) =>
        sortBy === "Orders" ? b.ordersCount - a.ordersCount : b.revenue - a.revenue
      )

      return topProducts.slice(0, limit)
    },
  },
]