import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { BillingPeriod } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function ProductInfo({ product, billingPeriod, onBillingPeriodChange }) {
  const { t } = useTranslation("product");

  if (!product) return null;

  const isAvailable = product.status === "available";

  const orderedPlans = [BillingPeriod.MONTHLY, BillingPeriod.YEARLY, BillingPeriod.LIFETIME]
    .map(period => product.pricingPlans?.find(p => p.billingPeriod === period))
    .filter(Boolean);

  return (
    <div className="w-full md:w-1/2 flex flex-col">

      <div className="mb-4">
        <Badge variant={isAvailable ? "default" : "destructive"} className={cn(isAvailable && "bg-green-600 hover:bg-green-700")}>
          {isAvailable ? t("availableImmediately") : t("serviceUnavailable")}
        </Badge>
      </div>

      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
      <p className="text-lg text-gray-600 mb-6 leading-relaxed">{product.description}</p>

      <Card className="mb-8">
        <CardContent className="pt-4">
          <h3 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wide">
            {t("technicalSpecsTitle")}
          </h3>
          <ul className="space-y-3">
            {product.technicalSpecs?.map((spec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{spec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="mt-auto flex gap-3 flex-wrap">
        {orderedPlans.map(plan => (
          <Button
            key={plan.billingPeriod}
            variant={billingPeriod === plan.billingPeriod ? "default" : "outline"}
            className="h-11 px-6 text-sm font-semibold"
            onClick={() => onBillingPeriodChange(plan.billingPeriod)}
          >
            {t(`billing.${plan.billingPeriod}`)}
          </Button>
        ))}
      </div>

    </div>
  );
}
