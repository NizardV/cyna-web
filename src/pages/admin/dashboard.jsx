/**
 * @file pages/admin/dashboard.jsx
 * @description Dashboard admin — vue d'ensemble CA / commandes / utilisateurs / abonnements / top produits.
 *
 * Consomme les DTOs du contrôleur .NET DashboardController (voir api/dashboard.js) :
 *   RevenueStatsDto, OrderStatsDto, UserStatsDto, SubscriptionStatsDto, TopProductDto[]
 *
 * NOTE : un bouton "Données factices" permet de forcer `?mock=true` sur les 5 routes.
 * Utile tant que le module de paiement (CA réel, commandes, abonnements) est en cours
 * de finalisation par ailleurs — voir la remarque XML sur RevenueStatsDto côté backend.
 */

import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatPrice } from "@/lib/utils"
import { getDashboardData } from "@/api/dashboard.js"

// ---------------------------------------------------------------------------
// Constantes / helpers
// ---------------------------------------------------------------------------

const PERIODS = [
  { value: "week", label: "7 derniers jours" },
  { value: "month", label: "30 derniers jours" },
  { value: "year", label: "12 derniers mois" },
  { value: "all", label: "Depuis le début" },
]

const MONTH_LABELS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
]

/** Formate un point { year, month } en libellé court "Jan 26". */
function formatMonthLabel({ year, month }) {
  return `${MONTH_LABELS[month - 1]} ${String(year).slice(-2)}`
}

/** Merge plusieurs séries mensuelles (CA + commandes) sur le même axe X pour le graphique combiné. */
function mergeMonthlySeries(revenueByMonth = [], ordersByMonth = []) {
  const key = (m) => `${m.year}-${m.month}`
  const ordersMap = new Map(ordersByMonth.map((m) => [key(m), m.count]))

  return revenueByMonth.map((m) => ({
    label: formatMonthLabel(m),
    revenue: m.revenue,
    orders: ordersMap.get(key(m)) ?? 0,
  }))
}

const STATUS_BADGE_VARIANT = {
  paid: "default",
  active: "default",
  pending: "secondary",
  failed: "destructive",
  refunded: "outline",
  cancelled: "outline",
  expired: "outline",
  suspended: "secondary",
}

const STATUS_LABELS_FR = {
  paid: "Payées",
  pending: "En attente",
  failed: "Échouées",
  refunded: "Remboursées",
  cancelled: "Annulées",
  active: "Actifs",
  expired: "Expirés",
  suspended: "Suspendus",
}

// ---------------------------------------------------------------------------
// Petits composants de présentation
// ---------------------------------------------------------------------------

function KpiCard({ label, value, sublabel, trend }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-extrabold text-foreground tabular-nums">{value}</p>
        {(sublabel || trend != null) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            {trend != null && (
              <span className={cn(
                "font-semibold tabular-nums",
                trend >= 0 ? "text-green-600" : "text-red-500"
              )}>
                {trend >= 0 ? "+" : ""}{trend}%
              </span>
            )}
            {sublabel && <span className="text-muted-foreground">{sublabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function KpiCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}

function StatusBreakdown({ byStatus }) {
  const entries = Object.entries(byStatus ?? {}).filter(([, count]) => count > 0)
  if (entries.length === 0) return <p className="text-xs text-muted-foreground">Aucune donnée.</p>

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([status, count]) => (
        <Badge key={status} variant={STATUS_BADGE_VARIANT[status] ?? "outline"} className="gap-1.5">
          {STATUS_LABELS_FR[status] ?? status}
          <span className="font-mono tabular-nums">{count}</span>
        </Badge>
      ))}
    </div>
  )
}

function TopProductRow({ product, rank }) {
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
        <p className="text-xs text-muted-foreground">{product.ordersCount} commande(s)</p>
      </div>
      <p className="shrink-0 text-sm font-bold text-foreground tabular-nums">
        {formatPrice(product.revenue)}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function AdminDashboard() {
  const { t } = useTranslation("admin-dashboard", { useSuspense: false })

  const [period, setPeriod] = useState("month")
  const [useMock, setUseMock] = useState(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getDashboardData({ period, mock: useMock ? "true" : "false" })
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Erreur lors du chargement du dashboard.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [period, useMock])

  const chartSeries = useMemo(
    () => mergeMonthlySeries(data?.revenue?.byMonth, data?.orders?.byMonth),
    [data]
  )

  const userSeries = useMemo(
    () => (data?.users?.byMonth ?? []).map((m) => ({
      label: formatMonthLabel(m),
      count: m.count,
    })),
    [data]
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble de l'activité de la plateforme.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sélecteur de période — boutons simples, pas de dépendance combobox supplémentaire */}
          <div className="flex items-center gap-1 rounded-md border border-input p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPeriod(p.value)}
                className={cn(
                  "rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
                  period === p.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant={useMock ? "default" : "outline"}
            size="sm"
            onClick={() => setUseMock((v) => !v)}
            title="Génère des données factices (utile tant que le module de paiement n'est pas finalisé)"
          >
            {useMock ? "Données factices ✓" : "Données factices"}
          </Button>
        </div>
      </div>

      {useMock && (
        <p className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
          Mode démo activé : les chiffres affichés sont générés aléatoirement (mock=true),
          le module de paiement n'étant pas encore totalement intégré.
        </p>
      )}

      {error && (
        <p className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              label="Chiffre d'affaires"
              value={formatPrice(data?.revenue?.total ?? 0)}
              sublabel="vs période précédente"
              trend={data?.revenue?.growthPercent}
            />
            <KpiCard
              label="Commandes"
              value={data?.orders?.total ?? 0}
              sublabel="sur la période"
            />
            <KpiCard
              label="Utilisateurs"
              value={data?.users?.total ?? 0}
              sublabel={`+${data?.users?.newInPeriod ?? 0} sur la période`}
            />
            <KpiCard
              label="Abonnements actifs"
              value={data?.subscriptions?.active ?? 0}
              sublabel={`${data?.subscriptions?.total ?? 0} créés sur la période`}
            />
          </>
        )}
      </div>

      {/* Graphique CA + commandes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Chiffre d'affaires &amp; commandes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : chartSeries.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Aucune donnée sur cette période.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis yAxisId="revenue" hide />
                  <YAxis yAxisId="orders" orientation="right" hide />
                  <Tooltip
                    formatter={(value, name) =>
                      name === "revenue" ? [formatPrice(value), "CA"] : [value, "Commandes"]
                    }
                    labelClassName="text-xs"
                  />
                  <Bar yAxisId="revenue" dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} name="revenue" />
                  <Bar yAxisId="orders" dataKey="orders" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} name="orders" opacity={0.4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Nouvelles inscriptions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Nouvelles inscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : userSeries.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Aucune donnée sur cette période.</p>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis hide />
                    <Tooltip formatter={(value) => [value, "Nouveaux utilisateurs"]} />
                    <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Répartitions par statut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Répartition des statuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </>
            ) : (
              <>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">Commandes</p>
                  <StatusBreakdown byStatus={data?.orders?.byStatus} />
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">Abonnements</p>
                  <StatusBreakdown byStatus={data?.subscriptions?.byStatus} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top produits */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Top produits par chiffre d'affaires</CardTitle>
        </CardHeader>
        <CardContent className="p-0 px-4">
          {loading ? (
            <div className="space-y-3 py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-14 rounded-md" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : (data?.topProducts ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucun produit sur cette période.</p>
          ) : (
            <div>
              {data.topProducts.map((product, i) => (
                <TopProductRow key={product.productId} product={product} rank={i + 1} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminDashboard