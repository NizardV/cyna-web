/**
 * @file api/cart.js
 * @description Gestion du panier via localStorage.
 * Persiste entre les sessions (connecté ou non).
 * Les signatures sont compatibles avec un remplacement futur par des appels API réels.
 */

const CART_KEY = "cyna_cart"

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]")
  } catch {
    return []
  }
}

const writeCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

/** Récupère tous les articles du panier. */
export const getCart = () => Promise.resolve(readCart())

/** Ajoute un article ou incrémente la quantité si déjà présent. */
export const addToCart = (item) => {
  const cart = readCart()
  const existing = cart.find(
    (i) => i.productId === item.productId && i.duration === item.duration
  )
  if (existing) {
    existing.quantity += item.quantity ?? 1
  } else {
    cart.push({
      id: crypto.randomUUID(),
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity ?? 1,
      duration: item.duration ?? "monthly",
      unitPrice: item.unitPrice ?? 0,
    })
  }
  writeCart(cart)
  return Promise.resolve(cart)
}

/** Met à jour un article du panier (quantité, durée, etc.). */
export const updateCartItem = (id, body) => {
  const cart = readCart().map((i) => (i.id === id ? { ...i, ...body } : i))
  writeCart(cart)
  return Promise.resolve(cart.find((i) => i.id === id) ?? null)
}

/** Supprime un article du panier. */
export const removeFromCart = (id) => {
  writeCart(readCart().filter((i) => i.id !== id))
  return Promise.resolve(null)
}

/** Vide entièrement le panier. */
export const clearCart = () => {
  writeCart([])
  return Promise.resolve(null)
}
