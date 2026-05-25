/**
 * @file handlers/auth.js
 * @description Handlers mock pour les routes d'authentification.
 * Login et register retournent intentionnellement une erreur (délégués à l'équipe login).
 */

import { makeAuthResponse, makeUser } from "../factories/factories.js"

/** Utilisateurs enregistrés simulés en mémoire */
const _users = [
  makeUser({ email: "user@cyna.com", role: "user" }),
  makeUser({ email: "admin@cyna.com", role: "admin", is2faEnabled: true }),
]

/** @type {import("../registry.js").MockHandler[]} */
export const authHandlers = [
  // -------------------------------------------------------------------------
  // POST /auth/register — Intentionnellement en erreur (équipe login)
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/register",
    resolver: () => {
      throw new Error("Register : non implémenté — délégué à l'équipe login.")
    },
    status: 501,
  },

  // -------------------------------------------------------------------------
  // POST /auth/login — Intentionnellement en erreur (équipe login)
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/login",
    resolver: () => {
      throw new Error("Login : non implémenté — délégué à l'équipe login.")
    },
    status: 501,
  },

  // -------------------------------------------------------------------------
  // POST /auth/logout — Supprime le token et redirige
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/logout",
    resolver: () => {
      localStorage.removeItem("cyna_token")
      return { message: "Déconnecté avec succès." }
    },
  },

  // -------------------------------------------------------------------------
  // POST /auth/confirm — Confirmation e-mail
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/confirm",
    resolver: () => ({ message: "Email confirmé avec succès" }),
  },

  // -------------------------------------------------------------------------
  // POST /auth/forgot-password — Lien de réinitialisation
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/forgot-password",
    resolver: () => ({ message: "Lien envoyé si l'email existe" }),
  },

  // -------------------------------------------------------------------------
  // POST /auth/reset-password — Réinitialisation mot de passe
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/reset-password",
    resolver: () => ({ message: "Mot de passe réinitialisé avec succès" }),
  },

  // -------------------------------------------------------------------------
  // GET /auth/me — Utilisateur connecté simulé
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