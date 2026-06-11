/**
 * Utilitaires purs pour la tarification — sans dépendance React.
 * Importés par form-pricing.jsx (UI) et product-form.jsx (logique de soumission).
 */

// Utilisé uniquement pour le champ "name" envoyé à l'API — ne pas traduire
const PLAN_NAMES = { monthly: "Mensuel", yearly: "Annuel", lifetime: "Définitif" }

export const BillingPeriod = Object.freeze({
  MONTHLY: "monthly",
  YEARLY: "yearly",
  LIFETIME: "lifetime",
})

export const UnitType = Object.freeze({
  USER: "user",
  DEVICE: "device",
})

// Clés i18n pour les messages de validation
export const UNIT_KEYS = { userTiers: "pricing.users", deviceTiers: "pricing.devices" }

export const TABS = ["monthly", "yearly", "lifetime"]

/** Calcule le minQty d'un palier à partir du palier précédent. */
export const computeMin = (tiers, i) =>
  i === 0 ? 1 : (Number(tiers[i - 1].maxQty) || 0) + 1

// ---------------------------------------------------------------------------
// État initial / conversion API ↔ formulaire
// ---------------------------------------------------------------------------

export const defaultPricingState = () => ({
  monthly:  { enabled: false, userTiers: [], deviceTiers: [] },
  yearly:   { enabled: false, userTiers: [], deviceTiers: [] },
  lifetime: { enabled: false, userTiers: [], deviceTiers: [] },
})

// Convertit les plans API → état du formulaire (chargement en mode édition)
export function pricingPlansToState(plans = []) {
  const state = defaultPricingState()
  for (const plan of plans) {
    const period = plan.billingPeriod
    if (!state[period]) continue
    state[period] = {
      enabled:     true,
      userTiers:   plan.pricingTiers?.filter(t => t.unitType === "user")  .map(({ maxQty, unitPrice }) => ({ maxQty, unitPrice })) ?? [],
      deviceTiers: plan.pricingTiers?.filter(t => t.unitType === "device").map(({ maxQty, unitPrice }) => ({ maxQty, unitPrice })) ?? [],
    }
  }
  return state
}

// Convertit l'état du formulaire → plans API (soumission)
export function stateToPricingPlans(state) {
  return TABS
    .filter(key => state[key].enabled)
    .map(key => {
      const p          = state[key]
      const maxUsers   = Math.max(0, ...p.userTiers.map(t   => Number(t.maxQty) || 0))
      const maxDevices = Math.max(0, ...p.deviceTiers.map(t => Number(t.maxQty) || 0))
      return {
        name:               PLAN_NAMES[key],
        billingPeriod:      key,
        discountPercent:    0,
        maxUsersCheckout:   maxUsers   || 999,
        maxDevicesCheckout: maxDevices || 999,
        pricingTiers: [
          ...p.userTiers.map((t, i)   => ({ unitType: "user",   minQty: computeMin(p.userTiers, i),   maxQty: Number(t.maxQty), unitPrice: parseFloat(t.unitPrice) })),
          ...p.deviceTiers.map((t, i) => ({ unitType: "device", minQty: computeMin(p.deviceTiers, i), maxQty: Number(t.maxQty), unitPrice: parseFloat(t.unitPrice) })),
        ],
      }
    })
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function getInvalidIndices(tiers) {
  const invalid = new Set()
  for (let i = 0; i < tiers.length; i++) {
    const min = computeMin(tiers, i)
    const max = Number(tiers[i].maxQty)
    if (!max || max <= min) invalid.add(i)
  }
  return invalid
}

export function validatePricing(state, t = (k) => k) {
  const errors = []
  for (const [period, plan] of Object.entries(state)) {
    if (!plan.enabled) continue
    const planLabel = t(`pricing.${period}`)
    for (const [field, unitKey] of Object.entries(UNIT_KEYS)) {
      const unitLabel = t(unitKey)
      const tiers     = plan[field]
      for (let i = 0; i < tiers.length; i++) {
        const tier = tiers[i]
        if (!tier.maxQty || !tier.unitPrice) {
          errors.push(t("pricing.errors.incomplete", { plan: planLabel, unit: unitLabel, tier: i + 1 }))
          break
        }
        const min = computeMin(tiers, i)
        if (Number(tier.maxQty) <= min) {
          errors.push(t("pricing.errors.invalidMax", { plan: planLabel, unit: unitLabel, tier: i + 1, min }))
        }
      }
    }
  }
  return errors
}

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