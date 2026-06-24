/**
 * @file handlers/admin-users.js
 * @description Handlers mock pour l'administration des utilisateurs.
 *
 * Routes v1 (Admin / SuperAdmin uniquement) :
 *   GET   /admin/users
 *   PATCH /admin/users/:id/disable
 *   PATCH /admin/users/:id/enable
 *   PATCH /admin/users/:id/role   body: { role: "User"|"Admin"|"SuperAdmin" }
 *
 * AdminUserDto :
 *   { id, email, firstName, lastName, role, isEmailVerified,
 *     isDisabled, hasTwoFactor, createdAt }
 */

import { _adminUsers } from "../store.js"

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/** @type {import("../registry.js").MockHandler[]} */
export const adminUserHandlers = [

  // -------------------------------------------------------------------------
  // GET /admin/users — liste tous les utilisateurs sauf l'admin connecté
  // -------------------------------------------------------------------------
  {
    method: "GET",
    path: "/admin/users",
    resolver: () => _adminUsers,
  },

  // -------------------------------------------------------------------------
  // PATCH /admin/users/:id/disable — désactive un compte
  // -------------------------------------------------------------------------
  {
    method: "PATCH",
    path: "/admin/users/:id/disable",
    resolver: ({ params }) => {
      const user = _adminUsers.find((u) => String(u.id) === params.id)
      if (!user) throw new Error("Utilisateur introuvable.")
      user.isDisabled = true
      return user
    },
  },

  // -------------------------------------------------------------------------
  // PATCH /admin/users/:id/enable — réactive un compte
  // -------------------------------------------------------------------------
  {
    method: "PATCH",
    path: "/admin/users/:id/enable",
    resolver: ({ params }) => {
      const user = _adminUsers.find((u) => String(u.id) === params.id)
      if (!user) throw new Error("Utilisateur introuvable.")
      user.isDisabled = false
      return user
    },
  },

  // -------------------------------------------------------------------------
  // PATCH /admin/users/:id/role — change le rôle d'un utilisateur
  // Body : { role: "User" | "Admin" | "SuperAdmin" }
  // -------------------------------------------------------------------------
  {
    method: "PATCH",
    path: "/admin/users/:id/role",
    resolver: ({ params, body }) => {
      const VALID_ROLES = ["User", "Admin", "SuperAdmin"]
      if (!VALID_ROLES.includes(body?.role)) {
        throw new Error(`Rôle invalide : ${body?.role}. Valeurs attendues : ${VALID_ROLES.join(", ")}.`)
      }
      const user = _adminUsers.find((u) => String(u.id) === params.id)
      if (!user) throw new Error("Utilisateur introuvable.")
      user.role = body.role
      return user
    },
  },
]