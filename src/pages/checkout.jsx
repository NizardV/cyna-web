import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn, formatPrice } from "@/lib/utils"
import { getCart, clearCart } from "@/api/cart"
import { getMe } from "@/api/user"
import { apiClient } from "@/api/client"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// StepBlock — bloc numéroté (fait / actif / inactif)
// ---------------------------------------------------------------------------

function StepBlock({ number, title, done = false, active = false, children }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card",
        active && "border-primary/40",
        done && "border-green-200"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3",
          done && "border-b border-green-100 bg-green-50",
          active && !done && "border-b border-border"
        )}
      >
        {done ? (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
            ✓
          </div>
        ) : (
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {number}
          </div>
        )}
        <span
          className={cn(
            "text-sm font-bold",
            done ? "text-green-800" : "text-foreground"
          )}
        >
          {title}
        </span>
      </div>

      {children && <div className="px-4 py-4">{children}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CheckoutSummary — colonne droite (sticky)
// ---------------------------------------------------------------------------

function CheckoutSummary({ items, subtotal, tva, total, onConfirm, submitting }) {
  const { t } = useTranslation("checkout")

  return (
    <div className="w-full md:w-80 md:shrink-0">
      <Card className="sticky top-4">
        <CardContent className="space-y-4 p-4">
          <h2 className="text-sm font-bold text-foreground">
            {t("summary.title")}
          </h2>

          {/* Liste des articles */}
          <div className="space-y-2">
            {items.map((item) => {
              const lineTotal = item.lineTotal ?? 0
              return (
                <div key={item.id} className="flex justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{item.productName}</p>
                    <p className="text-muted-foreground">
                      {t(`summary.duration.${item.billingPeriod}`, { defaultValue: item.billingPeriod })}
                      {item.quantityUsers  > 0 && ` • ${item.quantityUsers} utilisateur${item.quantityUsers > 1 ? "s" : ""}`}
                      {item.quantityDevices > 0 && ` • ${item.quantityDevices} appareil${item.quantityDevices > 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <span className="shrink-0 font-medium tabular-nums">{formatPrice(lineTotal)}</span>
                </div>
              )
            })}
          </div>

          {/* Sous-totaux */}
          <div className="space-y-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("summary.subtotal")}</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("summary.vat")}</span>
              <span className="tabular-nums">{formatPrice(tva)}</span>
            </div>
          </div>

          {/* Total TTC */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-bold">{t("summary.total")}</span>
            <span className="text-xl font-extrabold text-primary tabular-nums">
              {formatPrice(total)}
            </span>
          </div>

          <Button
            className="w-full font-bold"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? t("summary.confirming") : t("summary.confirm")}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {t("summary.cgvBefore")}{" "}
            <Link to="/cgu" className="underline">
              {t("summary.cgvLink")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

export function Checkout() {
  const { t } = useTranslation("checkout")
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [user, setUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [backendSummary, setBackendSummary] = useState(null)
  const initialized = useRef(false)

  const [address, setAddress] = useState(
    import.meta.env.DEV
      ? { firstName: "Jean", lastName: "Dupont", line1: "12 rue de la Paix", postalCode: "75001", city: "Paris", country: "France" }
      : { firstName: "", lastName: "", line1: "", postalCode: "", city: "", country: "France" }
  )

  const [payment, setPayment] = useState(
    import.meta.env.DEV
      ? { cardName: "JEAN DUPONT", cardNumber: "4242 4242 4242 4242", expiry: "12/28", cvv: "123" }
      : { cardName: "", cardNumber: "", expiry: "", cvv: "" }
  )

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const init = async () => {
      const cartItems = await getCart()
      setItems(cartItems)

      if (localStorage.getItem("cyna_token")) {
        getMe().then(setUser).catch(() => {})
      }

      if (cartItems.length > 0) {
        try {
          const enriched = []
          let lastCartSummary = null
          for (const item of cartItems) {
            const result = await apiClient.post("/cart", {
              pricingPlanId:   item.pricingPlanId,
              quantityUsers:   item.quantityUsers,
              quantityDevices: item.quantityDevices,
            })
            enriched.push({
              ...item,
              lineTotal:        result.item?.lineTotal,
              unitPriceUsers:   result.item?.unitPriceUsers   ?? item.unitPriceUsers,
              unitPriceDevices: result.item?.unitPriceDevices ?? item.unitPriceDevices,
            })
            if (result?.cartSummary) lastCartSummary = result.cartSummary
          }
          if (enriched.length > 0) setItems(enriched)
          if (lastCartSummary)     setBackendSummary(lastCartSummary)
        } catch {
          // Backend indisponible → prix à 0
        }
      }
    }
    init()
  }, [])

  const subtotal = backendSummary?.subtotal  ?? 0
  const tva      = backendSummary?.taxAmount ?? 0
  const total    = backendSummary?.total     ?? 0

  const handleConfirm = async () => {
    if (!address.firstName || !address.lastName || !address.line1 || !address.postalCode || !address.city) {
      toast.error(t("errors.missingAddress"))
      return
    }
    if (!payment.cardName || !payment.cardNumber || !payment.expiry || !payment.cvv) {
      toast.error(t("errors.missingPayment"))
      return
    }

    setSubmitting(true)
    try {
      const order = await apiClient.post("/orders", {
        items: items.map(i => ({
          pricingPlanId:    i.pricingPlanId,
          productName:      i.productName,
          billingPeriod:    i.billingPeriod,
          quantityUsers:    i.quantityUsers,
          quantityDevices:  i.quantityDevices,
        })),
        address,
        total,
        stripePaymentIntentId: `pi_mock_${crypto.randomUUID()}`,
      })
      await clearCart()
      toast.success(t("toast.success"))
      navigate("/order-confirmation", { state: { order, total } })
    } catch {
      toast.error(t("errors.orderFailed"))
      setSubmitting(false)
    }
  }

  const handleCardNumber = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16)
    const formatted = raw.match(/.{1,4}/g)?.join(" ") ?? raw
    setPayment((p) => ({ ...p, cardNumber: formatted }))
  }

  const handleExpiry = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4)
    const formatted = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw
    setPayment((p) => ({ ...p, expiry: formatted }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header minimal sécurisé */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-extrabold tracking-tight text-foreground">
            C CYNA
          </Link>
          <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            🔒 {t("badge")}
          </span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-xl font-bold text-foreground">{t("title")}</h1>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* ——— Étapes ——— */}
          <div className="flex-1 space-y-4">
            {/* Étape 1 — Compte client */}
            <StepBlock number={1} title={t("step1.title")} done={!!user}>
              {user ? (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {t("step1.loggedAs")}{" "}
                    <span className="font-medium text-foreground">{user.email}</span>
                  </p>
                  <button className="text-xs text-primary underline">
                    {t("step1.edit")}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  <Link to="/login" className="text-primary underline">
                    {t("step1.loginHintLink")}
                  </Link>{" "}
                  {t("step1.loginHintAfter")}
                </p>
              )}
            </StepBlock>

            {/* Étape 2 — Adresse */}
            <StepBlock number={2} title={t("step2.title")} active>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t("step2.firstName")}</Label>
                  <Input
                    value={address.firstName}
                    onChange={(e) => setAddress((p) => ({ ...p, firstName: e.target.value }))}
                    placeholder="Jean"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("step2.lastName")}</Label>
                  <Input
                    value={address.lastName}
                    onChange={(e) => setAddress((p) => ({ ...p, lastName: e.target.value }))}
                    placeholder="Dupont"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">{t("step2.address")}</Label>
                  <Input
                    value={address.line1}
                    onChange={(e) => setAddress((p) => ({ ...p, line1: e.target.value }))}
                    placeholder={t("step2.addressPlaceholder")}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("step2.postalCode")}</Label>
                  <Input
                    value={address.postalCode}
                    onChange={(e) => setAddress((p) => ({ ...p, postalCode: e.target.value }))}
                    placeholder="75001"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("step2.city")}</Label>
                  <Input
                    value={address.city}
                    onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                    placeholder="Paris"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">{t("step2.country")}</Label>
                  <Input
                    value={address.country}
                    onChange={(e) => setAddress((p) => ({ ...p, country: e.target.value }))}
                  />
                </div>
              </div>
            </StepBlock>

            {/* Étape 3 — Paiement */}
            <StepBlock number={3} title={t("step3.title")} active>
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary bg-primary/5 px-3 py-2.5">
                <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-primary">
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
                <span className="text-sm font-medium">{t("step3.cardType")}</span>
                <div className="ml-auto flex gap-1">
                  <Badge variant="outline" className="px-1.5 py-0 text-xs">VISA</Badge>
                  <Badge variant="outline" className="px-1.5 py-0 text-xs">MC</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t("step3.cardName")}</Label>
                  <Input
                    value={payment.cardName}
                    onChange={(e) => setPayment((p) => ({ ...p, cardName: e.target.value.toUpperCase() }))}
                    placeholder="JEAN DUPONT"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("step3.cardNumber")}</Label>
                  <Input
                    value={payment.cardNumber}
                    onChange={handleCardNumber}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    inputMode="numeric"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t("step3.expiry")}</Label>
                    <Input
                      value={payment.expiry}
                      onChange={handleExpiry}
                      placeholder="MM/AA"
                      maxLength={5}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("step3.cvv")}</Label>
                    <Input
                      value={payment.cvv}
                      onChange={(e) => setPayment((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) }))}
                      placeholder="123"
                      maxLength={3}
                      type="password"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>
            </StepBlock>
          </div>

          {/* ——— Résumé ——— */}
          <CheckoutSummary
            items={items}
            subtotal={subtotal}
            tva={tva}
            total={total}
            onConfirm={handleConfirm}
            submitting={submitting}
          />
        </div>
      </div>

      {/* Footer minimal */}
      <footer className="mt-12 border-t bg-background">
        <div className="container mx-auto flex justify-center gap-6 px-4 py-4 text-xs text-muted-foreground">
          <Link to="/mentions-legales" className="hover:underline">{t("footer.legal")}</Link>
          <Link to="/cgu" className="hover:underline">{t("footer.cgu")}</Link>
          <Link to="/contact" className="hover:underline">{t("footer.contact")}</Link>
        </div>
      </footer>
    </div>
  )
}
