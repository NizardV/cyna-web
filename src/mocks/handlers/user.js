/**
 * @file handlers/user.js
 * @description Handlers mock pour les routes de profil utilisateur et sécurité.
 * Les opérations de modification (profil, mot de passe) échouent aléatoirement
 * pour permettre de tester la gestion d'erreurs côté interface.
 */

import { faker } from "@faker-js/faker"
import { makeUser, makeSubscription, makeMany } from "../factories/factories.js"

// ---------------------------------------------------------------------------
// État en mémoire — initialisé aléatoirement via Faker
// ---------------------------------------------------------------------------

/**
 * Utilisateur connecté simulé.
 * Nom et email sont générés aléatoirement à chaque démarrage.
 * @type {object}
 */
let _currentUser = makeUser({
  email: "jean.dupont@entreprise.com",
  name: "Jean Dupont",
  role: "user",
  isConfirmed: true,
})

/**
 * Abonnements actifs de l'utilisateur — quantité et dates aléatoires.
 * @type {object[]}
 */
const _activeSubscriptions = makeMany(
  faker.number.int({ min: 1, max: 3 }),
  () => makeSubscription({
    status: "active",
    quantity: faker.number.int({ min: 1, max: 100 }),
    endsAt: faker.date.future().toISOString(),
  })
)

/**
 * Probabilité d'échec simulé sur les mutations (0–1).
 * Permet de tester l'affichage des erreurs en interface.
 * @type {number}
 */
const TAUX_ECHEC = 0.3

/**
 * Génère une erreur simulée aléatoire pour démontrer la gestion d'erreurs.
 *
 * @returns {never}
 * @throws {Error} Message d'erreur aléatoire
 */
function erreurAleatoire() {
  const messages = [
    "Erreur serveur interne — veuillez réessayer.",
    "Session expirée — reconnectez-vous.",
    "Données invalides reçues par le serveur.",
    "Service temporairement indisponible (503).",
  ]
  throw new Error(faker.helpers.arrayElement(messages))
}

// ---------------------------------------------------------------------------
// Handlers enregistrés
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const userHandlers = [
  // -------------------------------------------------------------------------
  // PUT /user/profile — Mise à jour des informations personnelles
  // Échoue aléatoirement avec une probabilité de TAUX_ECHEC
  // -------------------------------------------------------------------------
  {
    method: "PUT",
    path: "/user/profile",
    resolver: ({ body }) => {
      if (faker.datatype.boolean({ probability: TAUX_ECHEC })) erreurAleatoire()
      _currentUser = { ..._currentUser, ...body }
      return _currentUser
    },
  },

  // -------------------------------------------------------------------------
  // PUT /user/password — Changement de mot de passe
  // Valide le champ requis puis peut échouer aléatoirement
  // -------------------------------------------------------------------------
  {
    method: "PUT",
    path: "/user/password",
    resolver: ({ body }) => {
      if (!body.currentPassword) {
        throw new Error("Le mot de passe actuel est requis.")
      }
      if (faker.datatype.boolean({ probability: TAUX_ECHEC })) erreurAleatoire()
      return { message: "Mot de passe mis à jour avec succès." }
    },
  },

  // -------------------------------------------------------------------------
  // GET /user/subscriptions — Abonnements actifs de l'utilisateur
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/user/subscriptions",
    resolver: () => _activeSubscriptions,
  },
]