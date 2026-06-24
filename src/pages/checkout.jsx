import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn, formatPrice } from "@/lib/utils"
import { getCart, clearCart } from "@/api/cart"
import { lineTotal } from "@/components/cart/cart-row"
import { isOverTier, UnitType } from "@/lib/pricing-utils"
import { useAuth } from "@/hooks/use-auth"
import { apiClient, ApiError } from "@/api/client"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// StepBlock
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
// StripePaymentForm — rendu à l'intérieur de <Elements> (a accès aux hooks Stripe)
// ---------------------------------------------------------------------------

function StripePaymentForm({ total, onSuccess }) {
  const { t } = useTranslation("checkout")
  const stripe = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)

  const handlePay = async () => {
    if (!stripe || !elements) return
    setPaying(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      },
    })

    if (error) {
      toast.error(error.message ?? t("errors.paymentFailed", { defaultValue: "Le paiement a échoué." }))
      setPaying(false)
      return
    }

    if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
      onSuccess()
      return
    }

    // Statut inattendu (ex. requires_action sans redirection)
    toast.error(t("errors.paymentFailed", { defaultValue: "Le paiement a échoué." }))
    setPaying(false)
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      <Button className="w-full font-bold" onClick={handlePay} disabled={!stripe || paying}>
        {paying
          ? t("summary.confirming", { defaultValue: "Paiement en cours…" })
          : t("payNow", { defaultValue: "Payer {{amount}}", amount: formatPrice(total) })}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {t("step3.secured", { defaultValue: "Paiement sécurisé par Stripe." })}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CheckoutSummary
// ---------------------------------------------------------------------------

