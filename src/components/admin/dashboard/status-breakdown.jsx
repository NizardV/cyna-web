/**
 * @file components/admin/dashboard/status-breakdown.jsx
 * @description Affiche la répartition par statut (commandes/abonnements) sous forme de badges.
 * Les clés de `byStatus` sont en minuscules, alignées sur les enums .NET
 * (OrderStatus, SubscriptionStatus) sérialisés via ToString().ToLowerInvariant().
 */

import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"

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

export function StatusBreakdown({ byStatus }) {
  const { t } = useTranslation("admin-dashboard")

  const entries = Object.entries(byStatus ?? {}).filter(([, count]) => count > 0)

  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground">{t("status.empty")}</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([status, count]) => (
        <Badge key={status} variant={STATUS_BADGE_VARIANT[status] ?? "outline"} className="gap-1.5">
          {t(`status.${status}`, { defaultValue: status })}
          <span className="font-mono tabular-nums">{count}</span>
        </Badge>
      ))}
    </div>
  )
}