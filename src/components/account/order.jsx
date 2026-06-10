/**
 * @file components/ui/account/order.jsx
 *
 * Aligné sur OrderSummaryDto (v1) :
 *   { id, status, totalAmount, createdAt, invoiceUrl,
 *     items: OrderItemDto[] }
 *
 * OrderItemDto :
 *   { id, productNameSnapshot, planNameSnapshot, quantityUsers, quantityDevices }
 *
 * Les champs inexistants du DTO (productName, total, type, paymentMethod…)
 * sont calculés ou omis ici.
 */

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatPrice } from "@/lib/utils"
import { useTranslation } from "react-i18next"

// ---------------------------------------------------------------------------
// Helpers — status PascalCase → badge style
// ---------------------------------------------------------------------------

const STATUS_STYLES = {
  // PascalCase depuis l'enum .NET
  Paid:     "bg-green-100 text-green-800",
  Pending:  "bg-amber-100 text-amber-800",
  Failed:   "bg-red-100 text-red-800",
  Refunded: "bg-blue-100 text-blue-800",
  // Fallback lowercase pour compatibilité
  paid:     "bg-green-100 text-green-800",
  pending:  "bg-amber-100 text-amber-800",
  failed:   "bg-red-100 text-red-800",
  refunded: "bg-blue-100 text-blue-800",
}

/**
 * Résume une liste d'OrderItemDto en une ligne lisible.
 * Ex: "Cyna EDR Pro × 3 users, Shield XDR Suite"
 * @param {object[]} items
 * @returns {string}
 */
function summarizeItems(items = []) {
  if (!items.length) return "—"
  return items
    .map((item) => {
      const parts = [item.productNameSnapshot]
      if (item.planNameSnapshot) parts.push(`(${item.planNameSnapshot})`)
      const qty = []
      if (item.quantityUsers > 0)   qty.push(`${item.quantityUsers}u`)
      if (item.quantityDevices > 0) qty.push(`${item.quantityDevices}app`)
      if (qty.length) parts.push(`× ${qty.join(", ")}`)
      return parts.join(" ")
    })
    .join(" • ")
}

// ---------------------------------------------------------------------------
// OrderRow
// ---------------------------------------------------------------------------

function OrderRow({ order, isLast }) {
  const { t } = useTranslation("order-history")

  // Nom du produit principal = premier item ou "—"
  const primaryName = order.items?.[0]?.productNameSnapshot ?? "—"
  // Résumé des items
  const itemsSummary = summarizeItems(order.items)

  return (
    <div
      className={cn(
        "flex flex-col items-start justify-between gap-4 p-4 transition-colors hover:bg-muted/40 md:flex-row md:items-center",
        !isLast && "border-b border-border"
      )}
    >
      {/* Gauche : nom + statut + items */}
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-foreground truncate">{primaryName}</span>
          <Badge className={STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-800"}>
            {t(`status.${order.status}`, { defaultValue: order.status })}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("orderedOn", { date: formatDate(order.createdAt) })}
        </p>
        {order.items?.length > 1 && (
          <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-sm" title={itemsSummary}>
            {itemsSummary}
          </p>
        )}
      </div>

      {/* Centre : montant depuis totalAmount */}
      <div className="text-right shrink-0">
        <p className="text-sm font-extrabold text-foreground">
          {order.totalAmount != null ? formatPrice(order.totalAmount) : "—"}
        </p>
        {order.items?.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {t("itemCount", { count: order.items.length, defaultValue: `${order.items.length} article(s)` })}
          </p>
        )}
      </div>

      {/* Droite : facture */}
      <div className="flex gap-2 shrink-0">
        {order.invoiceUrl && (
          <Button variant="secondary" size="sm" asChild>
            <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
// OrderGroup — une Card par année
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
// Squelette
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