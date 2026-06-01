import { useLocation, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Layout } from "@/components/ui/layout/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"

export function OrderConfirmation() {
  const { t } = useTranslation("order-confirmation")
  const { state } = useLocation()
  const total = state?.total ?? 0

  return (
    <Layout>
      <main className="flex min-h-[60vh] items-center justify-center py-16">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-5 p-8 text-center">
            {/* Icône succès */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-lg font-bold text-foreground">{t("title")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            {total > 0 && (
              <div className="rounded-lg bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">{t("amount")}</p>
                <p className="text-2xl font-extrabold text-primary tabular-nums">
                  {formatPrice(total)}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link to="/account/orders">{t("viewOrders")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">{t("backHome")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </Layout>
  )
}
