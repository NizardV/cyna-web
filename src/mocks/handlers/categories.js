/**
 * @file handlers/categories.js
 * @description Handlers mock pour la gestion des catégories.
 *
 * Routes v1 :
 *   GET    /categories
 *   GET    /categories/search   → CategoryAdminDto[] paginé + filtrable
 *   GET    /categories/:id
 *   POST   /categories          → body: { slug?, imageUrl?, displayOrder?, translations: [{locale,name,description?}] }
 *   PUT    /categories/:id      → body: { slug?, imageUrl?, displayOrder?, translations?: [...] }
 *   DELETE /categories/:id
 *
 * CategoryDto :
 *   { id, slug, name, description, imageUrl, displayOrder, productCount, translations }
 *
 * LocaleLang : "fr" | "en"  (correspond à l'enum .NET LocaleLang)
 */

import { faker } from "@faker-js/faker"
import { _categories } from "../store.js"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PAGE_SIZE_DEFAULT = 10

/**
 * Résout le nom/description d'une catégorie depuis son tableau de translations.
 * Priorité : locale fournie → "fr" → premier disponible.
 * @param {object[]} translations
 * @param {string} [locale="fr"]
 */
function resolveTranslation(translations = [], locale = "fr") {
  return (
    translations.find((t) => t.locale === locale) ??
    translations.find((t) => t.locale === "fr") ??
    translations[0] ??
    { name: "", description: null }
  )
}

/**
 * Normalise une catégorie brute du store en CategoryDto en résolvant
 * les champs plats name/description depuis translations[].
 * @param {object} cat
 * @param {string} [locale="fr"]
 */
function toCategoryDto(cat, locale = "fr") {
  const tr = resolveTranslation(cat.translations ?? [], locale)
  return {
    id:           cat.id,
    slug:         cat.slug,
    name:         tr.name ?? cat.name ?? cat.slug,
    description:  tr.description ?? cat.description ?? null,
    imageUrl:     cat.imageUrl ?? null,
    displayOrder: cat.displayOrder ?? 0,
    productCount: cat.productCount ?? 0,
    translations: cat.translations ?? [],
  }
}

function applyFilters(categories, params) {
  const q      = (params.q ?? "").toLowerCase()
  const locale = params.locale ?? "fr"
  let filtered = categories.map((c) => toCategoryDto(c, locale))

  if (q) {
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q)
    )
  }

  // tri
  const sortBy = params.sortBy ?? "displayOrder"
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "name":         return a.name.localeCompare(b.name)
      case "name_desc":    return b.name.localeCompare(a.name)
      case "displayOrder": return a.displayOrder - b.displayOrder
      case "productCount": return b.productCount - a.productCount
      default:             return 0
    }
  })

  return filtered
}

function paginate(items, params) {
  const page     = Math.max(1, parseInt(params.page ?? "1", 10))
  const pageSize = Math.max(1, parseInt(params.pageSize ?? String(PAGE_SIZE_DEFAULT), 10))
  const total    = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const offset   = (safePage - 1) * pageSize
  return {
    items: items.slice(offset, offset + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  }
}

/**
 * Construit le tableau de translations normalisé depuis un body API.
 * Accepte :
 *   - body.translations = [{ locale: "fr"|"en", name, description? }]
 *   - body.name + body.description (compat flat legacy)
 */
function buildTranslations(body, existing = []) {
  if (Array.isArray(body.translations) && body.translations.length > 0) {
    return body.translations.map((t) => ({
      locale:      t.locale ?? "fr",
      name:        (t.name ?? "").trim(),
      description: t.description ? t.description.trim() : null,
    }))
  }
  // Fallback: body.name / body.description → fr translation only
  if (body.name) {
    const frIdx = existing.findIndex((t) => t.locale === "fr")
    const updated = [...existing]
    const frEntry = {
      locale:      "fr",
      name:        body.name.trim(),
      description: body.description ? body.description.trim() : (updated[frIdx]?.description ?? null),
    }
    if (frIdx >= 0) updated[frIdx] = frEntry
    else updated.unshift(frEntry)
    return updated
  }
  return existing
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const categoryHandlers = [

  // -------------------------------------------------------------------------
  // GET /categories — liste complète (usage catalogue/home)
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/categories",
    resolver: ({ params }) => {
      const locale = params?.locale ?? "fr"
      return _categories.map((c) => toCategoryDto(c, locale))
    },
  },

  // -------------------------------------------------------------------------
  // GET /categories/search — liste paginée + filtres (usage admin)
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/categories/search",
    resolver: ({ params }) => {
      const filtered = applyFilters(_categories, params)
      return paginate(filtered, params)
    },
  },

  // -------------------------------------------------------------------------
  // GET /categories/:id — détail (inclut translations[])
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/categories/:id",
    resolver: ({ params }) => {
      const cat = _categories.find((c) => String(c.id) === params.id)
      return cat ? toCategoryDto(cat) : null
    },
  },

  // -------------------------------------------------------------------------
  // POST /categories — création
  // Body : { slug?, imageUrl?, displayOrder?, translations: [{locale,name,description?}] }
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/categories",
    resolver: ({ body }) => {
      const translations = buildTranslations(body)
      const frTr = translations.find((t) => t.locale === "fr") ?? translations[0] ?? { name: "new-category" }
      const slug =
        body.slug?.trim().toLowerCase() ||
        frTr.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

      const newCat = {
        id:           faker.number.int({ min: 10000, max: 99999 }),
        slug,
        name:         frTr.name,
        description:  frTr.description ?? null,
        imageUrl:     body.imageUrl ?? null,
        displayOrder: body.displayOrder != null ? Number(body.displayOrder) : _categories.length,
        productCount: 0,
        translations,
      }
      _categories.push(newCat)
      return newCat
    },
    status: 201,
  },

  // -------------------------------------------------------------------------
  // PUT /categories/:id — mise à jour
  // Body : { slug?, imageUrl?, displayOrder?, translations?: [...] }
  // -------------------------------------------------------------------------
  {
    method: "PUT",
    path: "/categories/:id",
    resolver: ({ params, body }) => {
      const idx = _categories.findIndex((c) => String(c.id) === params.id)
      if (idx === -1) throw new Error("Catégorie introuvable.")

      const existing = _categories[idx]
      const translations = buildTranslations(body, existing.translations ?? [])
      const frTr = translations.find((t) => t.locale === "fr") ?? translations[0] ?? {}

      _categories[idx] = {
        ...existing,
        slug:         body.slug?.trim().toLowerCase() ?? existing.slug,
        imageUrl:     body.imageUrl !== undefined ? body.imageUrl : existing.imageUrl,
        displayOrder: body.displayOrder != null ? Number(body.displayOrder) : existing.displayOrder,
        // Sync flat fields from fr translation for backwards compat
        name:         frTr.name ?? existing.name,
        description:  frTr.description ?? existing.description,
        translations,
      }
      return toCategoryDto(_categories[idx])
    },
  },

  // -------------------------------------------------------------------------
  // DELETE /categories/:id — suppression
  // -------------------------------------------------------------------------
  {
    method: "DELETE",
    path: "/categories/:id",
    resolver: ({ params }) => {
      const idx = _categories.findIndex((c) => String(c.id) === params.id)
      if (idx !== -1) _categories.splice(idx, 1)
      return null
    },
    status: 204,
  },
]