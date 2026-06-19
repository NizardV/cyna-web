import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn, formatPrice } from "@/lib/utils";
import { UnitType } from "@/lib/pricing-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addToCart } from "@/api/cart";
import { toast } from "sonner";

/**
 * Panneau d'achat d'un produit : sélection des quantités, prix total calculé,
 * et actions (ajouter au panier, demander un devis, essai 14 jours).
 *
 * @param {{
 *   currentPlan: object,
 *   billingPeriod: string,
 *   quantityUsers: number,
 *   quantityDevices: number,
 *   onUsersChange: (updater: (q: number) => number) => void,
 *   onDevicesChange: (updater: (q: number) => number) => void,
 *   tierUser: object|null,
 *   tierDevice: object|null,
 *   totalPrice: number,
 *   isQuoteRequired: boolean,
 *   productName: string,
 *   isAvailable: boolean
 * }} props
 */
export function ProductPricing({
  currentPlan,
  billingPeriod,
  quantityUsers,
  quantityDevices,
  onUsersChange,
  onDevicesChange,
  tierUser,
  tierDevice,
  totalPrice,
  isQuoteRequired,
  productName,
  isAvailable,
}) {
  const { t } = useTranslation("product");
  const { t: tc } = useTranslation("common");
  const navigate = useNavigate();

  const hasUserTiers   = currentPlan?.pricingTiers?.some(t => t.unitType === UnitType.USER);
  const hasDeviceTiers = currentPlan?.pricingTiers?.some(t => t.unitType === UnitType.DEVICE);
  const nothingSelected = quantityUsers === 0 && quantityDevices === 0;

  const handleAddToCart = async () => {
    await addToCart({
      pricingPlanId:      currentPlan.id,
      productName,
      billingPeriod,
      quantityUsers,
      quantityDevices,
      unitPriceUsers:     tierUser?.unitPrice     ?? 0,
      unitPriceDevices:   tierDevice?.unitPrice   ?? 0,
      pricingTiers:       currentPlan.pricingTiers ?? [],
      maxUsersCheckout:   currentPlan.maxUsersCheckout,
      maxDevicesCheckout: currentPlan.maxDevicesCheckout,
    });
    toast.success(t("addedToCart"));
    navigate("/cart");
  };

  return (
    <div className="border-t border-border pt-6 w-full">

      <div className={cn(
        "grid gap-3 mb-6",
        hasUserTiers && hasDeviceTiers ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
      )}>
        {hasUserTiers && (
          <QuantityRow
            label={t("users")}
            sublabel={tierUser ? `${formatPrice(tierUser.unitPrice)}${tc("product.perUser")}` : null}
            quantity={quantityUsers}
            onDecrement={() => onUsersChange(q => Math.max(0, q - 1))}
            onIncrement={() => onUsersChange(q => q + 1)}
            isOverLimit={quantityUsers > currentPlan.maxUsersCheckout}
            overLimitLabel={t("overLimit")}
          />
        )}
        {hasDeviceTiers && (
          <QuantityRow
            label={t("devices")}
            sublabel={tierDevice ? `${formatPrice(tierDevice.unitPrice)}${tc("product.perDevice")}` : null}
            quantity={quantityDevices}
            onDecrement={() => onDevicesChange(q => Math.max(0, q - 1))}
            onIncrement={() => onDevicesChange(q => q + 1)}
            isOverLimit={quantityDevices > currentPlan.maxDevicesCheckout}
            overLimitLabel={t("overLimit")}
          />
        )}
      </div>

      <div className="flex items-end gap-2 mb-6">
        {isQuoteRequired ? (
          <p className="text-xl font-bold text-orange-500">{t("quoteInfo")}</p>
        ) : (
          <>
            <p className="text-4xl font-extrabold text-primary">{formatPrice(totalPrice)}</p>
            <p className="text-muted-foreground mb-1">/ {t(`billingLabel.${billingPeriod}`)}</p>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {!isAvailable ? (
          <Button disabled size="lg" className="flex-1 min-h-[3.5rem] h-auto py-4 rounded-xl">
            {t("serviceUnavailableBtn")}
          </Button>
        ) : isQuoteRequired ? (
          <Button size="lg" className="flex-1 min-h-[3.5rem] h-auto py-4 rounded-xl bg-orange-500 hover:bg-orange-600" onClick={() => navigate("/contact")}>
            {t("requestQuote")}
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              className="flex-1 min-h-[3.5rem] h-auto py-4 text-base sm:text-lg rounded-xl shadow-lg shadow-primary/30"
              onClick={handleAddToCart}
              disabled={nothingSelected}
            >
              {billingPeriod === "lifetime" ? t("buyNow") : t("subscribeNow")}
            </Button>
            <Button size="lg" variant="outline" className="px-8 min-h-[3.5rem] h-auto py-4 rounded-xl" onClick={() => navigate("/contact")}>
              {t("try14Days")}
            </Button>
          </>
        )}
      </div>

    </div>
  );
}

/**
 * Ligne de sélection de quantité avec indicateur de dépassement de limite.
 *
 * @param {{
 *   label: string,
 *   sublabel: string|null,
 *   quantity: number,
 *   onDecrement: () => void,
 *   onIncrement: () => void,
 *   isOverLimit: boolean,
 *   overLimitLabel: string
 * }} props
 */
function QuantityRow({ label, sublabel, quantity, onDecrement, onIncrement, isOverLimit, overLimitLabel }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border transition-colors",
      isOverLimit ? "bg-orange-50 border-orange-200" : "bg-muted/30 border-border"
    )}>
      <div>
        <p className="text-sm font-medium">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
        {isOverLimit && (
          <Badge variant="outline" className="mt-1 text-xs border-orange-300 text-orange-500">
            {overLimitLabel}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8 rounded-full"
          onClick={onDecrement}
          disabled={quantity <= 0}
        >
          −
        </Button>
        <span className="w-8 text-center font-semibold">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="w-8 h-8 rounded-full"
          onClick={onIncrement}
        >
          +
        </Button>
      </div>
    </div>
  );
}