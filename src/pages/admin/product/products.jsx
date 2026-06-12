import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchPagination } from "@/components/search/search-pagination"
import { ProductAdminTable } from "@/components/admin/product/table"
import { getProducts, deleteProduct } from "@/api/products"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"

const PAGE_SIZE = 5

export function AdminProducts() {
  const { t }       = useTranslation("admin-products")
  const navigate    = useNavigate()
  const initialized = useRef(false)

  const [products,     setProducts]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState("")
  const [statusFilter, setStatusFilter] = useState([])
  const [featuredSort, setFeaturedSort] = useState(null)
  const [page,         setPage]         = useState(1)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    getProducts()
      .then(data => { setProducts(Array.isArray(data) ? data : data?.items ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const resetPage = () => setPage(1)

  const handleDelete = async (id) => {
    if (!window.confirm(t("products.deleteConfirm"))) return
    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success(t("products.deleteSuccess"))
    } catch (err) {
      if (err?.status === 409) {
        toast.error(t("products.deleteErrorReferenced"), { duration: 6000 })
      } else {
        toast.error(t("products.deleteError"))
      }
    }
  }

  const handleStatusFilter = (v) => { setStatusFilter(v); resetPage() }
  const handleFeaturedSort = (v) => { setFeaturedSort(v); resetPage() }

  const filtered = products
    .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    .filter(p => statusFilter.length === 0 || statusFilter.includes(p.status))

  // Défini hors du sort pour ne pas être recréé à chaque comparaison
  const featuredScore = (p) => p.isFeatured ? 1 : 0

  const sorted = featuredSort
    ? [...filtered].sort((a, b) =>
        featuredSort === "yes"
          ? featuredScore(b) - featuredScore(a)
          : featuredScore(a) - featuredScore(b)
      )
    : filtered

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Layout>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{t("products.title")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("products.total", { count: products.length })}
            </p>
          </div>
          <Button onClick={() => navigate("/admin/products/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("products.new")}
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage() }}
            placeholder={t("products.searchPlaceholder")}
            className="pl-9"
          />
        </div>

        <ProductAdminTable
          loading={loading}
          products={paginated}
          onDelete={handleDelete}
          statusFilter={statusFilter}
          onStatusFilter={handleStatusFilter}
          featuredSort={featuredSort}
          onFeaturedSort={handleFeaturedSort}
        />

        <SearchPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

      </main>
    </Layout>
  )
}
