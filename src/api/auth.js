/**
 * @file api/auth.js
 * @description Appels API pour l'authentification.
 */

import { apiClient } from "./client.js"

/**
 * Déconnecte l'utilisateur courant (supprime le token local et appelle le backend).
 * @returns {Promise<null>}
 */
export const logout = () => apiClient.post("/auth/logout", null)