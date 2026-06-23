/**
 * @file components/admin/dashboard/statuses-card.jsx
 * @description Card avec répartition des statuts commandes et abonnements côte à côte.
 */

import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBreakdown } from "./status-breakdown"

export function StatusesCard({ ordersByStatus, subscriptionsByStatus, loading }) {
  const { t } = useTranslation("admin-dashboard")

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{t("statuses.title")}</CardTitle>
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
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                {t("statuses.orders")}
              </p>
              <StatusBreakdown byStatus={ordersByStatus} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                {t("statuses.subscriptions")}
              </p>
              <StatusBreakdown byStatus={subscriptionsByStatus} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}