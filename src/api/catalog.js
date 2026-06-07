/**
 * @file api/catalog.js
 * @description Appels API pour le catalogue de produits et la recherche.
 * Routes v1 : GET /recherche/catalog et GET /recherche/categories
 */

import { apiClient } from "./client.js"

/**
 * Récupère les produits du catalogue avec filtres, tri et pagination.
 * @param {{
 *   q?: string,
 *   categoryIds?: string,
 *   maxPrice?: string,
 *   available?: string,
 *   page?: string,
 *   pageSize?: string,
 *   sortBy?: string,
 *   locale?: string
 * }} [params]
 * @returns {Promise<{
 *   items: object[],
 *   total: number,
 *   totalPages: number,
 *   page: number,
 *   pageSize: number
 * }>}
 */
export const getCatalogProducts = (params = {}) =>
  apiClient.get("/recherche/catalog", { params: { locale: "fr", ...params } })

/**
 * Récupère toutes les catégories disponibles.
 * @param {{ locale?: string }} [params]
 * @returns {Promise<object[]>}
 */
export const getCategories = (params = {}) =>
  apiClient.get("/recherche/categories", { params: { locale: "fr", ...params } })