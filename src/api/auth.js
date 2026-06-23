/**
 * @file api/auth.js
 * @description Appels API pour l'authentification, la réinitialisation de
 * mot de passe par OTP, la confirmation d'email, et le 2FA admin.
 * Toute logique d'appel réseau pour le domaine "auth" vit ici — les pages
 * ne doivent jamais appeler apiClient directement.
 */

import { apiClient } from "./client.js"

// ---------------------------------------------------------------------------
// Connexion / inscription standard
// ---------------------------------------------------------------------------

export const loginUser = ({ email, password }) =>
  apiClient.post("/auth/login", { email, password })

export const registerUser = ({ firstName, lastName, email, password }) =>
  apiClient.post("/auth/register", { firstName, lastName, email, password })

// Note: the backend reads the refresh token from the httpOnly cookie, not the
// body — these still accept the old { refreshToken } shape for backward
// compatibility with existing call sites, but it's unused.
export const refreshToken = (_unused) => apiClient.post("/auth/refresh", {})

export const logout = (_unused) => apiClient.post("/auth/logout", {})

// ---------------------------------------------------------------------------
// Réinitialisation de mot de passe par OTP
// ---------------------------------------------------------------------------

/**
 * Demande l'envoi d'un code OTP de réinitialisation de mot de passe.
 * @param {{ email: string }} dto
 */
export const forgotPassword = ({ email }) =>
  apiClient.post("/auth/forgot-password", { email })

/**
 * Réinitialise le mot de passe avec le code OTP reçu par email.
 * @param {{ email: string, code: string, newPassword: string }} dto
 */
export const resetPassword = ({ email, code, newPassword }) =>
  apiClient.post("/auth/reset-password", { email, code, newPassword })

// ---------------------------------------------------------------------------
// Confirmation d'email par OTP
// ---------------------------------------------------------------------------

/**
 * Confirme l'adresse email avec le code OTP reçu (inscription ou changement d'email).
 * @param {{ email: string, code: string }} dto
 */
export const confirmEmail = ({ email, code }) =>
  apiClient.post("/auth/confirm-email", { email, code })

// ---------------------------------------------------------------------------
// Connexion administrateur avec 2FA (bootstrap-aware)
// ---------------------------------------------------------------------------

/**
 * Connexion admin. `totpCode` est optionnel — voir AuthResultDto côté backend :
 * - Pas encore de 2FA confirmé → connexion directe, `requiresTwoFactorSetup: true`.
 * - 2FA actif, code absent ou invalide → rejet avec `totpRequired: true`.
 * @param {{ email: string, password: string, totpCode?: string|null }} dto
 */
export const adminLogin = ({ email, password, totpCode }) =>
  apiClient.post("/auth/admin/login", {
    email,
    password,
    ...(totpCode ? { totpCode } : {}),
  })

/**
 * Génère un secret TOTP (pending) et l'URL otpauth:// pour le QR code.
 * Nécessite une session authentifiée (Admin/SuperAdmin).
 * @returns {Promise<{ secret: string, otpAuthUrl: string }>}
 */
export const setupTwoFactor = () => apiClient.post("/auth/2fa/setup")

/**
 * Confirme l'activation du 2FA avec un premier code TOTP valide.
 * @param {{ totpCode: string }} dto
 */
export const confirmTwoFactor = ({ totpCode }) =>
  apiClient.post("/auth/2fa/confirm", { totpCode })