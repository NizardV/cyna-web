/**
 * @file components/home/home-product-card.jsx
 */

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Helper pour le badge (repris de ton composant original)
function resolveStatusBadge(status) {
  switch (status) {
    case "available":
      return { variant: "default", labelKey: "product.available", isAvailable: true };
    case "unavailable":
      return { variant: "secondary", labelKey: "product.unavailable", isAvailable: false };
    case "outofstock":
      return { variant: "destructive", labelKey: "product.outOfStock", isAvailable: false };
    default:
      return { variant: "secondary", labelKey: "product.inactive", isAvailable: false };
  }
}

export function ProductCard({ product }) {
  // Tu peux utiliser le namespace "home" ou "search" selon où se trouvent tes clés de traduction
  const { t } = useTranslation("search"); 

  const { variant: badgeVariant, labelKey, isAvailable } = resolveStatusBadge(product.status);

  return (
    <Link to={`/products/${product.id}`} className="block h-full">
      <Card
        className={cn(
          "flex flex-col h-full overflow-hidden transition-all hover:shadow-md hover:ring-1 hover:ring-primary cursor-pointer",
          !isAvailable && "opacity-75"
        )}
      >
       
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
          />
        </div>

        <CardContent className="flex flex-1 flex-col gap-3 pt-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-foreground line-clamp-1">
              {product.name}
            </h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {product.shortDescription}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between pt-4">
            <Badge variant={badgeVariant}>
              {t(labelKey, { defaultValue: product.status })}
            </Badge>

            <Button
              
            >
              {t("product.details", { defaultValue: "Détails" })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}