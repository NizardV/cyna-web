/**
 * @file api/admin-users.js
 * @description Client API pour l'administration des utilisateurs.
 *
 * Routes backend (Admin / SuperAdmin uniquement) :
 *   GET   /admin/users            → AdminUserDto[]  (tous sauf l'admin connecté)
 *   PATCH /admin/users/:id/disable
 *   PATCH /admin/users/:id/enable
 *   PATCH /admin/users/:id/role    body: { role: "User" | "Admin" | "SuperAdmin" }
 *
 * AdminUserDto :
 *   { id, email, firstName, lastName, role, isEmailVerified,
 *     isDisabled, hasTwoFactor, createdAt }
 */

import { apiClient } from "./client.js"

/**
 * Récupère tous les utilisateurs sauf l'administrateur connecté.
 * @returns {Promise<object[]>}
 */
export const getAdminUsers = () => apiClient.get("/admin/users")

/**
 * Désactive le compte d'un utilisateur.
 * @param {number|string} id
 */
export const disableUser = (id) => apiClient.patch(`/admin/users/${id}/disable`)

/**
 * Réactive le compte d'un utilisateur.
 * @param {number|string} id
 */
export const enableUser = (id) => apiClient.patch(`/admin/users/${id}/enable`)

/**
 * Change le rôle d'un utilisateur.
 * @param {number|string} id
 * @param {"User"|"Admin"|"SuperAdmin"} role
 */
export const changeUserRole = (id, role) =>
  apiClient.patch(`/admin/users/${id}/role`, { params: { id }, body: { role } })

/**
 * Rôles disponibles, dans l'ordre croissant de privilège.
 * @type {{ value: "User"|"Admin"|"SuperAdmin", label: string }[]}
 */
export const USER_ROLES = [
  { value: "User",       label: "Utilisateur" },
  { value: "Admin",       label: "Administrateur" },
  { value: "SuperAdmin",  label: "Super administrateur" },
]