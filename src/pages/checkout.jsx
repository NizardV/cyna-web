import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
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
  return (
    <div className="w-full md:w-80 md:shrink-0">
      <Card className="sticky top-4">
        <CardContent className="space-y-4 p-4">
          <h2 className="text-sm font-bold text-foreground">
            Récapitulatif de la commande
          </h2>

          {/* Liste des articles */}
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {item.productName}
                  </p>
                  <p className="text-muted-foreground">
                    {item.duration === "yearly" ? "Annuel" : "Mensuel"} •{" "}
                    {item.quantity} utilisateur{item.quantity > 1 ? "s" : ""}
                  </p>
                </div>
                <span className="shrink-0 font-medium tabular-nums">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Sous-totaux */}
          <div className="space-y-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total HT</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TVA (20%)</span>
              <span className="tabular-nums">{formatPrice(tva)}</span>
            </div>
          </div>

          {/* Total TTC */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-bold">Total TTC</span>
            <span className="text-xl font-extrabold text-primary tabular-nums">
              {formatPrice(total)}
            </span>
          </div>

          <Button
            className="w-full font-bold"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? "Traitement…" : "CONFIRMER L'ACHAT"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            En confirmant votre achat, vous acceptez nos{" "}
            <Link to="/cgu" className="underline">
              Conditions Générales de Vente
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
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [user, setUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    line1: "",
    postalCode: "",
    city: "",
    country: "France",
  })

  const [payment, setPayment] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  })

  useEffect(() => {
    getCart().then(setItems)
    if (localStorage.getItem("cyna_token")) {
      getMe()
        .then(setUser)
        .catch(() => {})
    }
  }, [])

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const tva = subtotal * 0.2
  const total = subtotal + tva

  const handleConfirm = async () => {
    if (
      !address.firstName ||
      !address.lastName ||
      !address.line1 ||
      !address.postalCode ||
      !address.city
    ) {
      toast.error("Veuillez remplir tous les champs de l'adresse")
      return
    }
    if (
      !payment.cardName ||
      !payment.cardNumber ||
      !payment.expiry ||
      !payment.cvv
    ) {
      toast.error("Veuillez remplir les informations de paiement")
      return
    }

    setSubmitting(true)
    try {
      const order = await apiClient.post("/orders", { items, address, total })
      await clearCart()
      toast.success("Commande confirmée !")
      navigate("/order-confirmation", { state: { order, total } })
    } catch {
      toast.error("Une erreur est survenue lors de la commande")
      setSubmitting(false)
    }
  }

  // Formatage automatique du numéro de carte (groupes de 4)
  const handleCardNumber = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16)
    const formatted = raw.match(/.{1,4}/g)?.join(" ") ?? raw
    setPayment((p) => ({ ...p, cardNumber: formatted }))
  }

  // Formatage automatique de l'expiration (MM/AA)
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
          <Link
            to="/"
            className="text-lg font-extrabold tracking-tight text-foreground"
          >
            C CYNA
          </Link>
          <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            🔒 Paiement 100% Sécurisé
          </span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-xl font-bold text-foreground">
          Finaliser votre commande
        </h1>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* ——— Étapes ——— */}
          <div className="flex-1 space-y-4">
            {/* Étape 1 — Compte client */}
            <StepBlock number={1} title="Compte Client" done={!!user}>
              {user ? (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Connecté en tant que{" "}
                    <span className="font-medium text-foreground">
                      {user.email}
                    </span>
                  </p>
                  <button className="text-xs text-primary underline">
                    Modifier
                  </button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  <Link to="/login" className="text-primary underline">
                    Connectez-vous
                  </Link>{" "}
                  ou continuez en tant qu'invité.
                </p>
              )}
            </StepBlock>

            {/* Étape 2 — Adresse */}
            <StepBlock number={2} title="Adresse de facturation" active>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Prénom</Label>
                  <Input
                    value={address.firstName}
                    onChange={(e) =>
                      setAddress((p) => ({ ...p, firstName: e.target.value }))
                    }
                    placeholder="Jean"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nom</Label>
                  <Input
                    value={address.lastName}
                    onChange={(e) =>
                      setAddress((p) => ({ ...p, lastName: e.target.value }))
                    }
                    placeholder="Dupont"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Adresse</Label>
                  <Input
                    value={address.line1}
                    onChange={(e) =>
                      setAddress((p) => ({ ...p, line1: e.target.value }))
                    }
                    placeholder="N° et nom de rue"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Code postal</Label>
                  <Input
                    value={address.postalCode}
                    onChange={(e) =>
                      setAddress((p) => ({
                        ...p,
                        postalCode: e.target.value,
                      }))
                    }
                    placeholder="75001"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ville</Label>
                  <Input
                    value={address.city}
                    onChange={(e) =>
                      setAddress((p) => ({ ...p, city: e.target.value }))
                    }
                    placeholder="Paris"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Pays</Label>
                  <Input
                    value={address.country}
                    onChange={(e) =>
                      setAddress((p) => ({ ...p, country: e.target.value }))
                    }
                  />
                </div>
              </div>
            </StepBlock>

            {/* Étape 3 — Paiement */}
            <StepBlock number={3} title="Moyen de paiement" active>
              {/* Sélection Carte Bancaire */}
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary bg-primary/5 px-3 py-2.5">
                <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-primary">
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
                <span className="text-sm font-medium">Carte Bancaire</span>
                <div className="ml-auto flex gap-1">
                  <Badge variant="outline" className="px-1.5 py-0 text-xs">
                    VISA
                  </Badge>
                  <Badge variant="outline" className="px-1.5 py-0 text-xs">
                    MC
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nom sur la carte</Label>
                  <Input
                    value={payment.cardName}
                    onChange={(e) =>
                      setPayment((p) => ({
                        ...p,
                        cardName: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="JEAN DUPONT"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Numéro de carte</Label>
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
                    <Label className="text-xs">Expiration (MM/AA)</Label>
                    <Input
                      value={payment.expiry}
                      onChange={handleExpiry}
                      placeholder="MM/AA"
                      maxLength={5}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">CVV</Label>
                    <Input
                      value={payment.cvv}
                      onChange={(e) =>
                        setPayment((p) => ({
                          ...p,
                          cvv: e.target.value.replace(/\D/g, "").slice(0, 3),
                        }))
                      }
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
          <Link to="/mentions-legales" className="hover:underline">
            Mentions Légales
          </Link>
          <Link to="/cgu" className="hover:underline">
            CGU
          </Link>
          <Link to="/contact" className="hover:underline">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  )
}
