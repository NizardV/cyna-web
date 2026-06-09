/**
 * @file api/catalog.js
 * @description Appels API pour le catalogue de produits et la recherche.
 * Routes v1 : /recherche
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
  apiClient.get("/recherche", { params: { locale: "fr", ...params } })