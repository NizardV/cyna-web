/**
 * @file factories.js
 * @description Data factories using @faker-js/faker.
 *
 * Each factory matches the .NET v1 API DTOs exactly.
 * Non-API entities (Address, PaymentMethod, Order, CarouselItem, AuthResponse)
 * keep their own shape for internal mock use.
 *
 * DTO alignment:
 *   makeUser()         → UserProfileDto
 *   makeCategory()     → CategoryDto
 *   makeProduct()      → ProductDto  (catalog / search)
 *   makeOrderItem()    → OrderItemDto
 *   makeSubscription() → SubscriptionDto
 *   makeOrder()        → OrderSummaryDto
 */

import { faker } from "@faker-js/faker"

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Generate `n` items using a factory function.
 * @template T
 * @param {number} n
 * @param {() => T} factory
 * @returns {T[]}
 */
export function makeMany(n, factory) {
  return Array.from({ length: n }, factory)
}

// ---------------------------------------------------------------------------
// User  →  UserProfileDto
// { id: int, email, firstName, lastName, role, isEmailVerified, createdAt }
// ---------------------------------------------------------------------------

/**
 * @param {Partial<object>} overrides
 * @returns {object} UserProfileDto
 */
export function makeUser(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 9999 }),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: "user",
    isEmailVerified: true,
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Category  →  CategoryDto
// { id: int, slug, name, description, imageUrl, displayOrder }
// ---------------------------------------------------------------------------

const CATEGORY_NAMES = ["SOC", "EDR", "XDR", "SIEM", "Zero Trust", "MDM"]

/**
 * @param {Partial<object>} overrides
 * @returns {object} CategoryDto
 */
