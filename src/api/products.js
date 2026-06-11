/**
 * @file api/products.js
 * @description Product API calls — thin wrappers over the apiClient singleton.
 * Works identically in mock mode and real mode.
 */

import { apiClient } from "./client.js";

/**
 * Fetch all products.
 * @returns {Promise<object[]>}
 */
export const getProducts = () => apiClient.get("/products");

/**
 * Fetch a single product by ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
export const getProduct = (id) =>
  apiClient.get("/products/:id", { params: { id } });

/**
 * Fetch 6 similar products.
 * @param {string} id
 * @returns {Promise<object[]>}
 */
export const getSimilarProducts = (id) =>
  apiClient.get("/products/similar/:id", { params: { id } });

/**
 * Récupère les informations d'une catégorie et ses produits (Page Catalogue).
 * @param {string} slug - Le slug identifiant la catégorie.
 * @param {{
 * page?: string,
 * pageSize?: string,
 * locale?: string
 * }} [params]
 * @returns {Promise<{
 * categoryName: string,
 * categoryDescription: string,
 * categoryImageUrl: string,
 * items: object[],
 * total: number,
 * totalPages: number,
 * page: number,
 * pageSize: number
 * }>}
 */
export const getCategoryCatalog = (slug, params = {}) =>
  apiClient.get(`/catalog/category/${slug}`, { params: { locale: "fr", ...params } })

/**
 * Create a new product (admin only).
 * @param {object} dto
 * @returns {Promise<object>}
 */
export const createProduct = (dto) => apiClient.post("/products", dto);

/**
 * Update a product (admin only).
 * @param {string} id
 * @param {object} dto
 * @returns {Promise<object>}
 */
export const updateProduct = (id, dto) =>
  apiClient.put("/products/:id", dto, { params: { id } });

/**
 * Delete a product (admin only).
 * @param {string} id
 * @returns {Promise<null>}
 */
export const deleteProduct = (id) =>
  apiClient.delete("/products/:id", { params: { id } });