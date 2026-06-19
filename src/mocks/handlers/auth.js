/**
 * @file handlers/auth.js
 * @description Handlers mock pour les routes d'authentification.
 * - Login : accepte n'importe quels email/mot de passe et retourne un token + utilisateur
 * - Register : accepte les données et retourne un token + utilisateur créé
 * - Logout : peut échouer aléatoirement pour tester la résilience côté client
 * - /auth/me : retourne un utilisateur Faker fixe (Jean Dupont)
 */

import { faker } from "@faker-js/faker"
import { makeUser, makeAuthResponse } from "../factories/factories.js"

/**
 * Probabilité d'échec simulé sur le logout (0–1).
 * Même en cas d'échec API, le client doit supprimer le token local.
 * @type {number}
 */
const TAUX_ECHEC_LOGOUT = 0.25

// ---------------------------------------------------------------------------
// Handlers enregistrés
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const authHandlers = [

  // -------------------------------------------------------------------------
  // POST /auth/login — Accepte n'importe quel email/mot de passe
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/login",
    resolver: (req) => {
      const { email, password } = req.body || {}
      if (!email || !password) {
        throw new Error("Email et mot de passe requis.")
      }
      const response = makeAuthResponse({ email })
      localStorage.setItem("cyna_token", response.token)
      return response
    },
  },

  // -------------------------------------------------------------------------
  // POST /auth/register — Crée un utilisateur avec les données fournies
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/register",
    resolver: (req) => {
      const { fullName, email, password } = req.body || {}
      if (!fullName || !email || !password) {
        throw new Error("Nom complet, email et mot de passe requis.")
      }
      const response = makeAuthResponse({ name: fullName, email })
      localStorage.setItem("cyna_token", response.token)
      return response
    },
  },

  // -------------------------------------------------------------------------
  // POST /auth/logout — Supprime le token local, peut échouer aléatoirement.
  // Le client doit toujours rediriger même si l'API renvoie une erreur.
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/logout",
    resolver: () => {
      localStorage.removeItem("cyna_token")
      if (faker.datatype.boolean({ probability: TAUX_ECHEC_LOGOUT })) {
        throw new Error("Erreur lors de la déconnexion côté serveur (token révoqué localement).")
      }
      return { message: "Déconnecté avec succès." }
    },
  },

  // -------------------------------------------------------------------------
  // POST /auth/reset-password — Réinitialisation du mot de passe
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/reset-password",
    resolver: () => ({ message: "Mot de passe réinitialisé avec succès." }),
  },
]