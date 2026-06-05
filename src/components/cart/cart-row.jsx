import { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/lib/utils";
import { findTier, UnitType } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function lineTotal(item) {
  return (item.unitPriceUsers * item.quantityUsers) + (item.unitPriceDevices * item.quantityDevices);
}

export function CartRow({ item, onUsersChange, onDevicesChange, onRemove }) {
  const { t } = useTranslation("cart");
  const [updating, setUpdating] = useState(false);

  const isOverLimitUsers   = item.quantityUsers   > item.maxUsersCheckout;
  const isOverLimitDevices = item.quantityDevices > item.maxDevicesCheckout;
  const isQuoteRequired    = isOverLimitUsers || isOverLimitDevices;
  const total              = lineTotal(item);

  const handleChange = async (field, delta) => {
    const isUsers = field === "users";
    const current = isUsers ? item.quantityUsers : item.quantityDevices;
    const next    = Math.max(0, current + delta);
    setUpdating(true);
    if (isUsers) await onUsersChange(item.id, next);
    else         await onDevicesChange(item.id, next);
    setUpdating(false);
  };

  return (
    <div className="grid grid-cols-[1fr_auto] items-start gap-6 border-b border-border px-4 py-4 last:border-0">

      <div>
        <p className="text-sm font-bold text-foreground">{item.productName}</p>
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs font-normal">
            {t(`item.billing.${item.billingPeriod}`, { defaultValue: item.billingPeriod })}
          </Badge>
          {isQuoteRequired && (
            <Badge variant="outline" className="text-xs border-orange-300 text-orange-500">
              {t("item.quoteRequired")}
            </Badge>
          )}
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="mt-2 h-7 text-xs"
          onClick={() => onRemove(item.id)}
          disabled={updating}
        >
          {t("item.remove")}
        </Button>
      </div>

      <div className="space-y-2">
        {item.pricingTiers?.some(t => t.unitType === UnitType.USER) && (
          <QuantityControl
            label={t("item.users")}
            quantity={item.quantityUsers}
            unitPrice={item.unitPriceUsers || findTier(item.pricingTiers, UnitType.USER, 1)?.unitPrice || 0}
            unit="u"
            isOverLimit={isOverLimitUsers}
            onDecrement={() => handleChange("users", -1)}
            onIncrement={() => handleChange("users", 1)}
            disabled={updating}
          />
        )}
        {item.pricingTiers?.some(t => t.unitType === UnitType.DEVICE) && (
          <QuantityControl
            label={t("item.devices")}
            quantity={item.quantityDevices}
            unitPrice={item.unitPriceDevices || findTier(item.pricingTiers, UnitType.DEVICE, 1)?.unitPrice || 0}
            unit="app"
            isOverLimit={isOverLimitDevices}
            onDecrement={() => handleChange("devices", -1)}
            onIncrement={() => handleChange("devices", 1)}
            disabled={updating}
          />
        )}

        <div className="flex px-2">
          {isQuoteRequired
            ? <span className="text-xs text-orange-400 tabular-nums flex-1 text-right">Sur devis</span>
            : <span className="text-xs text-muted-foreground tabular-nums flex-1 text-right">{formatPrice(total)}</span>
          }
        </div>
      </div>

    </div>
  );
}

function QuantityControl({ label, quantity, unitPrice, unit, isOverLimit, onDecrement, onIncrement, disabled }) {
  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded ${isOverLimit ? "bg-orange-50" : ""}`}>
      <span className="text-xs text-muted-foreground w-20">{label}</span>
      <Button variant="outline" size="icon" className="h-6 w-6 text-xs"
        onClick={onDecrement} disabled={disabled || quantity <= 0}
      >−</Button>
      <span className={`w-6 text-center text-sm font-medium tabular-nums ${isOverLimit ? "text-orange-500" : ""}`}>
        {quantity}
      </span>
      <Button variant="outline" size="icon" className="h-6 w-6 text-xs"
        onClick={onIncrement} disabled={disabled}
      >+</Button>
      <span className="text-xs text-muted-foreground tabular-nums flex-1 text-right">
        {formatPrice(unitPrice)}/{unit}
      </span>
    </div>
  );
}
