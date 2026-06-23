/**
 * @file components/admin/dashboard/top-products.jsx
 * @description Liste classée des produits les plus performants (TopProductDto[]).
 */

import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice } from "@/lib/utils"

function TopProductRow({ product, rank }) {
  const { t } = useTranslation("admin-dashboard")

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
        {rank}
      </span>
      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.productName}
          className="h-10 w-14 shrink-0 rounded-md object-cover bg-muted"
          onError={(e) => { e.target.style.visibility = "hidden" }}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{product.productName}</p>
        <p className="text-xs text-muted-foreground">
          {t("topProducts.orderCount", { count: product.ordersCount })}
        </p>
      </div>
      <p className="shrink-0 text-sm font-bold text-foreground tabular-nums">
        {formatPrice(product.revenue)}
      </p>
    </div>
  )
}

function TopProductsSkeleton() {
  return (
    <div className="space-y-3 py-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-14 rounded-md" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

export function TopProducts({ products, loading }) {
  const { t } = useTranslation("admin-dashboard")

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{t("topProducts.title")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 px-4">
        {loading ? (
          <TopProductsSkeleton />
        ) : (products ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("topProducts.empty")}</p>
        ) : (
          <div>
            {products.map((product, i) => (
              <TopProductRow key={product.productId} product={product} rank={i + 1} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}