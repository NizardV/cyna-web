/**
 * @file mocks/handlers/cart.js
 * @description Seed du panier localStorage avec des articles de démo.
 * Exécuté uniquement si le panier est vide (ne remplace pas les articles existants).
 */

const CART_KEY = "cyna_cart"

export function seedCart() {
  if (import.meta.env.VITE_MOCK_API !== "true") return
  if (localStorage.getItem(CART_KEY)) return

  localStorage.setItem(
    CART_KEY,
    JSON.stringify([
      {
        id: crypto.randomUUID(),
        productId: "mock-product-1",
        productName: "Cyna EDR Advanced",
        quantity: 50,
        duration: "monthly",
        unitPrice: 12,
      },
      {
        id: crypto.randomUUID(),
        productId: "mock-product-2",
        productName: "Cyna XDR Entreprise",
        quantity: 10,
        duration: "monthly",
        unitPrice: 45,
      },
    ])
  )
}
