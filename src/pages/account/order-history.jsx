/**
 * @file pages/account/order-history.jsx
 * Uses AccountNav (same position as profile) and shared UI components.
 */

import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Layout } from "@/components/ui/layout/layout"
import { AccountNav } from "@/components/ui/account/account-nav"
import { getAccountOrders } from "@/api/orders.js"
import { getMe } from "@/api/user.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(amount) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount)
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    day: "numeric", month: "long", year: "numeric",
  })
}

function getYear(isoDate) {
  return new Date(isoDate).getFullYear()
}

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

function StatusBadge({ status }) {
  const { t } = useTranslation("order-history")

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
        STATUS_STYLES[status] ?? STATUS_STYLES.terminated
      )}
    >
      {t(`status.${status}`, { defaultValue: status })}
    </span>
  )
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
          <StatusBadge status={order.status} />
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

function OrderGroup({ year, orders, dimmed }) {
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

function OrderHistorySkeleton() {
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

// ---------------------------------------------------------------------------
// YearCombobox — replaces the Select for year filtering
// ---------------------------------------------------------------------------

function YearCombobox({ value, onChange, years, t }) {
  // Build items: "all" + each year string
  const items = [
    { value: "all", label: t("allYears") },
    ...years.map((y) => ({ value: String(y), label: t("year", { year: y }) })),
  ]

  const selectedLabel = items.find((i) => i.value === value)?.label ?? t("allYears")

  return (
    <Combobox
      value={value}
      onValueChange={onChange}
    >
      <ComboboxInput
        placeholder={selectedLabel}
        className="w-40"
        showClear={value !== "all"}
      />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxEmpty>{t("noResults", { defaultValue: "Aucun résultat" })}</ComboboxEmpty>
          {items.map((item) => (
            <ComboboxItem key={item.value} value={item.value}>
              {item.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

export function OrderHistory() {
  const { t } = useTranslation("order-history")

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYear, setSelectedYear] = useState("all")

  useEffect(() => {
    Promise.all([getAccountOrders(), getMe()])
      .then(([ordersData, userData]) => {
        setOrders(ordersData)
        setUser(userData)
        setLoading(false)
        setLoadingUser(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
        setLoadingUser(false)
      })
  }, [])

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      searchQuery === "" ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchYear =
      selectedYear === "all" ||
      getYear(order.createdAt) === parseInt(selectedYear, 10)
    return matchSearch && matchYear
  })

  const allYears = [...new Set(orders.map((o) => getYear(o.createdAt)))].sort((a, b) => b - a)
  const years = [...new Set(filteredOrders.map((o) => getYear(o.createdAt)))].sort((a, b) => b - a)
  const grouped = years.map((year) => ({
    year,
    orders: filteredOrders.filter((o) => getYear(o.createdAt) === year),
  }))

  return (
    <Layout>
      <main className="flex w-full flex-col gap-8 py-8 md:flex-row">

        {/* Sidebar */}
        <div className="w-full md:w-52 md:shrink-0">
          <AccountNav user={loadingUser ? undefined : user ?? undefined} />
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">

          {/* Page header + filters */}
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-lg font-bold text-foreground">{t("title")}</h1>
              <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <YearCombobox
                value={selectedYear}
                onChange={(val) => setSelectedYear(val ?? "all")}
                years={allYears}
                t={t}
              />
            </div>
          </div>

          {/* Content */}
          {loading && <OrderHistorySkeleton />}

          {error && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-xs text-destructive">{t("error", { message: error })}</p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && grouped.length === 0 && (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-xs font-bold text-foreground">{t("noOrders")}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {searchQuery ? t("noOrdersHint") : t("noOrdersEmpty")}
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && grouped.length > 0 && (
            <div className="space-y-6">
              {grouped.map(({ year, orders: yearOrders }, i) => (
                <OrderGroup key={year} year={year} orders={yearOrders} dimmed={i > 0} />
              ))}
            </div>
          )}
        </div>
      </main>
    </Layout>
  )
}