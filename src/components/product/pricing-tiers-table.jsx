import { useTranslation } from "react-i18next";
import { cn, formatPrice } from "@/lib/utils";
import { UnitType } from "@/lib/pricing-utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * Tableau des paliers de tarification du plan courant.
 * Met en surbrillance le palier actif selon la quantité choisie.
 *
 * @param {{
 *   tiers: object[],
 *   activeTierUser: object|null,
 *   activeTierDevice: object|null
 * }} props
 */
export function PricingTiersTable({ tiers, activeTierUser, activeTierDevice }) {
  const { t } = useTranslation("product");

  if (!tiers || tiers.length === 0) return null;

  const userTiers   = tiers.filter(t => t.unitType === UnitType.USER);
  const deviceTiers = tiers.filter(t => t.unitType === UnitType.DEVICE);

  if (userTiers.length === 0 && deviceTiers.length === 0) return null;

  const hasBoth = userTiers.length > 0 && deviceTiers.length > 0;

  return (
    <Card className="overflow-hidden w-full">
      <CardHeader className="px-4 py-2 bg-muted/40 border-b">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("tiersTitle")}
        </CardTitle>
      </CardHeader>

      <div className={cn("grid", hasBoth ? "grid-cols-2 divide-x" : "grid-cols-1")}>
        {userTiers.length > 0 && (
          <TierColumn
            label={t("users")}
            tiers={userTiers}
            activeTier={activeTierUser}
          />
        )}
        {deviceTiers.length > 0 && (
          <TierColumn
            label={t("devices")}
            tiers={deviceTiers}
            activeTier={activeTierDevice}
          />
        )}
      </div>
    </Card>
  );
}

/**
 * Colonne de paliers pour un type d'unité (users ou devices).
 * @param {{ label: string, tiers: object[], activeTier: object|null }} props
 */
function TierColumn({ label, tiers, activeTier }) {
  const { t } = useTranslation("product");
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">{label}</TableHead>
          <TableHead className="text-xs text-right">{t("tiersUnitHeader")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tiers.map((tier, i) => {
          const isActive = activeTier?.minQty === tier.minQty && activeTier?.maxQty === tier.maxQty;
          return (
            <TableRow
              key={i}
              className={cn(isActive && "bg-primary/5 font-semibold")}
            >
              <TableCell className={cn("text-xs", isActive ? "text-primary" : "text-muted-foreground")}>
                {tier.minQty}–{tier.maxQty}
              </TableCell>
              <TableCell className={cn("text-xs text-right", isActive ? "text-primary" : "text-foreground")}>
                {formatPrice(tier.unitPrice)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
