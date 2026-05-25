/**
 * @file api/catalog.js
 * @description Appels API pour le catalogue de produits et la recherche.
 * Fonctionne de manière identique en mode mock et en mode réel.
 */

import { apiClient } from "./client.js"

/**
 * Récupère tous les produits du catalogue avec filtres, tri et pagination.
 * @param {{
 *   q?: string,
 *   categoryIds?: string,
 *   maxPrice?: string,
 *   available?: string,
 *   page?: string,
 *   pageSize?: string,
 *   sortBy?: string
 * }} [params] - Paramètres de requête
 * @returns {Promise<{
 *   items: object[],
 *   total: number,
 *   totalPages: number,
 *   page: number
 * }>}
 */
export const getCatalogProducts = (params = {}) =>
  apiClient.get("/catalog/products", { params })

/**
 * Récupère toutes les catégories disponibles.
 * @returns {Promise<object[]>}
 */
export const getCategories = () => apiClient.get("/categories")
