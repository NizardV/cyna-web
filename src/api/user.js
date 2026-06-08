/**
 * @file api/user.js
 * @description Appels API pour le profil utilisateur et la sécurité.
 * Routes v1 : GET /user/profile, PUT /user/profile, PUT /user/password
 *
 * UserProfileDto    : { id, email, firstName, lastName, role, isEmailVerified, createdAt }
 * UpdateProfileDto  : { firstName, lastName, email }
 * UpdatePasswordDto : { currentPassword, newPassword }
 */

import { apiClient } from "./client.js"

/**
 * Récupère le profil de l'utilisateur connecté.
 * @returns {Promise<object>} UserProfileDto
 */
export const getMe = () => apiClient.get("/user/profile")

/**
 * Met à jour les informations personnelles de l'utilisateur.
 * @param {{ firstName: string, lastName: string, email: string }} dto
 * @returns {Promise<object>} UserProfileDto
 */
export const updateProfile = (dto) => apiClient.put("/user/profile", dto)

/**
 * Met à jour le mot de passe de l'utilisateur.
 * @param {{ currentPassword: string, newPassword: string }} dto
 * @returns {Promise<void>}
 */
export const updatePassword = (dto) => apiClient.put("/user/password", dto)

/**
 * Récupère tous les abonnements actifs de l'utilisateur.
 * Retourne SubscriptionDto[] : { id, status, productName, planName,
 *   currentPeriodStart, currentPeriodEnd, autoRenew }
 * @returns {Promise<object[]>}
 */
export const getSubscriptions = () => apiClient.get("/user/subscriptions")

/**
 * Récupère l'historique des commandes du compte utilisateur.
 * Retourne OrderSummaryDto[] : { id, status, totalAmount, createdAt,
 *   invoiceUrl, items[] }
 * @returns {Promise<object[]>}
 */
export const getAccountOrders = () => apiClient.get("/user/orders")