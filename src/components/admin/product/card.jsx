import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"

const STATUS_VARIANT = {
  Active:   "default",
  Inactive: "outline",
  Archived: "destructive",
}

export function ProductAdminCard({ product, onDelete }) {
  const { t } = useTranslation("admin")
  const variant = STATUS_VARIANT[product.status] ?? "outline"

  return (
    <TableRow className="hover:bg-muted/20 transition-colors">

      <TableCell className="px-4 py-5 whitespace-normal">
        <div className="flex items-center gap-4">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-20 w-32 rounded-lg object-cover bg-muted shrink-0"
            onError={e => { e.target.src = "https://placehold.co/128x80?text=?" }}
          />
          <div className="min-w-0">
            <p className="font-bold text-base text-foreground">{product.name}</p>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-3 max-w-lg">
              {product.description}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell className="px-4 py-5 whitespace-nowrap">
        <Badge variant={variant}>
          {t(`status.${product.status?.toLowerCase()}`)}
        </Badge>
      </TableCell>

      <TableCell className="px-4 py-5 whitespace-nowrap">
        {product.isFeatured
          ? (
            <Badge variant="outline" className="text-amber-600 border-amber-300 gap-1.5">
              {t("featured.yes")}
              {product.displayOrder != null && (
                <span className="font-mono text-amber-500">#{product.displayOrder}</span>
              )}
            </Badge>
          )
          : <span className="text-muted-foreground text-xs">{t("featured.no")}</span>
        }
      </TableCell>

      <TableCell className="px-4 py-5">
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to={`/admin/products/${product.id}/edit`}>
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>

    </TableRow>
  )
}

export function ProductAdminCardSkeleton() {
  return (
    <TableRow>
      <TableCell className="px-4 py-5 whitespace-normal">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-32 rounded-lg shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-80" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </TableCell>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableCell key={i} className="px-4 py-5">
          <Skeleton className="h-5 w-16" />
        </TableCell>
      ))}
    </TableRow>
  )
}
