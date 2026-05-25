import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatPrice } from "@/lib/utils"
import { useTranslation } from "react-i18next"

// ---------------------------------------------------------------------------
// StatusBadge
// ---------------------------------------------------------------------------

const STATUS_STYLES = {
  active:     "bg-green-100 text-green-800",
  terminated: "bg-gray-100 text-gray-800",
  refunded:   "bg-red-100 text-red-800",
  paid:       "bg-green-100 text-green-800",
  pending:    "bg-amber-100 text-amber-800",
  failed:     "bg-red-100 text-red-800",
}

// ---------------------------------------------------------------------------
// OrderRow — inside a Card
// ---------------------------------------------------------------------------

function OrderRow({ order, isLast }) {
  const { t } = useTranslation("order-history")

  const paymentLine = order.paymentLast4
    ? t("paidViaCard", { method: order.paymentMethod, last4: order.paymentLast4 })
    : t("paidVia", { method: order.paymentMethod })

  return (
    <div
      className={cn(
        "flex flex-col items-start justify-between gap-4 p-4 transition-colors hover:bg-muted/40 md:flex-row md:items-center",
        !isLast && "border-b border-border"
      )}
    >
      {/* Left: name + meta */}
      <div className="flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-foreground">{order.productName}</span>
          <Badge className={STATUS_STYLES[order.status] ?? STATUS_STYLES.terminated} >
            {t(`status.${order.status}`, { defaultValue: order.status })}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("orderedOn", { date: formatDate(order.createdAt) })} • {order.type}
        </p>
      </div>

      {/* Center: amount */}
      <div className="text-right">
        <p className="text-sm font-extrabold text-foreground">{formatPrice(order.total)}</p>
        <p className="text-xs text-muted-foreground">{paymentLine}</p>
      </div>

      {/* Right: actions */}
      <div className="flex gap-2">
        {order.invoiceUrl && (
          <Button variant="secondary" size="sm" asChild>
            <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t("invoicePdf")}
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// OrderGroup — one Card per year
// ---------------------------------------------------------------------------

export function OrderGroup({ year, orders, dimmed }) {
  const { t } = useTranslation("order-history")

  return (
    <div className={cn(dimmed && "opacity-75")}>
      <h2 className="mb-3 border-b border-border pb-2 text-sm font-bold text-foreground">
        {t("ordersIn", { year })}
      </h2>
      <Card>
        <CardContent className="p-0">
          {orders.map((order, i) => (
            <OrderRow key={order.id} order={order} isLast={i === orders.length - 1} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// OrderHistorySkeleton
// ---------------------------------------------------------------------------

export function OrderHistorySkeleton() {
  return (
    <div className="space-y-6">
      {[2024, 2023].map((year) => (
        <div key={year}>
          <Skeleton className="mb-3 h-4 w-40" />
          <Card>
            <CardContent className="p-0">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 border-b border-border p-4 last:border-0"
                >
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                  <div className="flex gap-2">
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-7 w-24" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}