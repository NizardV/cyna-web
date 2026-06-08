/**
 * @file api/auth.js
 * @description Appels API pour l'authentification.
 */

import { apiClient } from "./client.js"

export const loginUser = ({ email, password }) =>
  apiClient.post("/auth/login", { email, password })

export const registerUser = ({ fullName, email, password }) =>
  apiClient.post("/auth/register", { fullName, email, password })

/**
 * Déconnecte l'utilisateur courant (supprime le token local et appelle le backend).
 * @returns {Promise<null>}
 */
export const logout = () => apiClient.post("/auth/logout", null)