export function makeCategory(overrides = {}) {
  const name = faker.helpers.arrayElement(CATEGORY_NAMES)
  const slug = name.toLowerCase().replace(/\s+/g, "-")
  return {
    id: faker.number.int({ min: 1, max: 999 }),
    slug,
    name,
    description: faker.lorem.sentence(),
    imageUrl: `https://picsum.photos/seed/${name}/800/400`,
    displayOrder: faker.number.int({ min: 0, max: 10 }),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Product  →  ProductDto  (used by /recherche/catalog and /products)
// { id: int, name, description, status, imageUrl, price }
//
// NOTE: The full product page still needs pricingPlans, images, technicalSpecs,
// categoryId, slug, isFeatured — those are kept for internal mock use by
// /products/:id and /home. The catalog DTO shape (ProductDto) is a subset.
// ---------------------------------------------------------------------------

const PRODUCT_PREFIXES = ["Cyna", "Shield", "Guard", "Sentinel", "Apex"]
const PRODUCT_SUFFIXES = ["EDR Pro", "XDR Suite", "SOC Manager", "Zero Trust Gateway", "SIEM Core"]

/**
 * @param {Partial<object>} overrides
 * @returns {object} ProductDto (+ internal fields for detail / home pages)
 */
export function makeProduct(overrides = {}) {
  const prefix = faker.helpers.arrayElement(PRODUCT_PREFIXES)
  const suffix = faker.helpers.arrayElement(PRODUCT_SUFFIXES)
  const productName = `${prefix} ${suffix}`
  const basePrice = faker.number.float({ min: 49, max: 999, fractionDigits: 2 })
  const p = (n) => parseFloat(n.toFixed(2))

  // Pricing plans — kept for product detail page (not in ProductDto)
  const planMonthly = {
    id: faker.string.uuid(),
    name: "Mensuel",
    billingPeriod: "monthly",
    discountPercent: 0,
    maxUsersCheckout: 10,
    maxDevicesCheckout: 100,
    pricingTiers: [
      { unitType: "user",   minQty: 1,  maxQty: 5,   unitPrice: p(basePrice) },
      { unitType: "user",   minQty: 6,  maxQty: 10,  unitPrice: p(basePrice * 0.75) },
      { unitType: "device", minQty: 1,  maxQty: 50,  unitPrice: p(basePrice * 0.12) },
      { unitType: "device", minQty: 51, maxQty: 100, unitPrice: p(basePrice * 0.09) },
    ],
  }
  const planYearly = {
    id: faker.string.uuid(),
    name: "Annuel",
    billingPeriod: "yearly",
    discountPercent: 15,
    maxUsersCheckout: 10,
    maxDevicesCheckout: 100,
    pricingTiers: [
      { unitType: "user",   minQty: 1,  maxQty: 5,   unitPrice: p(basePrice * 0.85) },
      { unitType: "user",   minQty: 6,  maxQty: 10,  unitPrice: p(basePrice * 0.75 * 0.85) },
      { unitType: "device", minQty: 1,  maxQty: 50,  unitPrice: p(basePrice * 0.12 * 0.85) },
      { unitType: "device", minQty: 51, maxQty: 100, unitPrice: p(basePrice * 0.09 * 0.85) },
    ],
  }
  const planLifetime = {
    id: faker.string.uuid(),
    name: "À vie",
    billingPeriod: "lifetime",
    discountPercent: 0,
    maxUsersCheckout: 10,
    maxDevicesCheckout: 100,
    pricingTiers: [
      { unitType: "user",   minQty: 1,  maxQty: 5,   unitPrice: p(basePrice * 36) },
      { unitType: "user",   minQty: 6,  maxQty: 10,  unitPrice: p(basePrice * 36 * 0.75) },
      { unitType: "device", minQty: 1,  maxQty: 50,  unitPrice: p(basePrice * 36 * 0.12) },
      { unitType: "device", minQty: 51, maxQty: 100, unitPrice: p(basePrice * 36 * 0.09) },
    ],
  }
  const pricingPlans = faker.helpers.arrayElement([
    [planMonthly],
    [planYearly],
    [planMonthly, planYearly],
    [planMonthly, planYearly, planLifetime],
  ])

  return {
    // --- ProductDto fields (v1 API) ---
    id: faker.number.int({ min: 1, max: 9999 }),
    name: productName,
    description: faker.lorem.paragraphs(2),
    // "Active" | "Inactive" | "Archived" maps to the available/unavailable UI logic
    status: faker.helpers.arrayElement(["Active", "Inactive", "Archived"]),
    imageUrl: faker.image.url(),
    price: p(basePrice),

    // --- Internal fields (used by product detail page + home, not in ProductDto) ---
    categoryId: faker.number.int({ min: 1, max: 999 }),
    slug: faker.helpers.slugify(productName).toLowerCase(),
    isFeatured:   faker.datatype.boolean({ probability: 0.2 }),
    displayOrder: faker.number.int({ min: 1, max: 20 }),
    pricingPlans,
    images: Array.from({ length: 3 }, (_, i) =>
      `https://picsum.photos/seed/${prefix}-${i}/800/600`
    ),
    technicalSpecs: faker.helpers.arrayElements([
      "Protection multi-terminaux (Windows, macOS, Linux)",
      "Isolation réseau automatique en cas d'infection",
      "Support technique 24/7 inclus",
      "SLA 99.9% avec temps de réponse garanti",
      "Intégration native avec les outils SOC existants",
      "Déploiement cloud instantané",
    ], faker.number.int({ min: 3, max: 5 })),
    createdAt: faker.date.past().toISOString(),

    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// OrderItem  →  OrderItemDto
// { id: int, productNameSnapshot, planNameSnapshot, quantityUsers, quantityDevices }
// ---------------------------------------------------------------------------

const PLAN_NAMES = ["Mensuel", "Annuel", "Starter", "Pro", "Enterprise"]

/**
 * @param {Partial<object>} overrides
 * @returns {object} OrderItemDto
 */
export function makeOrderItem(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 9999 }),
    productNameSnapshot: makeProduct().name,
    planNameSnapshot: faker.helpers.arrayElement(PLAN_NAMES),
    quantityUsers: faker.number.int({ min: 1, max: 50 }),
    quantityDevices: faker.number.int({ min: 0, max: 200 }),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Order  →  OrderSummaryDto
// { id: int, status, totalAmount, createdAt, invoiceUrl, items: OrderItemDto[] }
// ---------------------------------------------------------------------------

const ORDER_STATUSES = ["Pending", "Paid", "Failed", "Refunded"]

/**
 * @param {Partial<object>} overrides
 * @returns {object} OrderSummaryDto
 */
export function makeOrder(overrides = {}) {
  const items = makeMany(faker.number.int({ min: 1, max: 3 }), makeOrderItem)

  return {
    id: faker.number.int({ min: 1, max: 9999 }),
    status: faker.helpers.arrayElement(ORDER_STATUSES),
    totalAmount: faker.number.float({ min: 49, max: 2400, fractionDigits: 2 }),
    createdAt: faker.date.past().toISOString(),
    invoiceUrl: faker.datatype.boolean({ probability: 0.7 }) ? "#" : null,
    items,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Subscription  →  SubscriptionDto
// { id: int, status, productName, planName,
//   currentPeriodStart, currentPeriodEnd, autoRenew }
// ---------------------------------------------------------------------------

const SUBSCRIPTION_STATUSES = ["Active", "Cancelled", "Expired"]

/**
 * @param {Partial<object>} overrides
 * @returns {object} SubscriptionDto
 */
export function makeSubscription(overrides = {}) {
  const start = faker.date.past()
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)

  return {
    id: faker.number.int({ min: 1, max: 9999 }),
    status: faker.helpers.arrayElement(SUBSCRIPTION_STATUSES),
    productName: makeProduct().name,
    planName: faker.helpers.arrayElement(PLAN_NAMES),
    currentPeriodStart: start.toISOString(),
    currentPeriodEnd: end.toISOString(),
    autoRenew: faker.datatype.boolean(),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Address — internal only (checkout / order detail), not in v1 OpenAPI spec
// ---------------------------------------------------------------------------

/**
 * @param {Partial<object>} overrides
 * @returns {object}
 */
export function makeAddress(overrides = {}) {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    line1: faker.location.streetAddress(),
    line2: faker.datatype.boolean() ? faker.location.secondaryAddress() : null,
    city: faker.location.city(),
    region: faker.location.state(),
    postalCode: faker.location.zipCode(),
    country: faker.location.countryCode(),
    phone: faker.phone.number(),
    isDefault: false,
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// PaymentMethod — internal only
// ---------------------------------------------------------------------------

/**
 * @param {Partial<object>} overrides
 * @returns {object}
 */
export function makePaymentMethod(overrides = {}) {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    stripePaymentMethodId: `pm_${faker.string.alphanumeric(24)}`,
    last4: faker.finance.creditCardNumber("####"),
    brand: faker.helpers.arrayElement(["visa", "mastercard", "amex"]),
    expMonth: faker.number.int({ min: 1, max: 12 }),
    expYear: faker.number.int({ min: 2025, max: 2030 }),
    isDefault: false,
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// CarouselItem — internal only (home page CMS)
// ---------------------------------------------------------------------------

/**
 * @param {Partial<object>} overrides
 * @returns {object}
 */
export function makeCarouselItem(overrides = {}) {
  return {
    id: faker.string.uuid(),
    title: faker.company.catchPhrase(),
    subtitle: faker.lorem.sentence(),
    image: `https://picsum.photos/seed/${faker.string.alphanumeric(6)}/1200/500`,
    link: "/catalog",
    displayOrder: faker.number.int({ min: 0, max: 5 }),
    isActive: true,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// AuthResponse — internal only (login / register)
// ---------------------------------------------------------------------------

/**
 * @param {Partial<object>} userOverrides
 * @returns {{ token: string, user: object }}
 */
export function makeAuthResponse(userOverrides = {}) {
  return {
    token: `eyJ.${faker.string.alphanumeric(64)}.mock`,
    user: makeUser(userOverrides),
  }
}