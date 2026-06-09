/**
 * @file pages/account/order-history.jsx
 *
 * Aligné sur OrderSummaryDto (v1) :
 *   { id, status, totalAmount, createdAt, invoiceUrl, items: OrderItemDto[] }
 *
 * Correction : la recherche textuelle porte sur
 *   items[].productNameSnapshot  (remplace order.productName inexistant)
 */

import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Layout } from "@/components/layout/layout"
import { AccountNav } from "@/components/account/account-nav"
import { getAccountOrders, getMe } from "@/api/user.js"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { OrderGroup, OrderHistorySkeleton } from "@/components/account/order"
import { YearCombobox } from "@/components/account/year-combobox"
import { getYear } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Vérifie si une commande contient le terme de recherche
 * dans l'un de ses productNameSnapshot.
 * @param {object} order  OrderSummaryDto
 * @param {string} query
 * @returns {boolean}
 */
function orderMatchesSearch(order, query) {
  if (!query) return true
  const q = query.toLowerCase()
  return (order.items ?? []).some((item) =>
    item.productNameSnapshot?.toLowerCase().includes(q)
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

  // Filtre : recherche sur productNameSnapshot + filtre année sur createdAt
  const filteredOrders = orders.filter((order) => {
    const matchSearch = orderMatchesSearch(order, searchQuery)
    const matchYear =
      selectedYear === "all" ||
      getYear(order.createdAt) === parseInt(selectedYear, 10)
    return matchSearch && matchYear
  })

  const allYears = [...new Set(orders.map((o) => getYear(o.createdAt)))].sort((a, b) => b - a)
  const years    = [...new Set(filteredOrders.map((o) => getYear(o.createdAt)))].sort((a, b) => b - a)
  const grouped  = years.map((year) => ({
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

        {/* Contenu principal */}
        <div className="min-w-0 flex-1">

          {/* En-tête + filtres */}
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

          {/* États */}
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