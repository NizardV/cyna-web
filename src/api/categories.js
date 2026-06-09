/**
 * @file api/categories.js
 * @description Appels API pour la gestion admin des catégories.
 *
 * CategoryAdminDto : { id, slug, name, description, imageUrl, displayOrder, productCount }
 * CatalogPageDto   : { items, total, page, pageSize, totalPages }
 */

import { apiClient } from "./client.js"

/**
 * Récupère toutes les catégories disponibles.
 * @param {{ locale?: string }} [params]
 * @returns {Promise<object[]>}
 */
export const getCategories = (params = {}) =>
  apiClient.get("/categories", { params: { locale: "fr", ...params } })

/**
 * Récupère les catégories avec filtres, tri et pagination.
 * @param {{
 *   q?: string,
 *   page?: string,
 *   pageSize?: string,
 *   sortBy?: string
 * }} [params]
 * @returns {Promise<{ items: object[], total: number, totalPages: number, page: number, pageSize: number }>}
 */
export const searchCategories = (params = {}) =>
  apiClient.get("/categories/search", { params })

/**
 * Récupère une catégorie par son ID.
 * @param {number|string} id
 * @returns {Promise<object>}
 */
export const getCategory = (id) =>
  apiClient.get("/categories/:id", { params: { id: String(id) } })

/**
 * Crée une nouvelle catégorie.
 * @param {{ name: string, slug?: string, description?: string, imageUrl?: string, displayOrder?: number }} dto
 * @returns {Promise<object>}
 */
export const createCategory = (dto) =>
  apiClient.post("/categories", dto)

/**
 * Met à jour une catégorie.
 * @param {number|string} id
 * @param {object} dto
 * @returns {Promise<object>}
 */
export const updateCategory = (id, dto) =>
  apiClient.put("/categories/:id", dto, { params: { id: String(id) } })

/**
 * Supprime une catégorie.
 * @param {number|string} id
 * @returns {Promise<null>}
 */
export const deleteCategory = (id) =>
  apiClient.delete("/categories/:id", { params: { id: String(id) } })