function CheckoutSummary({ items, subtotal, tva, total, onProceed, initializing, paymentStarted, hasQuoteItem }) {
  const { t } = useTranslation("checkout")

  return (
    <div className="w-full md:w-80 md:shrink-0">
      <Card className="sticky top-4">
        <CardContent className="space-y-4 p-4">
          <h2 className="text-sm font-bold text-foreground">
            {t("summary.title")}
          </h2>

          <div className="space-y-2">
            {items.map((item) => {
              const itemTotal = item.lineTotal ?? lineTotal(item)
              return (
                <div key={item.id} className="flex justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{item.productName}</p>
                    <p className="text-muted-foreground">
                      {t(`summary.duration.${item.billingPeriod}`, { defaultValue: item.billingPeriod })}
                      {item.quantityUsers > 0 && ` • ${t("summary.users", { count: item.quantityUsers })}`}
                      {item.quantityDevices > 0 && ` • ${t("summary.devices", { count: item.quantityDevices })}`}
                    </p>
                  </div>
                  <span className="shrink-0 font-medium tabular-nums">{formatPrice(itemTotal)}</span>
                </div>
              )
            })}
          </div>

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

          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-bold">{t("summary.total")}</span>
            <span className="text-xl font-extrabold text-primary tabular-nums">
              {formatPrice(total)}
            </span>
          </div>

          {hasQuoteItem && (
            <p className="rounded-md border border-orange-200 bg-orange-50 p-2.5 text-xs text-orange-600">
              {t("summary.quoteWarning", { defaultValue: "Un article dépasse les tranches en ligne et nécessite un devis." })}{" "}
              <Link to="/contact" className="font-medium underline">
                {t("summary.quoteContact", { defaultValue: "Contactez-nous" })}
              </Link>
            </p>
          )}

          {paymentStarted ? (
            <p className="text-center text-xs text-muted-foreground">
              {t("summary.completePayment", { defaultValue: "Complétez le paiement à l'étape 3." })}
            </p>
          ) : (
            <Button
              className="w-full font-bold"
              onClick={onProceed}
              disabled={initializing || hasQuoteItem}
            >
              {initializing
                ? t("summary.confirming", { defaultValue: "Chargement…" })
                : t("summary.proceed", { defaultValue: "Procéder au paiement" })}
            </Button>
          )}

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

/**
 * Page de paiement en 3 étapes : compte client, adresse de facturation, paiement par carte (Stripe Elements).
 * 1. On enrichit les articles du panier avec les prix confirmés par le backend.
 * 2. Au clic « Procéder au paiement », le backend crée la commande (Pending) + l'abonnement Stripe
 *    et renvoie un client secret.
 * 3. Stripe Elements confirme le paiement ; le webhook backend confirmera la commande.
 */
export function Checkout() {
  const { t } = useTranslation("checkout")
  const navigate = useNavigate()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [backendSummary, setBackendSummary] = useState(null)
  const [initializing, setInitializing] = useState(false)
  // { clientSecret, publishableKey, orderId } une fois le paiement initialisé côté backend
  const [payment, setPayment] = useState(null)
  const initialized = useRef(false)

  const [address, setAddress] = useState(
    import.meta.env.DEV
      ? { firstName: "Jean", lastName: "Dupont", line1: "12 rue de la Paix", postalCode: "75001", city: "Paris", country: "FR" }
      : { firstName: "", lastName: "", line1: "", postalCode: "", city: "", country: "FR" }
  )

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const init = async () => {
      const cartItems = await getCart()
      setItems(cartItems)

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
          // Backend indisponible / non connecté → prix à 0
        }
      }
    }
    init()
  }, [])

  // Repli local à partir des prix snapshot du panier : évite d'afficher 0 €
  // si le backend ne renvoie pas de récapitulatif (indisponible / non connecté).
  const localSubtotal = items.reduce((s, i) => s + lineTotal(i), 0)
  const subtotal = backendSummary?.subtotal  ?? localSubtotal
  const tva      = backendSummary?.taxAmount ?? subtotal * 0.2
  const total    = backendSummary?.total     ?? subtotal + subtotal * 0.2

  // Garde-fou : un article hors-tranche nécessite un devis → paiement en ligne impossible.
  const hasQuoteItem = items.some(i =>
    isOverTier(i.pricingTiers, UnitType.USER,   i.quantityUsers) ||
    isOverTier(i.pricingTiers, UnitType.DEVICE, i.quantityDevices)
  )

  // Promesse Stripe créée une fois la clé publiable reçue du backend.
  const stripePromise = useMemo(
    () => (payment?.publishableKey ? loadStripe(payment.publishableKey) : null),
    [payment?.publishableKey]
  )

  const handleProceed = async () => {
    if (hasQuoteItem) {
      toast.error(t("errors.quoteRequired", { defaultValue: "Un article nécessite un devis. Contactez-nous pour finaliser votre commande." }))
      return
    }
    if (!address.firstName || !address.lastName || !address.line1 || !address.postalCode || !address.city) {
      toast.error(t("errors.missingAddress"))
      return
    }

    setInitializing(true)
    try {
      const res = await apiClient.post("/payments/subscription", { address })
      if (!res?.clientSecret || !res?.publishableKey) {
        throw new Error("Réponse de paiement invalide")
      }
      setPayment({
        clientSecret:   res.clientSecret,
        publishableKey: res.publishableKey,
        orderId:        res.orderId,
      })
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        toast.error(t("errors.notLoggedIn", { defaultValue: "Connectez-vous pour finaliser votre commande." }))
      } else {
        toast.error(t("errors.orderFailed"))
      }
    } finally {
      setInitializing(false)
    }
  }

  const handleSuccess = async () => {
    await clearCart()
    toast.success(t("toast.success"))
    navigate("/order-confirmation", { state: { total } })
  }

  return (
    <div className="min-h-screen bg-background">
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
          <div className="flex-1 space-y-4">
            {/* Étape 1 — Compte client */}
            <StepBlock number={1} title={t("step1.title")} done={!!user}>
              {user ? (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {t("step1.loggedAs")}{" "}
                    <span className="font-medium text-foreground">{user.email}</span>
                  </p>
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
            <StepBlock number={2} title={t("step2.title")} active={!payment} done={!!payment}>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t("step2.firstName")}</Label>
                  <Input value={address.firstName} disabled={!!payment} onChange={(e) => setAddress((p) => ({ ...p, firstName: e.target.value }))} placeholder="Jean" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("step2.lastName")}</Label>
                  <Input value={address.lastName} disabled={!!payment} onChange={(e) => setAddress((p) => ({ ...p, lastName: e.target.value }))} placeholder="Dupont" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">{t("step2.address")}</Label>
                  <Input value={address.line1} disabled={!!payment} onChange={(e) => setAddress((p) => ({ ...p, line1: e.target.value }))} placeholder={t("step2.addressPlaceholder")} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("step2.postalCode")}</Label>
                  <Input value={address.postalCode} disabled={!!payment} onChange={(e) => setAddress((p) => ({ ...p, postalCode: e.target.value }))} placeholder="75001" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("step2.city")}</Label>
                  <Input value={address.city} disabled={!!payment} onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))} placeholder="Paris" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">{t("step2.country")}</Label>
                  <Input value={address.country} disabled={!!payment} onChange={(e) => setAddress((p) => ({ ...p, country: e.target.value.toUpperCase().slice(0, 2) }))} placeholder="FR" />
                </div>
              </div>
            </StepBlock>

            {/* Étape 3 — Paiement (Stripe Elements) */}
            <StepBlock number={3} title={t("step3.title")} active={!!payment}>
              {!payment ? (
                <p className="text-xs text-muted-foreground">
                  {t("step3.hint", { defaultValue: "Renseignez votre adresse puis cliquez sur « Procéder au paiement »." })}
                </p>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret: payment.clientSecret, locale: "fr" }}>
                  <StripePaymentForm total={total} onSuccess={handleSuccess} />
                </Elements>
              )}
            </StepBlock>
          </div>

          <CheckoutSummary
            items={items}
            subtotal={subtotal}
            tva={tva}
            total={total}
            onProceed={handleProceed}
            initializing={initializing}
            paymentStarted={!!payment}
            hasQuoteItem={hasQuoteItem}
          />
        </div>
      </div>

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
