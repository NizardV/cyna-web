/**
 * @file handlers/auth.js
 * @description Handlers mock pour l'authentification.
 *
 * Routes couvertes :
 *   POST /auth/login
 *   POST /auth/register
 *   POST /auth/refresh
 *   POST /auth/logout
 *   GET  /auth/me
 *   POST /auth/forgot-password
 *   POST /auth/reset-password
 *   POST /auth/confirm-email
 *   POST /auth/admin/login        (phase 1 + 2 TOTP)
 *   POST /auth/2fa/setup
 *   POST /auth/2fa/confirm
 *
 * Tokens mock :
 *   MOCK_ADMIN_TOKEN  — session admin après login complet
 *   MOCK_USER_TOKEN   — session utilisateur standard
 *
 * Codes OTP mock (tous les comptes) :
 *   reset-password  → "123456"
 *   confirm-email   → "654321"
 *   TOTP admin      → "000000"  (ou n'importe quel code si TOTP non encore activé)
 */

import { faker } from "@faker-js/faker"
import { makeUser, makeAuthResponse } from "../factories/factories.js"
import { _adminUsers } from "../store.js"

// ---------------------------------------------------------------------------
// State mock en mémoire (réinitialisé à chaque rechargement de page)
// ---------------------------------------------------------------------------

/** @type {Map<string, object>}  email → user en session */
const _sessions = new Map()

/** @type {Map<string, string>}  email → code OTP reset-password en attente */
const _resetCodes = new Map()

/** @type {Map<string, string>}  email → code OTP confirm-email en attente */
const _confirmCodes = new Map()

// Utilisateurs enregistrés dynamiquement (register mock)
/** @type {Map<string, object>}  email → UserProfileDto */
const _registeredUsers = new Map()

// Codes OTP fixes pour le mock
const OTP_RESET   = "123456"
const OTP_CONFIRM = "654321"
const OTP_TOTP    = "000000"

// Tokens opaques
const MOCK_USER_TOKEN  = "mock-user-token"
const MOCK_ADMIN_TOKEN = "mock-admin-token"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recherche un utilisateur d'abord dans _adminUsers (store partagé),
 * puis dans les comptes créés dynamiquement par /auth/register.
 */
function findUser(email) {
  const lower = email.toLowerCase()
  return (
    _adminUsers.find((u) => u.email.toLowerCase() === lower) ??
    _registeredUsers.get(lower) ??
    null
  )
}

