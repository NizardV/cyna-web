import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Layout } from "@/components/layout/layout"
import { getCategoryCatalog } from "@/api/products.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@/hooks/useDebounce.js"
import { SearchPagination } from "@/components/search/search-pagination"
import { FilterSidebar, FilterDrawer, FilterSidebarSkeleton } from "@/components/search/filter"
import { ProductCard, ProductCardSkeleton } from "@/components/search/product-card"
import { CategoryHeader } from "@/components/catalog/category-header"

export function Catalog() {
  const { t } = useTranslation("search") // On réutilise les trads de la recherche
  const { slug } = useParams() // Récupère le slug de la catégorie depuis l'URL

  // --- État de la page ---
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // --- État des filtres (Spécifiques à la catégorie) ---
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    search: "",
    categories: [], // Forcé à vide puisqu'on est déjà dans une catégorie
    maxPrice: "",
    onlyAvailable: false,
  })

  const debouncedSearch = useDebounce(filters.search, 700)
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 500)

  // --- Gestion des filtres ---
  const handleFilterChange = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setCurrentPage(1) // Retour page 1 si on filtre
  }, [])

  // --- Chargement des données API ---
  useEffect(() => {
    setLoading(true)
    setError(false)

    const params = {
      page: String(currentPage),
      pageSize: "9",
    }

    if (debouncedSearch) params.q = debouncedSearch
    if (debouncedMaxPrice && debouncedMaxPrice !== "1000") params.maxPrice = debouncedMaxPrice
    if (filters.onlyAvailable) params.available = "true"

    getCategoryCatalog(slug, params)
      .then((res) => {
        setData(res)
        console.log("API Response:", res) 
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [slug, debouncedSearch, debouncedMaxPrice, filters.onlyAvailable, currentPage])


  if (error) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold text-foreground">Catégorie introuvable</h1>
          <p className="text-muted-foreground mt-2">Cette catégorie n'existe pas ou n'est plus disponible.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      
      <CategoryHeader 
        loading={loading && !data} 
        imageUrl={data?.categoryImageUrl} 
        name={data?.categoryName}

        description={data?.categoryDescription} 
        
      />
      
      <main className="mx-auto flex w-full max-w-7xl gap-8 p-8">
        
        {/* Panneau de filtres (Sidebar Desktop) */}
        {loading && !data ? (
          
          <FilterSidebarSkeleton />
        ) : (
          <div className="hidden md:block">
            {/*  On utilise hideCategories={true} pour cacher les catégories dans le panneau de filtres */}
            <FilterSidebar
              categories={[]} 
              filters={filters}
              onChange={handleFilterChange}
              hideCategories={true} 
            />
          </div>
        )}

        {/* Zone des résultats (Produits) */}
        <div className="min-w-0 flex-1">
          
          {/* Header des résultats + Bouton mobile */}
          <div className="mb-5 flex items-center justify-between gap-2 md:flex-row flex-col">
            <h2 className="shrink-0 text-sm font-bold text-foreground">
              {t("resultsLabel")}{" "}
              {!loading && data && (
                <span className="font-normal text-muted-foreground">
                  ({t("results", { count: data.total })})
                </span>
              )}
            </h2>

            <div className="flex items-center gap-2">
              {/* Bouton Filtres (Mobile) */}
              <div className="md:hidden">
                <FilterDrawer
                  categories={[]}
                  filters={filters}
                  onChange={handleFilterChange}
                  hideCategories={true}
                />
              </div>
              
            </div>
          </div>

          {/* Grille de produits */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : data?.items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-xs font-bold text-foreground">{t("noResults")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("noResultsHint")}</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleFilterChange({ search: "", maxPrice: "", onlyAvailable: false })}
                >
                  {t("resetFilters")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {data.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <SearchPagination
                currentPage={data.page}
                totalPages={data.totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page)
                  window.scrollTo({ top: 300, behavior: "smooth" }) // Remonte juste sous la bannière
                }}
              />
            </>
          )}
        </div>
      </main>
    </Layout>
  )
}