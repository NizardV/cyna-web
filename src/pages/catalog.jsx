/**
 * @file pages/catalog.jsx
 * Rebuilt to match search.html maquette.
 */

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { Layout } from "@/components/ui/layout/layout"
import { getCatalogProducts, getCategories } from "@/api/catalog.js"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
// AvailabilityBadge — pill shape to match maquette
// ---------------------------------------------------------------------------

function AvailabilityBadge({ available }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        available
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-700"
      )}
    >
      {available ? "Disponible" : "Service indisponible"}
    </span>
  )
}

// ---------------------------------------------------------------------------
// ProductCard — matches maquette card with image placeholder block
// ---------------------------------------------------------------------------

function ProductCard({ product, categoryName }) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border bg-card transition-colors hover:border-primary",
        !product.isAvailable && "bg-gray-50 opacity-75"
      )}
    >
      {/* Image placeholder */}
      <div
        className={cn(
          "flex h-32 items-center justify-center rounded-t-xl font-bold text-lg",
          product.isAvailable
            ? "bg-muted text-primary"
            : "bg-gray-200 text-gray-400"
        )}
      >
        {categoryName}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-bold text-foreground">{product.name}</h3>
        <p className="line-clamp-2 h-10 text-sm text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <AvailabilityBadge available={product.isAvailable} />
            {product.isAvailable && (
              <p className="mt-2 text-lg font-extrabold text-primary">
                {formatMonthlyPrice(product.priceMonthly)}{" "}
                <span className="text-xs font-normal text-muted-foreground">/mois</span>
              </p>
            )}
            {!product.isAvailable && (
              <p className="mt-2 text-lg font-extrabold text-muted-foreground">—</p>
            )}
          </div>
          <Button size="sm" disabled={!product.isAvailable} variant={product.isAvailable ? "default" : "outline"}>
            Détails
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ProductCardSkeleton
// ---------------------------------------------------------------------------

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border bg-card">
      <Skeleton className="h-32 rounded-t-xl rounded-b-none" />
      <div className="flex flex-col gap-2 p-5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="mt-4 flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// FilterSidebar — matches maquette layout with range slider for budget
// ---------------------------------------------------------------------------

function FilterSidebar({ categories, filters, onChange }) {
  return (
    <aside className="w-64 shrink-0">
      <h2 className="mb-6 text-lg font-bold text-foreground">
        Filtrer les services
      </h2>

      {/* Recherche */}
      <div className="mb-6 border-b border-border pb-6">
        <p className="mb-3 text-sm font-semibold text-foreground">Recherche</p>
        <Input
          type="search"
          placeholder="Titre ou description..."
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      {/* Catégories */}
      <div className="mb-6 border-b border-border pb-6">
        <p className="mb-3 text-sm font-semibold text-foreground">Catégories</p>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <Label
              key={cat.id}
              className="flex cursor-pointer items-center gap-2 text-sm font-normal text-muted-foreground"
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

      {/* Budget — range slider like maquette */}
      <div className="mb-6 border-b border-border pb-6">
        <p className="mb-3 text-sm font-semibold text-foreground">Budget (Mensuel)</p>
        <input
          type="range"
          min="0"
          max="1000"
          step="10"
          value={filters.maxPrice || 1000}
          onChange={(e) => onChange({ maxPrice: e.target.value })}
          className="w-full accent-primary"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>0€</span>
          <span>{filters.maxPrice ? `${filters.maxPrice}€` : "max"}</span>
        </div>
      </div>

      {/* Disponibilité */}
      <Label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={filters.onlyAvailable}
          onChange={(e) => onChange({ onlyAvailable: e.target.checked })}
          className="accent-primary"
        />
        Uniquement services disponibles
      </Label>
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
      <main className="flex gap-8 p-8 max-w-7xl mx-auto w-full">

        {/* Sidebar */}
        {loadingCategories ? (
          <aside className="hidden w-64 shrink-0 space-y-3 md:block">
            <Skeleton className="h-5 w-40 mb-6" />
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-3 w-full" />)}
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

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              Résultats de recherche{" "}
              {!loadingProducts && (
                <span className="text-base font-normal text-muted-foreground">
                  ({sorted.length} service{sorted.length !== 1 ? "s" : ""})
                </span>
              )}
            </h1>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20 text-center">
              <p className="font-bold text-foreground">Aucun résultat</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Essayez de modifier vos critères de recherche.
              </p>
              <Button
                variant="link"
                className="mt-3"
                onClick={() => setFilters({ search: "", categories: [], maxPrice: "", onlyAvailable: false })}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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