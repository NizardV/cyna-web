/**
 * @file components/admin/categories/category-table.jsx
 * @description Table paginée des catégories avec tri, squelettes de chargement et actions.
 */

import { useTranslation } from "react-i18next"
import {
  ArrowUp, ArrowDown, ArrowUpDown, ImageOff, Pencil, Trash2,
} from "lucide-react"

import { Badge }    from "@/components/ui/badge"
import { Button }   from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"

// ---------------------------------------------------------------------------
// Sort icon
// ---------------------------------------------------------------------------

const SORT_COLS = {
  displayOrder: { asc: "displayOrder", desc: "displayOrder_desc" },
  name:         { asc: "name",         desc: "name_desc" },
  productCount: { asc: "productCount", desc: "productCount_desc" },
}

function SortIcon({ col, sortBy }) {
  const asc  = SORT_COLS[col]?.asc
  const desc = SORT_COLS[col]?.desc
  if (sortBy === asc)  return <ArrowUp   className="ml-1 inline size-3" />
  if (sortBy === desc) return <ArrowDown className="ml-1 inline size-3" />
  return <ArrowUpDown className="ml-1 inline size-3 opacity-40" />
}

// ---------------------------------------------------------------------------
// Skeleton row
// ---------------------------------------------------------------------------

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="size-9 rounded-md" /></TableCell>
      <TableCell><Skeleton className="h-3.5 w-40" /></TableCell>
      <TableCell><Skeleton className="h-3.5 w-28" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-3.5 w-52" /></TableCell>
      <TableCell><Skeleton className="h-5 w-10 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-5 w-8 rounded-full" /></TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
        </div>
      </TableCell>
    </TableRow>
  )
}

// ---------------------------------------------------------------------------
// Category table
// ---------------------------------------------------------------------------

const PAGE_SIZE = 5

/**
 * @param {{
 *   rows: object[],
 *   loading: boolean,
 *   sortBy: string,
 *   search: string,
 *   onSort: (col: string) => void,
 *   onEdit: (cat: object) => void,
 *   onDelete: (cat: object) => void,
 *   onClearSearch: () => void,
 * }} props
 */
export function CategoryTable({ rows, loading, sortBy, search, onSort, onEdit, onDelete, onClearSearch }) {
  const { t } = useTranslation("categories")

  return (
    <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">{t("table.image")}</TableHead>
            <TableHead>
              <button
                className="inline-flex items-center font-medium hover:text-foreground"
                onClick={() => onSort("name")}
              >
                {t("table.name")} <SortIcon col="name" sortBy={sortBy} />
              </button>
            </TableHead>
            <TableHead>{t("table.slug")}</TableHead>
            <TableHead className="hidden md:table-cell">{t("table.description")}</TableHead>
            <TableHead>
              <button
                className="inline-flex items-center font-medium hover:text-foreground"
                onClick={() => onSort("productCount")}
              >
                {t("table.products")} <SortIcon col="productCount" sortBy={sortBy} />
              </button>
            </TableHead>
            <TableHead>
              <button
                className="inline-flex items-center font-medium hover:text-foreground"
                onClick={() => onSort("displayOrder")}
              >
                {t("table.order")} <SortIcon col="displayOrder" sortBy={sortBy} />
              </button>
            </TableHead>
            <TableHead className="w-20">{t("table.actions")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            Array.from({ length: PAGE_SIZE }).map((_, i) => <TableRowSkeleton key={i} />)
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                {t("empty.noResults")}
                {search && (
                  <button
                    className="ml-1 underline underline-offset-2 hover:text-foreground"
                    onClick={onClearSearch}
                  >
                    {t("empty.clearSearch")}
                  </button>
                )}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="size-9 rounded-md object-cover bg-muted"
                      onError={(e) => { e.currentTarget.style.display = "none" }}
                    />
                  ) : (
                    <div className="size-9 rounded-md bg-muted flex items-center justify-center">
                      <ImageOff className="size-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium text-foreground">{cat.name}</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    {cat.slug}
                  </code>
                </TableCell>
                <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                  {cat.description ?? <span className="italic opacity-50">—</span>}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{cat.productCount}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">{cat.displayOrder}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(cat)}
                      title={t("actions.edit")}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(cat)}
                      title={t("actions.delete")}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}