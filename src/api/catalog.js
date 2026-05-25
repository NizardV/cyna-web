/**
 * @file api/catalog.js
 * @description Appels API pour le catalogue de produits et la recherche.
 * Fonctionne de manière identique en mode mock et en mode réel.
 */

import { apiClient } from "./client.js"

/**
 * Récupère tous les produits du catalogue avec filtres optionnels.
 * @param {{ categoryId?: string, minPrice?: number, maxPrice?: number, available?: boolean }} [filters] - Filtres optionnels
 * @returns {Promise<object[]>}
 */
export const getCatalogProducts = (filters = {}) =>
  apiClient.get("/products", { params: filters })

/**
 * Récupère toutes les catégories disponibles.
 * @returns {Promise<object[]>}
 */
export const getCategories = () => apiClient.get("/categories")

/**
 * Recherche des produits par mot-clé.
 * @param {string} query - Terme de recherche
 * @returns {Promise<{ hits: object[], total: number, query: string }>}
 */
export const searchProducts = (query) =>
  apiClient.get("/search", { params: { q: query } })