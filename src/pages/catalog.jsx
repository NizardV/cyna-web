/**
 * @file pages/catalog.jsx
 * Uses shared UI components: Card, Button, Input, Label, Select, Skeleton.
 */

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { Layout } from "@/components/ui/layout/layout"
import { getCatalogProducts, getCategories } from "@/api/catalog.js"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebounce } from "@/hooks/useDebounce.js"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatMonthlyPrice(price) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price)
}

// ---------------------------------------------------------------------------
// ProductCard — uses Card component
// ---------------------------------------------------------------------------

function ProductCard({ product, categoryName }) {
  return (
    <Card
      className={cn(
        "flex flex-col transition-colors hover:ring-primary",
        !product.isAvailable && "opacity-75"
      )}
    >
      {/* Image placeholder */}
      <img
        src="https://avatar.vercel.sh/shadcn1"
        alt="Event cover"
        className={cn(
          "relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40",
          product.isAvailable
            ? "bg-muted text-primary"
            : "bg-muted/50 text-muted-foreground"
        )}
      />

      <CardContent className="flex flex-1 flex-col gap-2 pt-3">
        <h3 className="text-xs font-bold text-foreground">{product.name}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex flex-col gap-1">
            {product.isAvailable ? (
              <>
                <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">Disponible</Badge>
                <p className="text-sm font-extrabold text-primary">
                  {formatMonthlyPrice(product.priceMonthly)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">/mois</span>
                </p>
              </>
            ) : (
              <>
                <Badge variant="destructive">Indisponible</Badge>
              </>
            )}
          </div>
          <Button
            size="sm"
            disabled={!product.isAvailable}
            variant={product.isAvailable ? "default" : "outline"}
          >
            Détails
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// ProductCardSkeleton — uses Card + Skeleton
// ---------------------------------------------------------------------------

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
// FilterSidebar — uses Input, Label, shared primitives
// ---------------------------------------------------------------------------

function FilterSidebar({ categories, filters, onChange }) {
  return (
    <aside className="w-56 shrink-0">
      <h2 className="mb-4 text-sm font-bold text-foreground">
        Filtrer les services
      </h2>

      {/* Recherche */}
      <div className="mb-4 border-b border-border pb-4">
        <p className="mb-2 text-xs font-semibold text-foreground">Recherche</p>
        <Input
          type="search"
          placeholder="Titre ou description..."
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      {/* Catégories */}
      <div className="mb-4 border-b border-border pb-4">
        <p className="mb-2 text-xs font-semibold text-foreground">Catégories</p>
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
              Solutions {cat.name}
            </Label>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="mb-4 border-b border-border pb-4">
        <p className="mb-2 text-xs font-semibold text-foreground">Budget (Mensuel)</p>
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
          <span>{filters.maxPrice ? `${filters.maxPrice}€` : "max"}</span>
        </div>
      </div>

      {/* Disponibilité */}
      <Label className="flex cursor-pointer items-center gap-2 font-medium">
        <input
          type="checkbox"
          checked={filters.onlyAvailable}
          onChange={(e) => onChange({ onlyAvailable: e.target.checked })}
          className="accent-primary"
        />
        Uniquement disponibles
      </Label>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// FilterSidebarSkeleton
// ---------------------------------------------------------------------------

function FilterSidebarSkeleton() {
  return (
    <aside className="hidden w-56 shrink-0 space-y-3 md:block">
      <Skeleton className="h-4 w-40 mb-4" />
      {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-3 w-full" />)}
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

export function Catalog() {
  const [searchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [sortBy, setSortBy] = useState("relevance")
  const [filters, setFilters] = useState({
    search: searchParams.get("q") || "",
    categories: [],
    maxPrice: "",
    onlyAvailable: false,
  })

  const debouncedSearch = useDebounce(filters.search, 300)
  const handleFilterChange = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }, [])

  useEffect(() => {
    setLoadingProducts(true)
    getCatalogProducts()
      .then((data) => { setProducts(data); setLoadingProducts(false) })
      .catch(() => setLoadingProducts(false))
  }, [])

  useEffect(() => {
    setLoadingCategories(true)
    getCategories()
      .then((data) => { setCategories(data); setLoadingCategories(false) })
      .catch(() => setLoadingCategories(false))
  }, [])

  const filtered = products.filter((p) => {
    if (
      debouncedSearch &&
      !p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
      !p.description.toLowerCase().includes(debouncedSearch.toLowerCase())
    ) return false
    if (filters.categories.length > 0 && !filters.categories.includes(p.categoryId)) return false
    if (filters.maxPrice !== "" && p.priceMonthly > parseFloat(filters.maxPrice)) return false
    if (filters.onlyAvailable && !p.isAvailable) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price_asc") return a.priceMonthly - b.priceMonthly
    if (sortBy === "price_desc") return b.priceMonthly - a.priceMonthly
    if (sortBy === "name") return a.name.localeCompare(b.name)
    return 0
  })

  const getCategoryName = (categoryId) =>
    categories.find((c) => c.id === categoryId)?.name ?? "Service"

  return (
    <Layout>
      <main className="flex w-full max-w-7xl mx-auto gap-8 p-8">

        {/* Sidebar */}
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

        {/* Results */}
        <div className="min-w-0 flex-1">
          {/* Header row */}
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-sm font-bold text-foreground">
              Résultats de recherche{" "}
              {!loadingProducts && (
                <span className="font-normal text-muted-foreground">
                  ({sorted.length} service{sorted.length !== 1 ? "s" : ""})
                </span>
              )}
            </h1>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Trier par : Pertinence</SelectItem>
                <SelectItem value="price_asc">Prix : Croissant</SelectItem>
                <SelectItem value="price_desc">Prix : Décroissant</SelectItem>
                <SelectItem value="name">Nom A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          {loadingProducts ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : sorted.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-xs font-bold text-foreground">Aucun résultat</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Essayez de modifier vos critères de recherche.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => setFilters({ search: "", categories: [], maxPrice: "", onlyAvailable: false })}
                >
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
      </main>
    </Layout>
  )
}