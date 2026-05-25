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
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import { useDebounce } from "@/hooks/useDebounce.js"
import { CatalogPagination } from "@/components/ui/catalog/catalog-pagination"
import { FilterSidebar, FilterSidebarSkeleton } from "@/components/ui/catalog/filter-sidebar"
import { ProductCard, ProductCardSkeleton } from "@/components/ui/catalog/product-card"

// ---------------------------------------------------------------------------
// Constante — nombre d'éléments par page
// ---------------------------------------------------------------------------

/** @type {number} Taille de page par défaut */
const PAGE_SIZE = 9

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

  const debouncedSearch = useDebounce(filters.search, 700)
  const debouncedCategories = useDebounce(filters.categories, 1000)
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 500)

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
    if (debouncedCategories.length > 0) params.categoryIds = debouncedCategories.join(",")
    if (debouncedMaxPrice !== "" && debouncedMaxPrice !== "1000") {
      params.maxPrice = debouncedMaxPrice
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
  }, [debouncedSearch, debouncedCategories, debouncedMaxPrice, filters.onlyAvailable, sortBy, currentPage])

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