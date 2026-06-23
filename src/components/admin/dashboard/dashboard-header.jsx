/**
 * @file components/admin/dashboard/dashboard-header.jsx
 * @description En-tête du dashboard : titre, sélecteur de période, bouton mock.
 */

import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PERIODS = ["week", "month", "year", "all"]

export function DashboardHeader({ period, onPeriodChange, useMock, onMockToggle }) {
  const { t } = useTranslation("admin-dashboard")

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="flex items-center gap-2">
        {/* Sélecteur de période */}
        <div className="flex items-center gap-1 rounded-md border border-input p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange(p)}
              className={cn(
                "rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t(`period.${p}`)}
            </button>
          ))}
        </div>

        {/* Toggle données factices */}
        <Button
          type="button"
          variant={useMock ? "default" : "outline"}
          size="sm"
          onClick={onMockToggle}
          title={t("mock.tooltip")}
        >
          {useMock ? t("mock.on") : t("mock.off")}
        </Button>
      </div>
    </div>
  )
}