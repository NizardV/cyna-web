/**
 * @file handlers/user.js
 * @description Handlers mock pour les routes de profil utilisateur et sécurité.
 */

import { makeUser, makeSubscription, makeMany } from "../factories/factories.js"

// Utilisateur connecté simulé en mémoire
let _currentUser = makeUser({
  email: "jean.dupont@entreprise.com",
  name: "Jean Dupont",
  role: "user",
  isConfirmed: true,
})

// Abonnements actifs de l'utilisateur
const _activeSubscriptions = makeMany(1, () =>
  makeSubscription({
    productName: "Cyna EDR Advanced",
    status: "active",
    quantity: 50,
    endsAt: new Date("2024-12-10").toISOString(),
  })
)

/** @type {import("../registry.js").MockHandler[]} */
export const userHandlers = [
  // -------------------------------------------------------------------------
  // PUT /user/profile — Mise à jour des informations personnelles
  // -------------------------------------------------------------------------
  {
    method: "PUT",
    path: "/user/profile",
    resolver: ({ body }) => {
      _currentUser = { ..._currentUser, ...body }
      return _currentUser
    },
  },

  // -------------------------------------------------------------------------
  // PUT /user/password — Changement de mot de passe
  // -------------------------------------------------------------------------
  {
    method: "PUT",
    path: "/user/password",
    resolver: ({ body }) => {
      if (!body.currentPassword) {
        throw new Error("Mot de passe actuel requis")
      }
      return { message: "Mot de passe mis à jour avec succès" }
    },
  },
]