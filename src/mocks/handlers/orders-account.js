/**
 * @file handlers/orders-account.js
 * @description Handlers mock enrichis pour les commandes du compte utilisateur.
 * Correspond à la page "Historique des commandes" avec statuts, factures PDF et abonnements.
 */

import { faker } from "@faker-js/faker"

/** @typedef {{ id: string, userId: string, status: string, productName: string, total: number, type: string, paymentLast4: string, paymentMethod: string, invoiceUrl: string|null, createdAt: string }} AccountOrder */

// ---------------------------------------------------------------------------
// Données en mémoire — commandes groupées par année
// ---------------------------------------------------------------------------

/** @type {AccountOrder[]} */
const _accountOrders = [
  {
    id: faker.string.uuid(),
    userId: "user-1",
    status: "active",
    statusLabel: "Actif",
    productName: "Cyna EDR Advanced",
    total: 600.0,
    type: "Abonnement Annuel",
    paymentLast4: "4242",
    paymentMethod: "Carte",
    invoiceUrl: "#",
    createdAt: new Date("2024-01-13").toISOString(),
  },
  {
    id: faker.string.uuid(),
    userId: "user-1",
    status: "terminated",
    statusLabel: "Terminée",
    productName: "Audit Cybersécurité Initial",
    total: 1200.0,
    type: "Prestation Unique",
    paymentLast4: "4242",
    paymentMethod: "Virement Bancaire",
    invoiceUrl: "#",
    createdAt: new Date("2024-02-05").toISOString(),
  },
  {
    id: faker.string.uuid(),
    userId: "user-1",
    status: "refunded",
    statusLabel: "Remboursé",
    productName: "Cyna SOC externalisé",
    total: 450.0,
    type: "Abonnement Mensuel",
    paymentLast4: "8765",
    paymentMethod: "Carte",
    invoiceUrl: null,
    createdAt: new Date("2023-03-10").toISOString(),
  },
]

/** @type {import("../registry.js").MockHandler[]} */
export const accountOrderHandlers = [
  // -------------------------------------------------------------------------
  // GET /account/orders — Liste des commandes du compte utilisateur
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/account/orders",
    resolver: () => _accountOrders,
  },

  // -------------------------------------------------------------------------
  // GET /account/orders/:id — Détail d'une commande
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/account/orders/:id",
    resolver: ({ params }) =>
      _accountOrders.find((o) => o.id === params.id) ?? null,
  },
]