/**
 * @file mocks/handlers/cart.js
 * @description Seed du panier localStorage avec des articles de démo.
 * Données issues de la BDD réelle (CynaApi.db).
 * Exécuté en DEV uniquement si le panier est vide.
 */

const CART_KEY = "cyna_cart"

export function seedCart() {
  if (import.meta.env.VITE_MOCK_API !== "true") return


  // Remplace si le panier est vide ou s'il contient encore l'ancien format mock
  const existing = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]")
  const isOldFormat = existing.length > 0 && existing[0].productId !== undefined
  if (existing.length > 0 && !isOldFormat) return

  localStorage.setItem(
    CART_KEY,
    JSON.stringify([
      {
        // Cyna SOC Manager — Plan mensuel (PricingPlan.Id = 1)
        id: crypto.randomUUID(),
        pricingPlanId: 1,
        productName: "Cyna SOC Manager",
        billingPeriod: "monthly",
        quantityUsers: 3,
        quantityDevices: 5,
        unitPriceUsers: 15.94,
        unitPriceDevices: 5.49,
        maxUsersCheckout: 999,
        maxDevicesCheckout: 999,
        pricingTiers: [
          { unitType: "user",   minQty: 1,  maxQty: 10,  unitPrice: 15.94 },
          { unitType: "user",   minQty: 11, maxQty: 50,  unitPrice: 6.90  },
          { unitType: "device", minQty: 1,  maxQty: 25,  unitPrice: 5.49  },
          { unitType: "device", minQty: 26, maxQty: 100, unitPrice: 5.18  },
        ],
      },
      {
        // Shield XDR Suite — Plan mensuel (PricingPlan.Id = 3)
        id: crypto.randomUUID(),
        pricingPlanId: 3,
        productName: "Shield XDR Suite",
        billingPeriod: "monthly",
        quantityUsers: 2,
        quantityDevices: 10,
        unitPriceUsers: 5.39,
        unitPriceDevices: 4.61,
        maxUsersCheckout: 999,
        maxDevicesCheckout: 999,
        pricingTiers: [
          { unitType: "user",   minQty: 1,  maxQty: 10,  unitPrice: 5.39  },
          { unitType: "user",   minQty: 11, maxQty: 50,  unitPrice: 9.52  },
          { unitType: "device", minQty: 1,  maxQty: 25,  unitPrice: 4.61  },
          { unitType: "device", minQty: 26, maxQty: 100, unitPrice: 2.87  },
        ],
      },
    ])
  )
}
