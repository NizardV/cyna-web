/**
 * @file api/categories.js
 * @description Appels API pour la gestion admin des catégories.
 *
 * DTOs :
 *   CategoryDto      : { id, slug, name, description, imageUrl, displayOrder, productCount, translations }
 *   CategoryPageDto  : { items, total, page, pageSize, totalPages }
 *   CreateCategoryDto: { slug?, imageUrl?, displayOrder?, translations: CategoryTranslationDto[] }
 *   UpdateCategoryDto: { slug?, imageUrl?, displayOrder?, translations?: CategoryTranslationDto[] }
 *
 * CategoryTranslationDto : { locale: "fr" | "en", name: string, description?: string }
 *
 * LocaleLang (enum .NET) : Fr = 0 → "fr" | En = 1 → "en"
 * Le mock et l'API reçoivent des chaînes "fr"/"en", pas les valeurs numériques.
 */

import { apiClient } from "./client.js"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Construit un tableau de translations à partir d'un objet form plat.
 * Utilisé côté client avant d'envoyer au backend.
 *
 * @param {{ fr: { name: string; description?: string }; en: { name: string; description?: string } }} locales
 * @returns {import("./types").CategoryTranslationDto[]}
 */
export function buildTranslationsPayload(locales) {
  const result = []
  if (locales.fr?.name?.trim()) {
    result.push({
      locale:      "fr",
      name:        locales.fr.name.trim(),
      description: locales.fr.description?.trim() || null,
    })
  }
  if (locales.en?.name?.trim()) {
    result.push({
      locale:      "en",
      name:        locales.en.name.trim(),
      description: locales.en.description?.trim() || null,
    })
  }
  return result
}

/**
 * Extrait les valeurs d'un CategoryDto vers la structure de form locale.
 * @param {object} category - CategoryDto avec translations[]
 * @returns {{ fr: { name: string; description: string }; en: { name: string; description: string } }}
 */
export function extractTranslationsFromDto(category) {
  const find = (locale) =>
    category.translations?.find((t) => t.locale === locale) ?? { name: "", description: "" }
  return {
    fr: { name: find("fr").name ?? "", description: find("fr").description ?? "" },
    en: { name: find("en").name ?? "", description: find("en").description ?? "" },
  }
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/**
 * Récupère toutes les catégories disponibles (usage catalogue / home).
 * @param {{ locale?: string }} [params]
 * @returns {Promise<object[]>}
 */
export const getCategories = (params = {}) =>
  apiClient.get("/categories", { params: { locale: "fr", ...params } })

/**
 * Récupère les catégories avec filtres, tri et pagination (usage admin).
 * @param {{
 *   q?: string,
 *   page?: string,
 *   pageSize?: string,
 *   sortBy?: string,
 *   locale?: string
 * }} [params]
 * @returns {Promise<{ items: object[], total: number, totalPages: number, page: number, pageSize: number }>}
 */
export const searchCategories = (params = {}) =>
  apiClient.get("/categories/search", { params })

/**
 * Récupère une catégorie par son ID (inclut translations[]).
 * @param {number|string} id
 * @returns {Promise<object>}
 */
export const getCategory = (id) =>
  apiClient.get("/categories/:id", { params: { id: String(id) } })

/**
 * Crée une nouvelle catégorie.
 *
 * @param {{
 *   slug?: string,
 *   imageUrl?: string,
 *   displayOrder?: number,
 *   translations: Array<{ locale: "fr"|"en", name: string, description?: string }>
 * }} dto
 * @returns {Promise<object>}
 */
export const createCategory = (dto) =>
  apiClient.post("/categories", dto)

/**
 * Met à jour une catégorie.
 *
 * @param {number|string} id
 * @param {{
 *   slug?: string,
 *   imageUrl?: string,
 *   displayOrder?: number,
 *   translations?: Array<{ locale: "fr"|"en", name: string, description?: string }>
 * }} dto
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