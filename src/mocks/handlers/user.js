/**
 * @file handlers/user.js
 * @description Handlers mock pour les routes de profil utilisateur et sécurité.
 *
 * Routes v1 :
 *   GET /user/profile  → UserProfileDto
 *   PUT /user/profile  → UpdateProfileDto body, returns UserProfileDto
 *   PUT /user/password → UpdatePasswordDto body
 *   GET /user/subscriptions → SubscriptionDto[]  (voir orders.js)
 *
 * Les mutations échouent aléatoirement (TAUX_ECHEC) pour tester la gestion d'erreurs.
 */

import { faker } from "@faker-js/faker"
import { makeUser, makeSubscription, makeOrder, makeMany } from "../factories/factories.js"

// ---------------------------------------------------------------------------
// État en mémoire
// ---------------------------------------------------------------------------

/**
 * Utilisateur connecté simulé — shape UserProfileDto.
 * @type {object}
 */
let _currentUser = makeUser({
  email: "jean.dupont@entreprise.com",
  firstName: "Jean",
  lastName: "Dupont",
  role: "user",
  isEmailVerified: true,
})

/**
 * Abonnements actifs — shape SubscriptionDto.
 * @type {object[]}
 */
const _activeSubscriptions = makeMany(
  faker.number.int({ min: 1, max: 3 }),
  () => makeSubscription({
    status: "Active",
    currentPeriodEnd: faker.date.future().toISOString(),
  })
)

/** Probabilité d'échec simulé sur les mutations (0–1). */
const TAUX_ECHEC = 0.3

function erreurAleatoire() {
  const messages = [
    "Erreur serveur interne — veuillez réessayer.",
    "Session expirée — reconnectez-vous.",
    "Données invalides reçues par le serveur.",
    "Service temporairement indisponible (503).",
  ]
  throw new Error(faker.helpers.arrayElement(messages))
}

/**
 * Génère des commandes en s'assurant d'avoir au moins un exemplaire
 * de chaque statut pour la démo.
 */
const _accountOrders = [
  makeOrder({ status: "Paid" }),
  makeOrder({ status: "Pending" }),
  makeOrder({ status: "Failed" }),
  makeOrder({ status: "Refunded" }),
  // Commandes supplémentaires aléatoires pour remplir l'historique
  ...makeMany(4, makeOrder),
]

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const userHandlers = [

  // -------------------------------------------------------------------------
  // GET /user/profile — Profil de l'utilisateur connecté (UserProfileDto)
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/user/profile",
    resolver: () => _currentUser,
  },

  // -------------------------------------------------------------------------
  // PUT /user/profile — UpdateProfileDto : { firstName, lastName, email }
  // Retourne UserProfileDto mis à jour
  // -------------------------------------------------------------------------
  {
    method: "PUT",
    path: "/user/profile",
    resolver: ({ body }) => {
      if (faker.datatype.boolean({ probability: TAUX_ECHEC })) erreurAleatoire()
      // Only allow fields defined by UpdateProfileDto
      const { firstName, lastName, email } = body ?? {}
      _currentUser = { ..._currentUser, ...(firstName && { firstName }), ...(lastName && { lastName }), ...(email && { email }) }
      return _currentUser
    },
  },

  // -------------------------------------------------------------------------
  // PUT /user/password — UpdatePasswordDto : { currentPassword, newPassword }
  // -------------------------------------------------------------------------
  {
    method: "PUT",
    path: "/user/password",
    resolver: ({ body }) => {
      if (!body?.currentPassword) {
        throw new Error("Le mot de passe actuel est requis.")
      }
      if (faker.datatype.boolean({ probability: TAUX_ECHEC })) erreurAleatoire()
      return { message: "Mot de passe mis à jour avec succès." }
    },
  },

  // -------------------------------------------------------------------------
  // GET /user/subscriptions — SubscriptionDto[]
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/user/subscriptions",
    resolver: () => _activeSubscriptions,
  },

  // -------------------------------------------------------------------------
  // DELETE /user/subscriptions/:id — résiliation
  // -------------------------------------------------------------------------
  {
    method: "DELETE",
    path: "/user/subscriptions/:id",
    resolver: ({ params }) => {
      const idx = _activeSubscriptions.findIndex((s) => String(s.id) === params.id)
      if (idx !== -1) _activeSubscriptions.splice(idx, 1)
      return null
    },
    status: 204,
  },

  // ------------------------------------------------------------------------
  // GET /user/orders — OrderSummaryDto[]
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/user/orders",
    resolver: () => _accountOrders,
  },

  // -------------------------------------------------------------------------
  // GET /user/orders/:id — détail d'une commande
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/user/orders/:id",
    resolver: ({ params }) =>
      _accountOrders.find((o) => String(o.id) === params.id) ?? null,
  },
]