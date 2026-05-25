/**
 * @file pages/catalog.jsx
 * @description Page "Catalogue / Résultats de recherche" — affiche les produits
 * filtrables par catégorie, budget et disponibilité.
 */

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { Layout } from "@/components/ui/layout/layout"
import { getCatalogProducts, getCategories } from "@/api/catalog.js"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@/hooks/useDebounce.js"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formate un prix mensuel en euros.
 * @param {number} price
 * @returns {string}
 */
function formatMonthlyPrice(price) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price)
}

// ---------------------------------------------------------------------------
// Composant CategoryTag — tag de catégorie sur la carte produit
// ---------------------------------------------------------------------------

/**
 * Tag de catégorie affiché en haut d'une carte produit.
 * @param {{ name: string }} props
 */
function CategoryTag({ name }) {
  return (
    <span className="text-xs font-semibold tracking-widest text-primary uppercase">
      {name}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Composant AvailabilityBadge
// ---------------------------------------------------------------------------

/**
 * Badge de disponibilité d'un produit.
 * @param {{ available: boolean }} props
 */
function AvailabilityBadge({ available }) {
  if (available) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
        Disponible
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true" />
      Service indisponible
    </span>
  )
}

// ---------------------------------------------------------------------------
// Composant ProductCard
// ---------------------------------------------------------------------------

/**
 * Carte de produit dans la grille des résultats.
 * @param {{ product: object, categoryName: string }} props
 */
function ProductCard({ product, categoryName }) {
  return (
    <div className="flex flex-col rounded border border-border bg-card hover:border-primary/40 transition-colors">
      {/* En-tête catégorie */}
      <div className="border-b border-border px-4 py-3">
        <CategoryTag name={categoryName} />
      </div>

      {/* Corps */}
      <div className="flex flex-1 flex-col gap-2 px-4 py-4">
        <h3 className="font-semibold text-foreground text-sm leading-snug">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <AvailabilityBadge available={product.isAvailable} />
      </div>

      {/* Pied de carte — prix + CTA */}
      <div className="mt-auto border-t border-border px-4 py-3">
        {product.isAvailable ? (
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              {formatMonthlyPrice(product.priceMonthly)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                /mois
              </span>
            </span>
            <button className="rounded border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Détails
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">—</span>
            <button
              disabled
              className="rounded border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground cursor-not-allowed"
            >
              Détails
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Composant ProductCardSkeleton
// ---------------------------------------------------------------------------

/**
 * Squelette de chargement pour une carte produit.
 */
function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="flex flex-col gap-2 px-4 py-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="mt-auto border-t border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-7 w-16 rounded" />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Composant FilterSidebar — panneau de filtres
// ---------------------------------------------------------------------------

/**
 * Panneau latéral de filtres (catégories, budget, disponibilité).
 * @param {{ categories: object[], filters: object, onChange: Function }} props
 */
function FilterSidebar({ categories, filters, onChange }) {
  return (
    <aside className="w-full shrink-0 md:w-52">
      <h2 className="mb-4 text-sm font-semibold text-foreground">
        Filtrer les services
      </h2>

      {/* Recherche textuelle */}
      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Recherche
        </label>
        <input
          type="search"
          placeholder="Titre ou description..."
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="h-8 w-full rounded border border-input bg-background px-2.5 text-xs placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring/50"
        />
      </div>

      {/* Filtres catégorie */}
      <div className="mb-5">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Catégories
        </p>
        <div className="flex flex-col gap-1.5">
          {categories.map((cat) => (
            <label key={cat.id} className="flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat.id)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...filters.categories, cat.id]
                    : filters.categories.filter((id) => id !== cat.id)
                  onChange({ categories: next })
                }}
                className="accent-primary"
              />
              <span className="text-foreground">Solutions {cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Budget mensuel */}
      <div className="mb-5">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Budget (Mensuel)
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="0€"
            value={filters.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
            className="h-8 w-full rounded border border-input bg-background px-2 text-xs focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring/50"
          />
          <span className="text-xs text-muted-foreground">—</span>
          <input
            type="number"
            min={0}
            placeholder="+100€"
            value={filters.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
            className="h-8 w-full rounded border border-input bg-background px-2 text-xs focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring/50"
          />
        </div>
      </div>

      {/* Disponibilité */}
      <div>
        <label className="flex cursor-pointer items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={filters.onlyAvailable}
            onChange={(e) => onChange({ onlyAvailable: e.target.checked })}
            className="accent-primary"
          />
          <span className="text-foreground font-medium">
            Uniquement services disponibles
          </span>
        </label>
      </div>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

/**
 * Page "Catalogue / Résultats de recherche" — affiche les produits SaaS
 * filtrables par catégorie, budget et disponibilité.
 */
export function Catalog() {
  const [searchParams] = useSearchParams()

  // --- Produits et catégories ---
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)

  // --- Tri ---
  const [sortBy, setSortBy] = useState("relevance")

  // --- Filtres ---
  const [filters, setFilters] = useState({
    search: searchParams.get("q") || "",
    categories: [],
    minPrice: "",
    maxPrice: "",
    onlyAvailable: false,
  })

  const debouncedSearch = useDebounce(filters.search, 300)

  // Mise à jour partielle des filtres
  const handleFilterChange = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }, [])

  // Chargement initial des produits et catégories
  useEffect(() => {
    setLoadingProducts(true)
    getCatalogProducts()
      .then((data) => {
        setProducts(data)
        setLoadingProducts(false)
      })
      .catch(() => setLoadingProducts(false))
  }, [])

  useEffect(() => {
    setLoadingCategories(true)
    getCategories()
      .then((data) => {
        setCategories(data)
        setLoadingCategories(false)
      })
      .catch(() => setLoadingCategories(false))
  }, [])

  // --- Filtrage côté client ---
  const filtered = products.filter((p) => {
    if (
      debouncedSearch &&
      !p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
      !p.description.toLowerCase().includes(debouncedSearch.toLowerCase())
    ) {
      return false
    }
    if (filters.categories.length > 0 && !filters.categories.includes(p.categoryId)) {
      return false
    }
    if (filters.minPrice !== "" && p.priceMonthly < parseFloat(filters.minPrice)) {
      return false
    }
    if (filters.maxPrice !== "" && p.priceMonthly > parseFloat(filters.maxPrice)) {
      return false
    }
    if (filters.onlyAvailable && !p.isAvailable) {
      return false
    }
    return true
  })

  // --- Tri ---
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price_asc") return a.priceMonthly - b.priceMonthly
    if (sortBy === "price_desc") return b.priceMonthly - a.priceMonthly
    if (sortBy === "name") return a.name.localeCompare(b.name)
    return 0 // relevance : ordre naturel
  })

  /**
   * Retourne le nom de catégorie pour un produit.
   * @param {string} categoryId
   * @returns {string}
   */
  const getCategoryName = (categoryId) => {
    return categories.find((c) => c.id === categoryId)?.name ?? "Service"
  }

  return (
    <Layout>
      <div className="mx-auto max-w-6xl py-8">
        <div className="flex gap-8">

          {/* Panneau latéral de filtres */}
          {loadingCategories ? (
            <aside className="hidden w-52 shrink-0 space-y-3 md:block">
              <Skeleton className="h-4 w-32 mb-4" />
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
            </aside>
          ) : (
            <div className="hidden md:block">
              <FilterSidebar
                categories={categories}
                filters={filters}
                onChange={handleFilterChange}
              />
            </div>
          )}

          {/* Zone résultats */}
          <div className="flex-1 min-w-0">

            {/* En-tête résultats */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-sm font-semibold text-foreground">
                Résultats de recherche
                {!loadingProducts && (
                  <span className="ml-2 font-normal text-muted-foreground">
                    ({sorted.length} service{sorted.length !== 1 ? "s" : ""})
                  </span>
                )}
              </h1>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Trier par :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-8 rounded border border-input bg-background px-2 text-xs focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring/50"
                >
                  <option value="relevance">Pertinence</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="name">Nom A–Z</option>
                </select>
              </div>
            </div>

            {/* Grille de produits */}
            {loadingProducts ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-3 rounded-full border border-border bg-muted p-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-foreground">Aucun résultat</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Essayez de modifier vos critères de recherche.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      search: "",
                      categories: [],
                      minPrice: "",
                      maxPrice: "",
                      onlyAvailable: false,
                    })
                  }
                  className="mt-4 text-xs text-primary hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sorted.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryName={getCategoryName(product.categoryId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}