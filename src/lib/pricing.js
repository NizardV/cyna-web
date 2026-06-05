export const BillingPeriod = Object.freeze({
  MONTHLY: "monthly",
  YEARLY: "yearly",
  LIFETIME: "lifetime",
})

export const UnitType = Object.freeze({
  USER: "user",
  DEVICE: "device",
})

/**
 * Trouve la tranche de prix applicable pour un type d'unité et une quantité donnée.
 * Retourne null si aucune tranche ne correspond (hors limites → devis requis).
 *
 * @param {Array}  tiers    - pricingTiers du plan courant
 * @param {string} unitType - UnitType.USER ou UnitType.DEVICE
 * @param {number} quantity - quantité choisie par l'utilisateur
 * @returns {object|null}
 */
export function findTier(tiers, unitType, quantity) {
  if (!tiers || quantity <= 0) return null
  return tiers.find(
    t => t.unitType === unitType && quantity >= t.minQty && quantity <= t.maxQty
  ) ?? null
}
