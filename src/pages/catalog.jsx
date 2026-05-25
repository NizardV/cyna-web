/**
 * @file pages/catalog.jsx
 * @description Page catalogue des services SaaS.
 *
 * Fonctionnalités :
 * - Filtres (recherche, catégories, budget, disponibilité) tous envoyés à l'API
 * - Tri côté API
 * - Pagination côté API avec le composant Pagination
 * - Combobox pour le tri (remplace Select)
 * - Debounce sur le champ de recherche textuelle
 * - Internationalisation complète (namespace "catalog")
 */

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Layout } from "@/components/ui/layout/layout"
import { getCatalogProducts, getCategories } from "@/api/catalog.js"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { useDebounce } from "@/hooks/useDebounce.js"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Constante — nombre d'éléments par page
// ---------------------------------------------------------------------------

/** @type {number} Taille de page par défaut */
const PAGE_SIZE = 9

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

/**
 * Construit la liste des numéros de pages à afficher dans la pagination.
 * Insère `null` pour représenter les ellipses.
 *
 * @param {number} current - Page courante (base 1)
 * @param {number} total   - Nombre total de pages
 * @returns {(number|null)[]}
 */
function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set([1, total, current])
  if (current > 1) pages.add(current - 1)
  if (current < total) pages.add(current + 1)

  const sorted = [...pages].sort((a, b) => a - b)
  const result = []

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(null)
    result.push(sorted[i])
  }

  return result
}

// ---------------------------------------------------------------------------
// ProductCard — carte d'un service du catalogue
// ---------------------------------------------------------------------------

/**
 * Carte de présentation d'un produit SaaS.
 *
 * @param {{ product: object }} props
 */
