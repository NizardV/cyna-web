/**
 * @file pages/admin/dashboard.jsx
 * @description Page dashboard admin — vue d'ensemble CA / commandes / utilisateurs / abonnements.
 *
 * Consomme les DTOs du contrôleur .NET DashboardController via getDashboardData() :
 *   RevenueStatsDto, OrderStatsDto, UserStatsDto, SubscriptionStatsDto, TopProductDto[]
 *
 * Toutes les routes acceptent ?mock=true — utile tant que le module de paiement
 * est développé en parallèle (voir RevenueStatsDto.cs côté backend).
 */

import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Layout } from "@/components/layout/layout"
import {
  KpiCard,
  KpiCardSkeleton,
  DashboardHeader,
  RevenueOrdersChart,
  UsersChart,
  StatusesCard,
  TopProducts,
} from "@/components/admin/dashboard"
import { getDashboardData } from "@/api/dashboard.js"
import { formatPrice } from "@/lib/utils"

export function AdminDashboard() {
  const { t } = useTranslation("admin-dashboard")

  const [period,  setPeriod]  = useState("month")
  const [useMock, setUseMock] = useState(false)
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getDashboardData({ period, mock: useMock ? "true" : "false" })
      .then((result) => { if (!cancelled) setData(result) })
      .catch(() => {
        if (!cancelled) toast.error(t("loadError"))
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [period, useMock, t])

  return (
    <Layout>
      <div className="flex flex-col gap-6 p-6">

        <DashboardHeader
          period={period}
          onPeriodChange={setPeriod}
          useMock={useMock}
          onMockToggle={() => setUseMock((v) => !v)}
        />

        {useMock && (
          <p className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
            {t("mock.banner")}
          </p>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
          ) : (
            <>
              <KpiCard
                label={t("kpi.revenue")}
                value={formatPrice(data?.revenue?.total ?? 0)}
                sublabel={t("kpi.vsPrevious")}
                trend={data?.revenue?.growthPercent}
              />
              <KpiCard
                label={t("kpi.orders")}
                value={data?.orders?.total ?? 0}
                sublabel={t("kpi.onPeriod")}
              />
              <KpiCard
                label={t("kpi.users")}
                value={data?.users?.total ?? 0}
                sublabel={t("kpi.newUsers", { count: data?.users?.newInPeriod ?? 0 })}
              />
              <KpiCard
                label={t("kpi.activeSubscriptions")}
                value={data?.subscriptions?.active ?? 0}
                sublabel={t("kpi.createdOnPeriod", { count: data?.subscriptions?.total ?? 0 })}
              />
            </>
          )}
        </div>

        {/* Graphique CA + commandes */}
        <RevenueOrdersChart
          revenueByMonth={data?.revenue?.byMonth}
          ordersByMonth={data?.orders?.byMonth}
          loading={loading}
        />

        {/* Inscriptions + statuts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <UsersChart byMonth={data?.users?.byMonth} loading={loading} />
          <StatusesCard
            ordersByStatus={data?.orders?.byStatus}
            subscriptionsByStatus={data?.subscriptions?.byStatus}
            loading={loading}
          />
        </div>

        {/* Top produits */}
        <TopProducts products={data?.topProducts} loading={loading} />

      </div>
    </Layout>
  )
}

export default AdminDashboard