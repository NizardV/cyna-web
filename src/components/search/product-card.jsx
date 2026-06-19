/**
 * @file components/ui/catalog/product-card.jsx
 *
 * ProductDto (v1) : { id, name, description, status, imageUrl, price }
 * status : "Active" | "Inactive" | "Archived"  (PascalCase, enum .NET)
 *
 * La card affiche le prix `price` directement — pas de pricingPlans
 * sur le DTO catalogue.
 */

import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn, formatPrice } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Helpers — status PascalCase → badge
// ---------------------------------------------------------------------------

/**
 * Mappe les valeurs de l'enum ProductStatus (.NET) vers les props de Badge.
 * @param {"Active"|"Inactive"|"Archived"|string} status
 * @returns {{ variant: string, labelKey: string, isAvailable: boolean }}
 */
function resolveStatusBadge(status) {
  switch (status) {
    case "Available":
      return { variant: "default",     labelKey: "product.available", isAvailable: true }
    case "Unavailable":
      return { variant: "secondary",   labelKey: "product.unavailable",  isAvailable: false }
    case "OutOfStock":
      return { variant: "destructive", labelKey: "product.outOfStock",  isAvailable: false }
    default:
      return { variant: "secondary",   labelKey: "product.inactive",  isAvailable: false }
  }
}

// ---------------------------------------------------------------------------
// ProductCard
// ---------------------------------------------------------------------------

/**
 * Carte de présentation d'un produit SaaS (shape ProductDto v1).
 * @param {{ product: object }} props
 */
export function ProductCard({ product }) {
  const { t } = useTranslation("search")

  const { variant: badgeVariant, labelKey, isAvailable } = resolveStatusBadge(product.status)

  return (
    <Link to={`/products/${product.id}`} className="block">
      <Card
        className={cn(
          "flex flex-col transition-colors hover:ring-1 hover:ring-primary cursor-pointer",
          !isAvailable && "opacity-75"
        )}
      >
        {/* Vignette */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className={cn(
            "relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40",
            isAvailable ? "bg-muted text-primary" : "bg-muted/50 text-muted-foreground"
          )}
        />

        <CardContent className="flex flex-1 flex-col gap-2 pt-3">
          <h3 className="text-xs font-bold text-foreground">{product.name}</h3>
          <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>

          <div className="mt-auto flex items-end justify-between pt-3">
            <div className="flex flex-col gap-1">
              <Badge variant={badgeVariant}>
                {t(labelKey, { defaultValue: product.status })}
              </Badge>

              {/* Prix depuis ProductDto.price — toujours présent */}
              {isAvailable && product.price != null && (
                <p className="text-sm font-extrabold text-primary">
                  {t("product.from")} {formatPrice(product.price)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {t("product.perMonth")}
                  </span>
                </p>
              )}
            </div>

            <Button
              size="sm"
              disabled={!isAvailable}
              variant={isAvailable ? "default" : "outline"}
              tabIndex={-1}
            >
              {t("product.details")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Squelette
// ---------------------------------------------------------------------------

export function ProductCardSkeleton() {
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