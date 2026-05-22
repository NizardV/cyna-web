/**
 * @file factories.js
 * @description Data factories using @faker-js/faker.
 *
 * Each factory generates a realistic mock object matching the .NET API DTOs.
 * Use `make<Entity>(overrides)` to create one item.
 * Use `makeMany<Entity>(n, overrides)` to create a list.
 *
 * Install: npm install --save-dev @faker-js/faker
 */

import { faker } from "@faker-js/faker";

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Generate `n` items using a factory function.
 *
 * @template T
 * @param {number} n
 * @param {() => T} factory
 * @returns {T[]}
 */
export function makeMany(n, factory) {
  return Array.from({ length: n }, factory);
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

/**
 * Generate a mock user object.
 *
 * @param {Partial<object>} overrides
 * @returns {object}
 *
 * @example
 * const user = makeUser({ role: "admin" });
 */
export function makeUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: "user",
    isConfirmed: true,
    is2faEnabled: false,
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

const CATEGORY_NAMES = ["SOC", "EDR", "XDR", "SIEM", "Zero Trust", "MDM"];

/**
 * Generate a mock category.
 *
 * @param {Partial<object>} overrides
 * @returns {object}
 */
export function makeCategory(overrides = {}) {
  const name = faker.helpers.arrayElement(CATEGORY_NAMES);
  return {
    id: faker.string.uuid(),
    name,
    description: faker.lorem.sentence(),
    image: `https://picsum.photos/seed/${name}/800/400`,
    displayOrder: faker.number.int({ min: 0, max: 10 }),
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

const PRODUCT_PREFIXES = ["Cyna", "Shield", "Guard", "Sentinel", "Apex"];
const PRODUCT_SUFFIXES = ["EDR Pro", "XDR Suite", "SOC Manager", "Zero Trust Gateway", "SIEM Core"];

/**
 * Generate a mock SaaS product.
 *
 * @param {Partial<object>} overrides
 * @returns {object}
 */
export function makeProduct(overrides = {}) {
  const prefix = faker.helpers.arrayElement(PRODUCT_PREFIXES);
  const suffix = faker.helpers.arrayElement(PRODUCT_SUFFIXES);
  const priceMonthly = faker.number.float({ min: 49, max: 999, fractionDigits: 2 });

  return {
    id: faker.string.uuid(),
    categoryId: faker.string.uuid(),
    name: `${prefix} ${suffix}`,
    description: faker.lorem.paragraphs(2),
    priceMonthly,
    priceYearly: parseFloat((priceMonthly * 10).toFixed(2)), // 2 months free
    isAvailable: faker.datatype.boolean({ probability: 0.85 }),
    priority: faker.number.int({ min: 0, max: 5 }),
    images: Array.from({ length: 3 }, (_, i) =>
      `https://picsum.photos/seed/${prefix}-${i}/800/600`
    ),
    technicalSpecs: {
      platforms: faker.helpers.arrayElements(["Windows", "macOS", "Linux", "Android", "iOS"], 3),
      support: "24/7",
      sla: `${faker.number.int({ min: 95, max: 99 })}% uptime`,
      maxDevices: faker.number.int({ min: 10, max: 1000 }),
    },
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Address
// ---------------------------------------------------------------------------

/**
 * Generate a mock billing address.
 *
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
  };
}

// ---------------------------------------------------------------------------
// Payment Method
// ---------------------------------------------------------------------------

/**
 * Generate a mock saved payment method (Stripe reference only — no real data).
 *
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
  };
}

// ---------------------------------------------------------------------------
// Order Item
// ---------------------------------------------------------------------------

/**
 * Generate a mock order item.
 *
 * @param {Partial<object>} overrides
 * @returns {object}
 */
export function makeOrderItem(overrides = {}) {
  const unitPrice = faker.number.float({ min: 49, max: 999, fractionDigits: 2 });
  const quantity = faker.number.int({ min: 1, max: 5 });

  return {
    id: faker.string.uuid(),
    orderId: faker.string.uuid(),
    productId: faker.string.uuid(),
    productName: makeProduct().name,
    quantity,
    duration: faker.helpers.arrayElement(["monthly", "yearly"]),
    unitPrice,
    totalPrice: parseFloat((unitPrice * quantity).toFixed(2)),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Order
// ---------------------------------------------------------------------------

const ORDER_STATUSES = ["pending", "paid", "failed", "refunded"];

/**
 * Generate a mock order with items.
 *
 * @param {Partial<object>} overrides
 * @returns {object}
 */
export function makeOrder(overrides = {}) {
  const items = makeMany(faker.number.int({ min: 1, max: 3 }), makeOrderItem);
  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    status: faker.helpers.arrayElement(ORDER_STATUSES),
    total: parseFloat(total.toFixed(2)),
    stripePaymentIntentId: `pi_${faker.string.alphanumeric(24)}`,
    invoiceUrl: null,
    items,
    address: makeAddress(),
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

const SUBSCRIPTION_STATUSES = ["active", "cancelled", "expired", "renewed"];

/**
 * Generate a mock subscription.
 *
 * @param {Partial<object>} overrides
 * @returns {object}
 */
export function makeSubscription(overrides = {}) {
  const startsAt = faker.date.past();
  const endsAt = new Date(startsAt);
  endsAt.setMonth(endsAt.getMonth() + 1);

  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    productId: faker.string.uuid(),
    productName: makeProduct().name,
    stripeSubscriptionId: `sub_${faker.string.alphanumeric(24)}`,
    status: faker.helpers.arrayElement(SUBSCRIPTION_STATUSES),
    duration: faker.helpers.arrayElement(["monthly", "yearly"]),
    quantity: faker.number.int({ min: 1, max: 10 }),
    unitPrice: faker.number.float({ min: 49, max: 999, fractionDigits: 2 }),
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    renewedAt: null,
    cancelledAt: null,
    createdAt: startsAt.toISOString(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Carousel Item
// ---------------------------------------------------------------------------

/**
 * Generate a mock carousel item.
 *
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
  };
}

// ---------------------------------------------------------------------------
// Auth responses
// ---------------------------------------------------------------------------

/**
 * Generate a mock login/register success response.
 *
 * @param {Partial<object>} userOverrides
 * @returns {{ token: string, user: object }}
 */
export function makeAuthResponse(userOverrides = {}) {
  return {
    token: `eyJ.${faker.string.alphanumeric(64)}.mock`,
    user: makeUser(userOverrides),
  };
}