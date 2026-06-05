import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CartSummary({ subtotal, tva, total, hasItems, hasQuoteItem, onCheckout }) {
  const { t } = useTranslation("cart");
  const isLoggedIn = !!localStorage.getItem("cyna_token");

  return (
    <div className="w-full md:w-72 md:shrink-0">
      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-sm font-bold text-foreground">{t("summary.title")}</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("summary.subtotal")}</span>
              <span className="font-medium tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("summary.vat")}</span>
              <span className="font-medium tabular-nums">{formatPrice(tva)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-bold">{t("summary.total")}</span>
            <span className="text-xl font-extrabold text-primary tabular-nums">{formatPrice(total)}</span>
          </div>

          {!isLoggedIn && (
            <p className="rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground">
              {t("summary.loginHintBefore")}{" "}
              <Link to="/login" className="text-primary underline">{t("summary.loginHintLink")}</Link>{" "}
              {t("summary.loginHintAfter")}
            </p>
          )}

          {hasQuoteItem && (
            <p className="rounded-md bg-orange-50 border border-orange-200 p-2.5 text-xs text-orange-600">
              {t("item.quoteWarning")}{" "}
              <Link to="/contact" className="underline font-medium">{t("item.quoteContact")}</Link>
            </p>
          )}

          <Button
            className="w-full font-bold h-12 sm:h-10"
            onClick={onCheckout}
            disabled={!hasItems || hasQuoteItem}
          >
            {t("summary.checkout")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
