import { useTranslation } from "react-i18next"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/utils"

// ---------------------------------------------------------------------------
// ProductCard — carte d'un service du catalogue
// ---------------------------------------------------------------------------

/**
 * Carte de présentation d'un produit SaaS.
 *
 * @param {{ product: object }} props
 */
export function ProductCard({ product }) {
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
        src={product.imageUrl}
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
                  {formatPrice(product.priceMonthly)}{" "}
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