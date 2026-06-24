/**
 * @file api/dashboard.js
 * @description Appels API pour le dashboard admin.
 *
 * Routes v1 (backend .NET, contrôleur DashboardController) :
 *   GET /dashboard/ca
 *   GET /dashboard/orders
 *   GET /dashboard/users
 *   GET /dashboard/subscriptions
 *   GET /dashboard/products/top
 *
 * Toutes les routes acceptent les query params suivants :
 *   - period: "week" | "month" | "year" | "all" (défaut: "month")
 *   - from, to: dates ISO optionnelles, priment sur `period` si les deux sont fournies
 *   - mock: "true" pour forcer des données factices générées côté backend (Bogus)
 *     ou côté mock front (faker), en attendant que le module de paiement
 *     soit totalement intégré.
 *
 * DTOs :
 *   RevenueStatsDto       : { total, currentPeriod, previousPeriod, growthPercent, byMonth: MonthlyRevenueDto[] }
 *   OrderStatsDto         : { total, byStatus: Record<string, number>, byMonth: MonthlyOrderCountDto[] }
 *   UserStatsDto          : { total, newInPeriod, verifiedEmail, byMonth: MonthlyUserCountDto[] }
 *   SubscriptionStatsDto  : { total, active, byStatus: Record<string, number>, byMonth: MonthlySubscriptionCountDto[] }
 *   TopProductDto[]       : { productId, productName, imageUrl, revenue, ordersCount }[]
 *
 * Les clés de byStatus sont en minuscules (ex. "pending", "paid", "active", "cancelled"…).
 */

import { apiClient } from "./client.js"

/**
 * @typedef {{ period?: "week"|"month"|"year"|"all", from?: string, to?: string, mock?: boolean }} DashboardFilterParams
 */

/**
 * Récupère les statistiques de chiffre d'affaires.
 * @param {DashboardFilterParams} [params]
 * @returns {Promise<object>} RevenueStatsDto
 */
export const getRevenueStats = (params = {}) =>
  apiClient.get("/dashboard/ca", { params: { period: "month", ...params } })

/**
 * Récupère les statistiques des commandes.
 * @param {DashboardFilterParams} [params]
 * @returns {Promise<object>} OrderStatsDto
 */
export const getOrderStats = (params = {}) =>
  apiClient.get("/dashboard/orders", { params: { period: "month", ...params } })

/**
 * Récupère les statistiques des utilisateurs.
 * @param {DashboardFilterParams} [params]
 * @returns {Promise<object>} UserStatsDto
 */
export const getUserStats = (params = {}) =>
  apiClient.get("/dashboard/users", { params: { period: "month", ...params } })

/**
 * Récupère les statistiques des abonnements.
 * @param {DashboardFilterParams} [params]
 * @returns {Promise<object>} SubscriptionStatsDto
 */
export const getSubscriptionStats = (params = {}) =>
  apiClient.get("/dashboard/subscriptions", { params: { period: "month", ...params } })

/**
 * Récupère les produits les plus performants.
 * @param {DashboardFilterParams & { sortBy?: "Revenue"|"Orders", limit?: number }} [params]
 * @returns {Promise<object[]>} TopProductDto[]
 */
export const getTopProducts = (params = {}) =>
  apiClient.get("/dashboard/products/top", {
    params: { period: "month", sortBy: "Revenue", limit: "5", ...params },
  })

/**
 * Récupère toutes les statistiques du dashboard en un seul appel groupé.
 * Pratique pour la page dashboard qui en a besoin simultanément.
 * @param {DashboardFilterParams} [params]
 * @returns {Promise<{ revenue: object, orders: object, users: object, subscriptions: object, topProducts: object[] }>}
 */
export const getDashboardData = async (params = {}) => {
  const [revenue, orders, users, subscriptions, topProducts] = await Promise.all([
    getRevenueStats(params),
    getOrderStats(params),
    getUserStats(params),
    getSubscriptionStats(params),
    getTopProducts(params),
  ])
  return { revenue, orders, users, subscriptions, topProducts }
}