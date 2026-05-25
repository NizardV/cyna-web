/**
 * @file handlers/orders-account.js
 * @description Handlers mock enrichis pour les commandes du compte utilisateur.
 * Toutes les commandes sont générées aléatoirement via Faker.
 * Les statuts, montants, méthodes de paiement et dates varient à chaque démarrage.
 */

import { faker } from "@faker-js/faker"

/**
 * @typedef {Object} AccountOrder
 * @property {string}      id            - Identifiant unique de la commande
 * @property {string}      userId        - Identifiant de l'utilisateur
 * @property {string}      status        - Statut technique : active | terminated | refunded | paid | pending | failed
 * @property {string}      statusLabel   - Libellé affiché en interface
 * @property {string}      productName   - Nom du produit commandé
 * @property {number}      total         - Montant total en euros
 * @property {string}      type          - Type de commande (Abonnement Mensuel, Annuel, etc.)
 * @property {string}      paymentLast4  - 4 derniers chiffres du moyen de paiement
 * @property {string}      paymentMethod - Libellé du moyen de paiement
 * @property {string|null} invoiceUrl    - URL de la facture PDF ou null
 * @property {string}      createdAt     - Date ISO de création
 */

// ---------------------------------------------------------------------------
// Données statiques de référence
// ---------------------------------------------------------------------------

/**
 * Correspondance statut technique → libellé affiché.
 * @type {Record<string, string>}
 */
const STATUS_LABELS = {
  active:     "Actif",
  terminated: "Terminée",
  refunded:   "Remboursé",
  paid:       "Payé",
  pending:    "En attente",
  failed:     "Échoué",
}

/**
 * Noms de produits SaaS plausibles pour les commandes mock.
 * @type {string[]}
 */
const PRODUCT_NAMES = [
  "Cyna EDR Advanced",
  "Cyna SOC Externalisé",
  "Shield XDR Suite",
  "Sentinel SIEM Core",
  "Apex Zero Trust Gateway",
  "Guard MDM Pro",
  "Audit Cybersécurité Initial",
  "Cyna EDR Starter",
  "Shield SOC Manager",
]

/**
 * Types de commandes possibles.
 * @type {string[]}
 */
const ORDER_TYPES = ["Abonnement Mensuel", "Abonnement Annuel", "Prestation Unique"]

/**
 * Méthodes de paiement possibles.
 * @type {string[]}
 */
const PAYMENT_METHODS = ["Carte", "Virement Bancaire", "Prélèvement SEPA"]

// ---------------------------------------------------------------------------
// Génération aléatoire des commandes — 2 années de données
// ---------------------------------------------------------------------------

/**
 * Génère une commande de compte aléatoire.
 *
 * @param {Partial<AccountOrder>} [overrides] - Surcharges optionnelles
 * @returns {AccountOrder}
 */
function makeAccountOrder(overrides = {}) {
  const status = faker.helpers.arrayElement(Object.keys(STATUS_LABELS))
  const method = faker.helpers.arrayElement(PAYMENT_METHODS)
  const hasInvoice = faker.datatype.boolean({ probability: 0.7 })

  return {
    id: faker.string.uuid(),
    userId: "user-1",
    status,
    statusLabel: STATUS_LABELS[status],
    productName: faker.helpers.arrayElement(PRODUCT_NAMES),
    total: faker.number.float({ min: 49, max: 2400, fractionDigits: 2 }),
    type: faker.helpers.arrayElement(ORDER_TYPES),
    paymentLast4: method === "Carte" ? faker.finance.creditCardNumber("####") : "",
    paymentMethod: method,
    invoiceUrl: hasInvoice ? "#" : null,
    createdAt: faker.date.between({
      from: new Date("2023-01-01"),
      to: new Date(),
    }).toISOString(),
    ...overrides,
  }
}

/**
 * Stock en mémoire des commandes du compte.
 * Génère 8 commandes aléatoires réparties sur ~2 ans.
 * @type {AccountOrder[]}
 */
const _accountOrders = [
  // On s'assure d'avoir au moins un exemplaire de chaque statut pour la démo
  makeAccountOrder({ status: "active",     statusLabel: "Actif" }),
  makeAccountOrder({ status: "paid",       statusLabel: "Payé" }),
  makeAccountOrder({ status: "terminated", statusLabel: "Terminée" }),
  makeAccountOrder({ status: "refunded",   statusLabel: "Remboursé" }),
  makeAccountOrder({ status: "pending",    statusLabel: "En attente" }),
  makeAccountOrder({ status: "failed",     statusLabel: "Échoué" }),
  // Commandes supplémentaires aléatoires pour remplir l'historique
  makeAccountOrder(),
  makeAccountOrder(),
]

// ---------------------------------------------------------------------------
// Handlers enregistrés
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const accountOrderHandlers = [
  // -------------------------------------------------------------------------
  // GET /account/orders — Liste complète des commandes du compte
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/account/orders",
    resolver: () => _accountOrders,
  },

  // -------------------------------------------------------------------------
  // GET /account/orders/:id — Détail d'une commande par identifiant
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/account/orders/:id",
    resolver: ({ params }) =>
      _accountOrders.find((o) => o.id === params.id) ?? null,
  },
]