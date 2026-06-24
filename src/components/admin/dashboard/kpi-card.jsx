/**
 * @file components/admin/dashboard/kpi-card.jsx
 * @description Carte d'indicateur clé (CA, commandes, utilisateurs, abonnements).
 */

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function KpiCard({ label, value, sublabel, trend }) {
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

export function KpiCardSkeleton() {
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