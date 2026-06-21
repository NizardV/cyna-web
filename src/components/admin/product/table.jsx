import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProductAdminCard, ProductAdminCardSkeleton } from "./card"
import { ChevronDown, ChevronUp, ChevronsUpDown, SlidersHorizontal, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const TH_CLASS = "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"

// Valeurs alignées sur l'enum .NET ProductStatus
const STATUS_VALUES = ["Available", "Unavailable", "OutOfStock", "Preview"]

const SORT_ICON = {
  yes: <ChevronDown className="h-3.5 w-3.5 text-primary" />,
  no:  <ChevronUp   className="h-3.5 w-3.5 text-primary" />,
}

// ---------------------------------------------------------------------------
// StatusFilterDropdown
// ---------------------------------------------------------------------------

function StatusFilterDropdown({ value, onChange }) {
  const { t }             = useTranslation("admin-products")
  const [open, setOpen]   = useState(false)
  const [pending, setPending] = useState(value)
  const [pos, setPos]     = useState({ top: 0, left: 0 })
  const buttonRef   = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (!buttonRef.current?.contains(e.target) && !dropdownRef.current?.contains(e.target))
        setOpen(false)
    }
    // onScroll nommé pour pouvoir le retirer proprement dans le cleanup
    const onScroll = () => setOpen(false)
    document.addEventListener("mousedown", close)
    window.addEventListener("scroll", onScroll, { once: true })
    return () => {
      document.removeEventListener("mousedown", close)
      window.removeEventListener("scroll", onScroll)
    }
  }, [open])

  const handleOpen = () => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) setPos({ top: rect.bottom + 4, left: rect.left })
    setPending(value)
    setOpen(o => !o)
  }

  const toggle = (v) => setPending(prev =>
    prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]
  )

  return (
    <>
      <Button
        ref={buttonRef}
        type="button" variant="ghost" size="icon"
        className={cn("h-5 w-5 ml-1", value.length > 0 && "text-primary")}
        onClick={handleOpen}
      >
        <SlidersHorizontal className="h-3 w-3" />
      </Button>

      {/* Portal : un <th> ne peut pas contenir un dropdown absolument positionné sans être coupé */}
      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[200] min-w-[140px] rounded-md border bg-popover text-popover-foreground shadow-md p-1.5"
          style={{ top: pos.top, left: pos.left }}
        >
          {STATUS_VALUES.map(v => (
            <label
              key={v}
              className="flex items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-accent cursor-pointer"
            >
              <input
                type="checkbox"
                checked={pending.includes(v)}
                onChange={() => toggle(v)}
                className="h-3.5 w-3.5 accent-primary"
              />
              {t(`status.${v.toLowerCase()}`)}
            </label>
          ))}
          <div className="mt-1.5 border-t pt-1.5">
            <Button
              type="button" size="sm" className="w-full h-6 text-xs"
              onClick={() => { onChange(pending); setOpen(false) }}
            >
              {t("table.apply")}
            </Button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// FeaturedSortButton
// ---------------------------------------------------------------------------

function FeaturedSortButton({ value, onChange }) {
  const next = value === null ? "yes" : value === "yes" ? "no" : null
  const icon = SORT_ICON[value] ?? <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />

  return (
    <Button
      type="button" variant="ghost" size="icon"
      className="h-5 w-5 ml-1"
      onClick={() => onChange(next)}
    >
      {icon}
    </Button>
  )
}

// ---------------------------------------------------------------------------
// AdminTableHeader
// ---------------------------------------------------------------------------

function AdminTableHeader({ statusFilter, onStatusFilter, featuredSort, onFeaturedSort }) {
  const { t } = useTranslation("admin-products")

  return (
    <TableHeader className="bg-muted/40">
      <TableRow className="hover:bg-transparent">

        <TableHead className={TH_CLASS}>
          {t("table.product")}
        </TableHead>

        <TableHead className={cn(TH_CLASS, "w-36")}>
          <span className="flex items-center">
            {t("table.status")}
            <StatusFilterDropdown value={statusFilter} onChange={onStatusFilter} />
          </span>
        </TableHead>

        <TableHead className={cn(TH_CLASS, "w-40")}>
          <span className="flex items-center">
            <Star className="h-3 w-3 mr-1" />
            {t("table.featured")}
            <FeaturedSortButton value={featuredSort} onChange={onFeaturedSort} />
          </span>
        </TableHead>

        <TableHead className={cn(TH_CLASS, "text-right w-24")}>
          {t("table.actions")}
        </TableHead>

      </TableRow>
    </TableHeader>
  )
}

// ---------------------------------------------------------------------------
// TableRows
// ---------------------------------------------------------------------------

function TableRows({ loading, products, onDelete }) {
  const { t } = useTranslation("admin-products")

  if (loading) {
    return Array.from({ length: 5 }).map((_, i) => <ProductAdminCardSkeleton key={i} />)
  }
  if (products.length === 0) {
    return (
      <tr>
        <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
          {t("table.noResults")}
        </td>
      </tr>
    )
  }
  return products.map(product => (
    <ProductAdminCard key={product.id} product={product} onDelete={onDelete} />
  ))
}

// ---------------------------------------------------------------------------
// TableWrapper / Export
// ---------------------------------------------------------------------------

function TableWrapper({ children }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="w-full">
          <table className="w-full caption-bottom text-sm">
            {children}
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Tableau d'administration des produits avec filtre par statut et tri par mise en avant.
 *
 * @param {{
 *   products: object[],
 *   onDelete: (id: string) => void,
 *   loading: boolean,
 *   statusFilter: string[],
 *   onStatusFilter: (values: string[]) => void,
 *   featuredSort: "yes"|"no"|null,
 *   onFeaturedSort: (value: "yes"|"no"|null) => void
 * }} props
 */
export function ProductAdminTable({
  products,
  onDelete,
  loading,
  statusFilter,
  onStatusFilter,
  featuredSort,
  onFeaturedSort,
}) {
  return (
    <TableWrapper>
      <AdminTableHeader
        statusFilter={statusFilter}
        onStatusFilter={onStatusFilter}
        featuredSort={featuredSort}
        onFeaturedSort={onFeaturedSort}
      />
      <TableBody>
        <TableRows loading={loading} products={products} onDelete={onDelete} />
      </TableBody>
    </TableWrapper>
  )
}
