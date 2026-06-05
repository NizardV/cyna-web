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

/** Ajoute un article au panier. Si le plan existe déjà, remplace les quantités et les prix. */
export const addToCart = (item) => {
  const cart = readCart()
  const existing = cart.find(i => i.pricingPlanId === item.pricingPlanId)
  if (existing) {
    existing.quantityUsers    = item.quantityUsers    ?? existing.quantityUsers
    existing.quantityDevices  = item.quantityDevices  ?? existing.quantityDevices
    existing.unitPriceUsers   = item.unitPriceUsers   ?? existing.unitPriceUsers
    existing.unitPriceDevices = item.unitPriceDevices ?? existing.unitPriceDevices
  } else {
    cart.push({
      id:               crypto.randomUUID(),
      pricingPlanId:    item.pricingPlanId,
      productName:      item.productName,
      billingPeriod:    item.billingPeriod,
      quantityUsers:    item.quantityUsers      ?? 0,
      quantityDevices:  item.quantityDevices    ?? 0,
      unitPriceUsers:   item.unitPriceUsers     ?? 0,
      unitPriceDevices: item.unitPriceDevices   ?? 0,
      pricingTiers:     item.pricingTiers       ?? [],  // nécessaire pour recalculer les tiers dans le panier
      maxUsersCheckout:   item.maxUsersCheckout   ?? Infinity,
      maxDevicesCheckout: item.maxDevicesCheckout ?? Infinity,
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