function ProductCard({ product }) {
  const { t } = useTranslation("catalog")

  return (
    <Card
      className={cn(
        "flex flex-col transition-colors hover:ring-primary",
        !product.isAvailable && "opacity-75"
      )}
    >
      {/* Vignette du produit */}
      <img
        src="https://avatar.vercel.sh/shadcn1"
        alt={product.name}
        className={cn(
          "relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40",
          product.isAvailable ? "bg-muted text-primary" : "bg-muted/50 text-muted-foreground"
        )}
      />

      <CardContent className="flex flex-1 flex-col gap-2 pt-3">
        <h3 className="text-xs font-bold text-foreground">{product.name}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex flex-col gap-1">
            {product.isAvailable ? (
              <>
                <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                  {t("product.available")}
                </Badge>
                <p className="text-sm font-extrabold text-primary">
                  {formatMonthlyPrice(product.priceMonthly)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {t("product.perMonth")}
                  </span>
                </p>
              </>
            ) : (
              <Badge variant="destructive">{t("product.unavailable")}</Badge>
            )}
          </div>
          <Button
            size="sm"
            disabled={!product.isAvailable}
            variant={product.isAvailable ? "default" : "outline"}
          >
            {t("product.details")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// ProductCardSkeleton — squelette de chargement d'une carte produit
// ---------------------------------------------------------------------------

/** Squelette de chargement pour une carte produit. */
function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <Skeleton className="h-28" />
      <CardContent className="flex flex-col gap-2 pt-3">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="mt-3 flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-7 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// FilterSidebar — panneau de filtres latéral
// ---------------------------------------------------------------------------

/**
 * Panneau de filtres latéral.
 *
 * @param {{
 *   categories: object[],
 *   filters: object,
 *   onChange: (patch: object) => void
 * }} props
 */
function FilterSidebar({ categories, filters, onChange }) {
  const { t } = useTranslation("catalog")

  return (
    <aside className="w-56 shrink-0">
      <h2 className="mb-4 text-sm font-bold text-foreground">{t("filter.title")}</h2>

      {/* Recherche textuelle */}
      <div className="mb-4 border-b border-border pb-4">
        <p className="mb-2 text-xs font-semibold text-foreground">{t("filter.search")}</p>
        <Input
          type="search"
          placeholder={t("filter.searchPlaceholder")}
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      {/* Filtrage par catégorie */}
      <div className="mb-4 border-b border-border pb-4">
        <p className="mb-2 text-xs font-semibold text-foreground">{t("filter.categories")}</p>
        <div className="flex flex-col gap-1.5">
          {categories.map((cat) => (
            <Label
              key={cat.id}
              className="flex cursor-pointer items-center gap-2 font-normal text-muted-foreground"
            >
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
              {t("product.solutions")} {cat.name}
            </Label>
          ))}
        </div>
      </div>

      {/* Filtre budget */}
      <div className="mb-4 border-b border-border pb-4">
        <p className="mb-2 text-xs font-semibold text-foreground">{t("filter.budget")}</p>
        <input
          type="range"
          min="0"
          max="1000"
          step="10"
          value={filters.maxPrice || 1000}
          onChange={(e) => onChange({ maxPrice: e.target.value })}
          className="w-full accent-primary"
        />
        <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
          <span>0€</span>
          <span>{filters.maxPrice ? `${filters.maxPrice}€` : t("filter.budgetMax")}</span>
        </div>
      </div>

      {/* Filtre disponibilité */}
      <Label className="flex cursor-pointer items-center gap-2 font-medium">
        <input
          type="checkbox"
          checked={filters.onlyAvailable}
          onChange={(e) => onChange({ onlyAvailable: e.target.checked })}
          className="accent-primary"
        />
        {t("filter.onlyAvailable")}
      </Label>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// FilterSidebarSkeleton — squelette de chargement du panneau de filtres
// ---------------------------------------------------------------------------

/** Squelette de chargement du panneau de filtres. */
function FilterSidebarSkeleton() {
  return (
    <aside className="hidden w-56 shrink-0 space-y-3 md:block">
      <Skeleton className="mb-4 h-4 w-40" />
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </aside>
  )
}

// ---------------------------------------------------------------------------
// CatalogPagination — composant de pagination
// ---------------------------------------------------------------------------

/**
 * Pagination du catalogue.
 *
 * @param {{
 *   currentPage: number,
 *   totalPages: number,
 *   onPageChange: (page: number) => void
 * }} props
 */
function CatalogPagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useTranslation("catalog")

  if (totalPages <= 1) return null

  const pages = buildPageRange(currentPage, totalPages)

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        {/* Bouton Précédent */}
        <PaginationItem>
          <PaginationPrevious
            text={t("pagination.previous")}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        {/* Numéros de pages avec ellipses */}
        {pages.map((page, i) =>
          page === null ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        {/* Bouton Suivant */}
        <PaginationItem>
          <PaginationNext
            text={t("pagination.next")}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            aria-disabled={currentPage === totalPages}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

// ---------------------------------------------------------------------------
// Options de tri — label + valeur API
// ---------------------------------------------------------------------------

/** @type {{ value: string, labelKey: string }[]} */
const SORT_OPTIONS = [
  { value: "relevance", labelKey: "sort.relevance" },
  { value: "price_asc", labelKey: "sort.price_asc" },
  { value: "price_desc", labelKey: "sort.price_desc" },
  { value: "name", labelKey: "sort.name" },
]

// ---------------------------------------------------------------------------
// Page principale — Catalog
// ---------------------------------------------------------------------------

/**
 * Page catalogue des services SaaS.
 * Tous les filtres, le tri et la pagination sont délégués à l'API.
 */
export function Catalog() {
  const { t } = useTranslation("catalog")
  const [searchParams] = useSearchParams()

  // --- État des produits et pagination ---
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingProducts, setLoadingProducts] = useState(true)

  // --- État des catégories ---
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // --- État des filtres (recherche en direct, reste debounced pour l'API) ---
  const [filters, setFilters] = useState({
    search: searchParams.get("q") || "",
    categories: [],
    maxPrice: "",
    onlyAvailable: false,
  })

  // --- Tri (valeur Combobox) ---
  const [sortBy, setSortBy] = useState("relevance")

  /** Recherche textuelle avec délai anti-rebond de 300 ms */
  const debouncedSearch = useDebounce(filters.search, 300)

  /**
   * Met à jour partiellement l'état des filtres.
   * Remet la pagination à la première page à chaque changement.
   *
   * @param {Partial<typeof filters>} patch
   */
  const handleFilterChange = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setCurrentPage(1)
  }, [])

  // --- Chargement initial des catégories ---
  useEffect(() => {
    setLoadingProducts(true)

    /** @type {Record<string, string>} Paramètres envoyés à l'API */
    const params = {
      page: String(currentPage),
      pageSize: String(PAGE_SIZE),
      sortBy,
    }

    if (debouncedSearch) params.q = debouncedSearch
    if (filters.categories.length > 0) params.categoryIds = filters.categories.join(",")
    if (filters.maxPrice !== "" && filters.maxPrice !== "1000") {
      params.maxPrice = filters.maxPrice
    }
    if (filters.onlyAvailable) params.available = "true"

    getCatalogProducts(params)
      .then((data) => {
        setProducts(data.items ?? [])
        setTotal(data.total ?? 0)
        setTotalPages(data.totalPages ?? 1)
        setLoadingProducts(false)
      })
      .catch(() => setLoadingProducts(false))
  }, [debouncedSearch, filters.categories, filters.maxPrice, filters.onlyAvailable, sortBy, currentPage])

  // --- Chargement des catégories ---
  useEffect(() => {
    setLoadingCategories(true)
    getCategories()
      .then((data) => {
        setCategories(data)
        setLoadingCategories(false)
      })
      .catch(() => setLoadingCategories(false))
  }, [])

  // ---------------------------------------------------------------------------
  // Rendu
  // ---------------------------------------------------------------------------

  return (
    <Layout>
      <main className="mx-auto flex w-full max-w-7xl gap-8 p-8">

        {/* Panneau de filtres */}
        {loadingCategories ? (
          <FilterSidebarSkeleton />
        ) : (
          <div className="hidden md:block">
            <FilterSidebar
              categories={categories}
              filters={filters}
              onChange={handleFilterChange}
            />
          </div>
        )}

        {/* Zone de résultats */}
        <div className="min-w-0 flex-1">

          {/* En-tête : total + Combobox de tri */}
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-sm font-bold text-foreground">
              {t("resultsLabel")}{" "}
              {!loadingProducts && (
                <span className="font-normal text-muted-foreground">
                  ({t("results", { count: total })})
                </span>
              )}
            </h1>

            {/* Combobox de tri — remplace le Select */}
            <Combobox
              value={sortBy}
              onValueChange={(val) => {
                if (val) {
                  setSortBy(val)
                  setCurrentPage(1)
                }
              }}
            >
              <ComboboxInput
                showClear={false}
                placeholder={t("sortBy")}
                className="w-52"
                readOnly
              />
              <ComboboxContent>
                <ComboboxList>
                  {SORT_OPTIONS.map((opt) => (
                    <ComboboxItem key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </ComboboxItem>
                  ))}
                  <ComboboxEmpty>{t("noResults")}</ComboboxEmpty>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          {/* Grille de produits — squelette ou résultats */}
          {loadingProducts ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-xs font-bold text-foreground">{t("noResults")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("noResultsHint")}</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setFilters({ search: "", categories: [], maxPrice: "", onlyAvailable: false })
                    setCurrentPage(1)
                  }}
                >
                  {t("resetFilters")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <CatalogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
              />

              {/* Indicateur de page */}
              {totalPages > 1 && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {t("pagination.page", { current: currentPage, total: totalPages })}
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </Layout>
  )
}