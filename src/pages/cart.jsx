import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice } from "@/lib/utils"
import { getCart, updateCartItem, removeFromCart } from "@/api/cart"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// CartRow — une ligne par service
// ---------------------------------------------------------------------------

function CartRow({ item, onQuantityChange, onRemove }) {
  const { t } = useTranslation("cart")
  const [updating, setUpdating] = useState(false)

  const handleQty = async (delta) => {
    const next = item.quantity + delta
    if (next < 1) return
    setUpdating(true)
    await onQuantityChange(item.id, next)
    setUpdating(false)
  }

  const durationLabel = t(`item.duration.${item.duration}`, {
    defaultValue: item.duration,
  })

  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-6 border-b border-border px-4 py-4 last:border-0">
      {/* Service */}
      <div>
        <p className="text-sm font-bold text-foreground">{item.productName}</p>
        <Badge variant="secondary" className="mt-1.5 text-xs font-normal">
          {durationLabel}
        </Badge>
        <button
          onClick={() => onRemove(item.id)}
          disabled={updating}
          className="mt-1.5 block text-xs text-destructive hover:underline disabled:opacity-50"
        >
          {t("item.remove")}
        </button>
      </div>

      {/* Quantité */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 text-sm"
          onClick={() => handleQty(-1)}
          disabled={updating || item.quantity <= 1}
        >
          -
        </Button>
        <span className="w-6 text-center text-sm font-medium tabular-nums">
          {item.quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 text-sm"
          onClick={() => handleQty(1)}
          disabled={updating}
        >
          +
        </Button>
      </div>

      {/* Total ligne */}
      <div className="min-w-[90px] text-right">
        <p className="text-sm font-bold text-foreground tabular-nums">
          {formatPrice(item.unitPrice * item.quantity)}
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CartSummary — colonne de droite
// ---------------------------------------------------------------------------

function CartSummary({ subtotal, tva, total, hasItems, onCheckout }) {
  const { t } = useTranslation("cart")
  const isLoggedIn = !!localStorage.getItem("cyna_token")

  return (
    <div className="w-full md:w-72 md:shrink-0">
      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-sm font-bold text-foreground">
            {t("summary.title")}
          </h2>

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
            <span className="text-xl font-extrabold text-primary tabular-nums">
              {formatPrice(total)}
            </span>
          </div>

          {!isLoggedIn && (
            <p className="rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground">
              {t("summary.loginHintBefore")}{" "}
              <Link to="/login" className="text-primary underline">
                {t("summary.loginHintLink")}
              </Link>{" "}
              {t("summary.loginHintAfter")}
            </p>
          )}

          <Button
            className="w-full font-bold"
            onClick={onCheckout}
            disabled={!hasItems}
          >
            {t("summary.checkout")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CartSkeleton
// ---------------------------------------------------------------------------

function CartSkeleton() {
  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <Card className="flex-1">
        <CardContent className="p-0">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-6 border-b border-border px-4 py-4 last:border-0"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7" />
                <Skeleton className="h-4 w-5" />
                <Skeleton className="h-7 w-7" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="w-full md:w-72">
        <Skeleton className="h-52 w-full rounded-lg" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

export function Cart() {
  const { t } = useTranslation("cart")
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCart().then((data) => {
      setItems(data)
      setLoading(false)
    })
  }, [])

  const handleQuantityChange = async (id, quantity) => {
    await updateCartItem(id, { quantity })
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)))
  }

  const handleRemove = async (id) => {
    await removeFromCart(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
    toast.success(t("toast.removed"))
  }

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const tva = subtotal * 0.2
  const total = subtotal + tva

  return (
    <Layout>
      <main className="py-8">
        <h1 className="mb-6 text-xl font-bold text-foreground">{t("title")}</h1>

        {loading && <CartSkeleton />}

        {!loading && items.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-sm font-bold text-foreground">{t("empty")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("emptyHint")}</p>
              <Button className="mt-4" onClick={() => navigate("/")}>
                {t("backHome")}
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && items.length > 0 && (
          <div className="flex flex-col gap-8 md:flex-row">
            {/* Table des services */}
            <div className="flex-1">
              <Card>
                <CardContent className="p-0">
                  {/* En-tête */}
                  <div className="grid grid-cols-[1fr_auto_auto] gap-6 border-b border-border bg-muted/30 px-4 py-2.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {t("header.service")}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {t("header.quantity")}
                    </span>
                    <span className="min-w-[90px] text-right text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {t("header.total")}
                    </span>
                  </div>

                  {items.map((item) => (
                    <CartRow
                      key={item.id}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemove}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Résumé */}
            <CartSummary
              subtotal={subtotal}
              tva={tva}
              total={total}
              hasItems={items.length > 0}
              onCheckout={() => navigate("/checkout")}
            />
          </div>
        )}
      </main>
    </Layout>
  )
}
