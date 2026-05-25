/**
 * @file api/user.js
 * @description Appels API pour le profil utilisateur, la sécurité et les abonnements.
 * Fonctionne de manière identique en mode mock et en mode réel.
 */

import { apiClient } from "./client.js"

/**
 * Récupère le profil de l'utilisateur connecté.
 * @returns {Promise<object>}
 */
export const getMe = () => apiClient.get("/auth/me")

/**
 * Met à jour les informations personnelles de l'utilisateur.
 * @param {{ name: string, email: string }} dto - Données à mettre à jour
 * @returns {Promise<object>}
 */
export const updateProfile = (dto) => apiClient.put("/user/profile", dto)

/**
 * Met à jour le mot de passe de l'utilisateur.
 * @param {{ currentPassword: string, newPassword: string }} dto - Données de changement de mot de passe
 * @returns {Promise<{ message: string }>}
 */
export const updatePassword = (dto) => apiClient.put("/user/password", dto)