function isAdmin(user) {
  return user?.role === "Admin" || user?.role === "SuperAdmin"
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const authHandlers = [

  // -------------------------------------------------------------------------
  // POST /auth/login
  // Body : { email, password }
  // Réponse : { token, user: UserProfileDto }
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/login",
    resolver: ({ body }) => {
      const user = findUser(body.email)
      if (!user || body.password !== "password") {
        throw Object.assign(new Error("Identifiants invalides."), { status: 401 })
      }
      if (user.isDisabled) {
        throw Object.assign(new Error("Compte désactivé."), { status: 403 })
      }
      _sessions.set(body.email.toLowerCase(), user)
      return { token: MOCK_USER_TOKEN, user }
    },
  },

  // -------------------------------------------------------------------------
  // POST /auth/register
  // Body : { firstName, lastName, email, password }
  // Réponse 201 : { token, user: UserProfileDto }
  // Effet secondaire : génère et "envoie" un code de confirmation d'email.
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/register",
    resolver: ({ body }) => {
      const lower = body.email.toLowerCase()
      if (findUser(lower)) {
        throw Object.assign(new Error("Un compte existe déjà avec cet email."), { status: 409 })
      }
      const newUser = makeUser({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        role: "User",
        isEmailVerified: false,
      })
      _registeredUsers.set(lower, newUser)
      _confirmCodes.set(lower, OTP_CONFIRM)
      _sessions.set(lower, newUser)
      console.info(`[mock] confirm-email code for ${lower}: ${OTP_CONFIRM}`)
      return { token: MOCK_USER_TOKEN, user: newUser }
    },
    status: 201,
  },

  // -------------------------------------------------------------------------
  // POST /auth/refresh
  // Body : {} (le backend lit le cookie httpOnly)
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/refresh",
    resolver: () => ({ token: MOCK_USER_TOKEN }),
  },

  // -------------------------------------------------------------------------
  // POST /auth/logout
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/logout",
    resolver: () => null,
    status: 204,
  },

  // -------------------------------------------------------------------------
  // GET /auth/me
  // Réponse : UserProfileDto (premier utilisateur du store par défaut)
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/auth/me",
    resolver: () => {
      // Retourne le premier user non-admin comme utilisateur connecté par défaut
      return _adminUsers.find((u) => u.role === "User") ?? _adminUsers[0]
    },
  },

  // =========================================================================
  // Réinitialisation de mot de passe par OTP
  // =========================================================================

  // -------------------------------------------------------------------------
  // POST /auth/forgot-password
  // Body : { email }
  // Réponse 204 (toujours, même si l'email n'existe pas — sécurité)
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/forgot-password",
    resolver: ({ body }) => {
      const lower = body.email?.toLowerCase()
      if (lower) {
        _resetCodes.set(lower, OTP_RESET)
        console.info(`[mock] reset-password code for ${lower}: ${OTP_RESET}`)
      }
      return null
    },
    status: 204,
  },

  // -------------------------------------------------------------------------
  // POST /auth/reset-password
  // Body : { email, code, newPassword }
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/reset-password",
    resolver: ({ body }) => {
      const lower = body.email?.toLowerCase()
      const stored = _resetCodes.get(lower)
      if (!stored || stored !== body.code) {
        throw Object.assign(
          new Error("Code invalide ou expiré."),
          { status: 400 }
        )
      }
      _resetCodes.delete(lower)
      return null
    },
    status: 204,
  },

  // =========================================================================
  // Confirmation d'email par OTP
  // =========================================================================

  // -------------------------------------------------------------------------
  // POST /auth/confirm-email
  // Body : { email, code }
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/confirm-email",
    resolver: ({ body }) => {
      const lower = body.email?.toLowerCase()

      // Pour le mock : accepte OTP_CONFIRM ou un code déjà stocké
      const stored = _confirmCodes.get(lower) ?? OTP_CONFIRM
      if (body.code !== stored) {
        throw Object.assign(
          new Error("Code invalide ou expiré."),
          { status: 400 }
        )
      }

      // Marque l'email comme vérifié dans le store
      const user =
        _adminUsers.find((u) => u.email.toLowerCase() === lower) ??
        _registeredUsers.get(lower)
      if (user) user.isEmailVerified = true

      _confirmCodes.delete(lower)
      return null
    },
    status: 204,
  },

  // =========================================================================
  // Connexion administrateur avec 2FA (TOTP)
  // =========================================================================

  // -------------------------------------------------------------------------
  // POST /auth/admin/login
  // Body : { email, password, totpCode? }
  //
  // Comportement mock :
  //   - Identifiants invalides → 401
  //   - Rôle insuffisant (User) → 403
  //   - Compte sans 2FA (hasTwoFactor: false) → 200 avec requiresTwoFactorSetup: true
  //   - Compte avec 2FA, pas de totpCode → 200 avec totpRequired: true
  //   - Compte avec 2FA, totpCode === OTP_TOTP → 200 avec token + user
  //   - Compte avec 2FA, totpCode invalide → 401
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/admin/login",
    resolver: ({ body }) => {
      const user = findUser(body.email)

      if (!user || body.password !== "password") {
        throw Object.assign(new Error("Identifiants invalides."), { status: 401 })
      }
      if (!isAdmin(user)) {
        throw Object.assign(new Error("Accès refusé."), { status: 403 })
      }
      if (user.isDisabled) {
        throw Object.assign(new Error("Compte désactivé."), { status: 403 })
      }

      // Phase bootstrap : l'admin n'a pas encore configuré son 2FA
      if (!user.hasTwoFactor) {
        _sessions.set(body.email.toLowerCase(), user)
        return {
          token: MOCK_ADMIN_TOKEN,
          user,
          requiresTwoFactorSetup: true,
          totpRequired: false,
        }
      }

      // Phase 1 : credentials OK mais pas encore de code TOTP fourni
      if (!body.totpCode) {
        return {
          token: null,
          user: null,
          requiresTwoFactorSetup: false,
          totpRequired: true,
        }
      }

      // Phase 2 : vérification du code TOTP
      if (body.totpCode !== OTP_TOTP) {
        throw Object.assign(
          new Error("Code TOTP invalide ou expiré."),
          { status: 401 }
        )
      }

      _sessions.set(body.email.toLowerCase(), user)
      return {
        token: MOCK_ADMIN_TOKEN,
        user,
        requiresTwoFactorSetup: false,
        totpRequired: false,
      }
    },
  },

  // =========================================================================
  // Setup / confirm 2FA
  // =========================================================================

  // -------------------------------------------------------------------------
  // POST /auth/2fa/setup
  // Génère un secret TOTP pending et une URL otpauth://.
  // Réponse : { secret, otpAuthUrl }
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/2fa/setup",
    resolver: () => {
      const secret = faker.string.alphanumeric(32).toUpperCase()
      return {
        secret,
        otpAuthUrl: `otpauth://totp/Cyna:admin%40cyna.fr?secret=${secret}&issuer=Cyna&algorithm=SHA1&digits=6&period=30`,
      }
    },
  },

  // -------------------------------------------------------------------------
  // POST /auth/2fa/confirm
  // Body : { totpCode }
  // Active définitivement le 2FA sur l'utilisateur en session.
  // -------------------------------------------------------------------------
  {
    method: "POST",
    path: "/auth/2fa/confirm",
    resolver: ({ body }) => {
      if (body.totpCode !== OTP_TOTP) {
        throw Object.assign(
          new Error("Code invalide. Vérifiez l'heure de votre téléphone et réessayez."),
          { status: 400 }
        )
      }
      // Active hasTwoFactor sur tous les admins en session pour cohérence
      _adminUsers
        .filter((u) => isAdmin(u))
        .forEach((u) => { u.hasTwoFactor = true })
      return null
    },
    status: 204,
  },
]