import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { findTier, isOverTier, UnitType } from "@/lib/pricing-utils"
import { getCart, updateCartItem, removeFromCart } from "@/api/cart"
import { toast } from "sonner"
import { CartRow, lineTotal } from "@/components/cart/cart-row"
import { CartSummary } from "@/components/cart/cart-summary"
import { CartSkeleton } from "@/components/cart/cart-skeleton"

/**
 * Page panier : liste des articles avec contrôles de quantité, résumé et passage en caisse.
 * Les prix par palier sont recalculés localement à chaque changement de quantité.
 */
export function Cart() {
  const { t } = useTranslation("cart")
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCart().then((data) => { setItems(data); setLoading(false) })
  }, [])

  const handleUsersChange = async (id, quantity) => {
    const item    = items.find(i => i.id === id)
    const newTier = findTier(item.pricingTiers, UnitType.USER, quantity)
    const update  = { quantityUsers: quantity, unitPriceUsers: newTier?.unitPrice ?? item.unitPriceUsers }
    await updateCartItem(id, update)
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...update } : i))
  }

  const handleDevicesChange = async (id, quantity) => {
    const item    = items.find(i => i.id === id)
    const newTier = findTier(item.pricingTiers, UnitType.DEVICE, quantity)
    const update  = { quantityDevices: quantity, unitPriceDevices: newTier?.unitPrice ?? item.unitPriceDevices }
    await updateCartItem(id, update)
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...update } : i))
  }

  const handleRemove = async (id) => {
    await removeFromCart(id)
    setItems(prev => prev.filter(i => i.id !== id))
    toast.success(t("toast.removed"))
  }

  const hasQuoteItem = items.some(i =>
    isOverTier(i.pricingTiers, UnitType.USER,   i.quantityUsers) ||
    isOverTier(i.pricingTiers, UnitType.DEVICE, i.quantityDevices)
  )
  const subtotal = items.reduce((s, i) => s + lineTotal(i), 0)
  const tva      = subtotal * 0.2
  const total    = subtotal + tva

  return (
    <Layout>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
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
                  <div className="grid grid-cols-[1fr_auto] gap-6 border-b border-border bg-muted/30 px-4 py-2.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {t("header.service")}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {t("header.licenses")}
                    </span>
                  </div>
                  {items.map((item) => (
                    <CartRow
                      key={item.id}
                      item={item}
                      onUsersChange={handleUsersChange}
                      onDevicesChange={handleDevicesChange}
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
              hasQuoteItem={hasQuoteItem}
              onCheckout={() => navigate("/checkout")}
            />
          </div>
        )}
      </main>
    </Layout>
  )
}
