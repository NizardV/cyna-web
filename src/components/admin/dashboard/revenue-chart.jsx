/**
 * @file components/admin/dashboard/revenue-chart.jsx
 * @description Graphique en barres CA + commandes par mois (données fusionnées sur le même axe X).
 */

import { useTranslation } from "react-i18next"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice } from "@/lib/utils"

const MONTH_LABELS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
]

/** @param {{ year: number, month: number }} m */
function formatMonthLabel({ year, month }) {
  return `${MONTH_LABELS[month - 1]} ${String(year).slice(-2)}`
}

/**
 * Fusionne les séries CA et commandes sur le même axe temporel.
 * @param {object[]} revenueByMonth
 * @param {object[]} ordersByMonth
 */
export function mergeMonthlySeries(revenueByMonth = [], ordersByMonth = []) {
  const key = (m) => `${m.year}-${m.month}`
  const ordersMap = new Map(ordersByMonth.map((m) => [key(m), m.count]))
  return revenueByMonth.map((m) => ({
    label: formatMonthLabel(m),
    revenue: m.revenue,
    orders: ordersMap.get(key(m)) ?? 0,
  }))
}

function CustomTooltip({ active, payload, label }) {
  const { t } = useTranslation("admin-dashboard")
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs shadow-md space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-muted-foreground">
          {entry.dataKey === "revenue"
            ? t("chart.revenue")
            : t("chart.orders")}
          {" : "}
          <span className="font-semibold text-foreground">
            {entry.dataKey === "revenue" ? formatPrice(entry.value) : entry.value}
          </span>
        </p>
      ))}
    </div>
  )
}

export function RevenueOrdersChart({ revenueByMonth, ordersByMonth, loading }) {
  const { t } = useTranslation("admin-dashboard")
  const series = mergeMonthlySeries(revenueByMonth, ordersByMonth)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{t("chart.revenueOrders")}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : series.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tick={{ fill: "var(--muted-foreground)" }}
                />
                <YAxis yAxisId="revenue" hide />
                <YAxis yAxisId="orders" orientation="right" hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  yAxisId="revenue"
                  dataKey="revenue"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                  name="revenue"
                />
                <Bar
                  yAxisId="orders"
                  dataKey="orders"
                  fill="var(--muted-foreground)"
                  radius={[4, 4, 0, 0]}
                  name="orders"
                  opacity={0.4}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}