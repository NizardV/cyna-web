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
 * Fetch a product with both locales for the admin edit form (admin only).
 * @param {string} id
 * @returns {Promise<object>}
 */
export const getProductAdmin = (id) =>
  apiClient.get("/products/:id/admin", { params: { id } });

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