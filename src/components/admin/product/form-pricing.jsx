import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Plus, Trash2, AlertTriangle } from "lucide-react"
import { TABS, computeMin, getInvalidIndices } from "./pricing-utils"

const emptyTier = () => ({ maxQty: "", unitPrice: "" })

// ---------------------------------------------------------------------------
// TiersTable
// ---------------------------------------------------------------------------

function TiersTable({ label, tiers, onChange }) {
  const { t }      = useTranslation("admin")
  const invalid    = getInvalidIndices(tiers)
  const hasInvalid = invalid.size > 0

  const setTier = (i, field) => (e) => onChange(
    tiers.map((tier, idx) => idx === i ? { ...tier, [field]: e.target.value } : tier)
  )
  const addTier    = () => onChange([...tiers, emptyTier()])
  const removeTier = (i) => onChange(tiers.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>

      {tiers.length > 0 && (
        <div className={cn("rounded-md border overflow-hidden", hasInvalid && "border-destructive")}>
          <Table className="text-xs">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="px-3 py-2 text-left font-medium text-muted-foreground h-auto">{t("pricing.minQty")}</TableHead>
                <TableHead className="px-3 py-2 text-left font-medium text-muted-foreground h-auto">{t("pricing.maxQty")}</TableHead>
                <TableHead className="px-3 py-2 text-left font-medium text-muted-foreground h-auto">{t("pricing.unitPrice")}</TableHead>
                <TableHead className="w-8 h-auto" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map((tier, i) => {
                const minQty    = computeMin(tiers, i)
                const isInvalid = invalid.has(i)
                return (
                  <TableRow key={i} className={cn("bg-background", isInvalid && "bg-destructive/5")}>
                    <TableCell className="px-2 py-1.5">
                      <Input
                        readOnly value={minQty} tabIndex={-1}
                        className="h-7 text-xs bg-muted/50 text-muted-foreground cursor-default"
                      />
                    </TableCell>
                    <TableCell className="px-2 py-1.5">
                      <Input
                        type="number" min={minQty + 1}
                        value={tier.maxQty}
                        onChange={setTier(i, "maxQty")}
                        className={cn("h-7 text-xs", isInvalid && "border-destructive focus-visible:ring-destructive")}
                        placeholder={String(minQty + 9)}
                      />
                    </TableCell>
                    <TableCell className="px-2 py-1.5">
                      <Input
                        type="number" min="0" step="0.01"
                        value={tier.unitPrice}
                        onChange={setTier(i, "unitPrice")}
                        className="h-7 text-xs"
                        placeholder="9.99"
                      />
                    </TableCell>
                    <TableCell className="px-2 py-1.5">
                      <Button
                        type="button" variant="ghost" size="icon"
                        onClick={() => removeTier(i)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-transparent"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {hasInvalid && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {t("pricing.invalidTier")}
        </p>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addTier} className="gap-1.5 h-7 text-xs">
        <Plus className="h-3 w-3" />
        {t("pricing.addTier")}
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PlanPanel
// ---------------------------------------------------------------------------

function PlanPanel({ plan, onChange }) {
  const { t } = useTranslation("admin")

  return (
    <div className="space-y-5 pt-4">
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={plan.enabled}
          onChange={e => onChange({ ...plan, enabled: e.target.checked })}
          className="h-4 w-4 rounded border border-input accent-primary"
        />
        <span className="text-sm font-medium">{t("pricing.enablePlan")}</span>
      </label>

      {plan.enabled && (
        <>
          <TiersTable
            label={t("pricing.users")}
            tiers={plan.userTiers}
            onChange={userTiers => onChange({ ...plan, userTiers })}
          />
          <TiersTable
            label={t("pricing.devices")}
            tiers={plan.deviceTiers}
            onChange={deviceTiers => onChange({ ...plan, deviceTiers })}
          />
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FormPricing
// ---------------------------------------------------------------------------

export function FormPricing({ value, onChange }) {
  const { t }      = useTranslation("admin")
  const [activeTab, setActiveTab] = useState("monthly")
  const updatePlan = (key) => (plan) => onChange({ ...value, [key]: plan })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{t("pricing.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 border-b">
          {TABS.map(key => (
            <Button
              key={key}
              type="button"
              variant="ghost"
              onClick={() => setActiveTab(key)}
              className={cn(
                "h-auto rounded-none px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-transparent"
              )}
            >
              {t(`pricing.${key}`)}
              {/* Point indicateur : le plan est activé */}
              {value[key].enabled && (
                <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
              )}
            </Button>
          ))}
        </div>

        <PlanPanel
          plan={value[activeTab]}
          onChange={updatePlan(activeTab)}
        />
      </CardContent>
    </Card>
  )
}
