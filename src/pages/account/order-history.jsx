/**
 * @file pages/account/order-history.jsx
 * Uses AccountNav (same position as profile) and shared UI components.
 */

import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Layout } from "@/components/layout/layout"
import { AccountNav } from "@/components/ui/account/account-nav"
import { getAccountOrders } from "@/api/user.js"
import { getMe } from "@/api/user.js"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { OrderGroup, OrderHistorySkeleton } from "@/components/ui/account/order"
import { YearCombobox } from "@/components/ui/account/year-combobox"
import { getYear } from "@/lib/utils"

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