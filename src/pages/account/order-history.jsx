/**
 * @file pages/account/order-history.jsx
 * Rebuilt to match historique.html maquette.
 * Rows are flex layout (not Table) to match the maquette card-per-order style.
 */

import { useEffect, useState } from "react"
import { Layout } from "@/components/ui/layout/layout"
import { AccountNav } from "@/components/ui/account/account-nav"
import { getAccountOrders } from "@/api/orders.js"
import { getMe } from "@/api/user.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(amount) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount)
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  })
}

function getYear(isoDate) {
  return new Date(isoDate).getFullYear()
}

// ---------------------------------------------------------------------------
// StatusBadge — pill shape to match maquette
// ---------------------------------------------------------------------------

const STATUS_STYLES = {
  active:     "bg-green-100 text-green-800",
  terminated: "bg-gray-100 text-gray-800",
  refunded:   "bg-red-100 text-red-800",
  paid:       "bg-green-100 text-green-800",
  pending:    "bg-amber-100 text-amber-800",
  failed:     "bg-red-100 text-red-800",
}

function StatusBadge({ status, label }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
        STATUS_STYLES[status] ?? STATUS_STYLES.terminated
      )}
    >
      {label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// OrderRow — flex row layout as in maquette (not a table)
// ---------------------------------------------------------------------------

function OrderRow({ order, isLast }) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-between gap-6 p-6 transition-colors hover:bg-muted/40 md:flex-row md:items-center",
        !isLast && "border-b border-border"
      )}
    >
      {/* Left: name + meta */}
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-3">
          <h3 className="font-bold text-foreground">{order.productName}</h3>
          <StatusBadge status={order.status} label={order.statusLabel} />
        </div>
        <p className="text-sm text-muted-foreground">
          Commande passée le {formatDate(order.createdAt)} • {order.type}
        </p>
      </div>

      {/* Center: amount */}
      <div className="text-right">
        <p className="text-lg font-extrabold text-foreground">{formatPrice(order.total)}</p>
        <p className="text-xs text-muted-foreground">
          Payé via {order.paymentMethod}
          {order.paymentLast4 ? ` terminant par ${order.paymentLast4}` : ""}
        </p>
      </div>

      {/* Right: actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          Détails
        </Button>
        {order.invoiceUrl ? (
          <Button variant="secondary" size="sm" className="text-primary" asChild>
            <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer">
              <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Facture PDF
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// OrderGroup — one card per year
// ---------------------------------------------------------------------------

function OrderGroup({ year, orders, dimmed }) {
  return (
    <div className={cn(dimmed && "opacity-75")}>
      <h2 className="mb-4 border-b border-border pb-2 text-xl font-bold text-foreground">
        Commandes en {year}
      </h2>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {orders.map((order, i) => (
          <OrderRow key={order.id} order={order} isLast={i === orders.length - 1} />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function OrderHistorySkeleton() {
  return (
    <div className="space-y-8">
      {[2024, 2023].map((year) => (
        <div key={year}>
          <Skeleton className="mb-4 h-5 w-40" />
          <div className="rounded-xl border border-border bg-card shadow-sm">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between gap-6 border-b border-border p-6 last:border-0">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-6 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-28 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

export function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYear, setSelectedYear] = useState("all")

  useEffect(() => {
    Promise.all([getAccountOrders(), getMe()])
      .then(([ordersData, userData]) => {
        setOrders(ordersData)
        setUser(userData)
        setLoading(false)
      })
      .catch((err) => { setError(err.message); setLoading(false) })
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
      <main className="bg-gray-50 py-10 w-full flex flex-col gap-8 md:flex-row">
        <AccountNav user={user ?? undefined} />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ">

          {/* Page header + filters */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground">
                Historique des commandes
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Retrouvez toutes vos factures et abonnements souscrits.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Input
                type="text"
                placeholder="Rechercher une commande..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-52"
              />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Toutes les années" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les années</SelectItem>
                  {allYears.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      Année : {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          {loading && <OrderHistorySkeleton />}

          {error && (
            <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
              <p className="text-sm text-destructive">Erreur : {error}</p>
            </div>
          )}

          {!loading && !error && grouped.length === 0 && (
            <div className="rounded-xl border border-border bg-card py-16 text-center shadow-sm">
              <p className="font-bold text-foreground">Aucune commande trouvée</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery ? "Essayez un autre terme." : "Vous n'avez pas encore passé de commande."}
              </p>
            </div>
          )}

          {!loading && !error && grouped.length > 0 && (
            <div className="space-y-8">
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