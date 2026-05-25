/**
 * @file handlers/auth.js
 * @description Handlers mock pour les routes d'authentification.
 * - Login et register : erreurs intentionnelles (délégués à l'équipe login)
 * - Logout : peut échouer aléatoirement pour tester la résilience côté client
 * - /auth/me : retourne un utilisateur Faker fixe (Jean Dupont)
 */

import { faker } from "@faker-js/faker"
import { makeUser } from "../factories/factories.js"

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
  // POST /auth/register — Intentionnellement non implémenté (équipe login)
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/register",
    resolver: () => {
      throw new Error("Register : non implémenté")
    },
    status: 501,
  },

  // -------------------------------------------------------------------------
  // POST /auth/login — Intentionnellement non implémenté (équipe login)
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/login",
    resolver: () => {
      throw new Error("Login : non implémenté")
    },
    status: 501,
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
  // POST /auth/confirm — Confirmation d'adresse e-mail
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/confirm",
    resolver: () => ({ message: "Email confirmé avec succès." }),
  },

  // -------------------------------------------------------------------------
  // POST /auth/forgot-password — Demande de lien de réinitialisation
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/forgot-password",
    resolver: () => ({ message: "Lien envoyé si l'adresse e-mail existe." }),
  },

  // -------------------------------------------------------------------------
  // POST /auth/reset-password — Réinitialisation du mot de passe
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/reset-password",
    resolver: () => ({ message: "Mot de passe réinitialisé avec succès." }),
  },

  // -------------------------------------------------------------------------
  // GET /auth/me — Profil de l'utilisateur connecté (données fixes pour la démo)
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/auth/me",
    resolver: () =>
      makeUser({
        email: "jean.dupont@entreprise.com",
        name: "Jean Dupont",
        role: "user",
        isConfirmed: true,
      }),
  },
]