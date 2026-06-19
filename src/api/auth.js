/**
 * @file api/auth.js
 * @description Appels API d'authentification : connexion, inscription, refresh et déconnexion.
 */

import { apiClient } from "./client.js";

/**
 * Authentifie un utilisateur et ouvre une session (cookie httpOnly).
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<object>} UserDto
 */
export const loginUser = ({ email, password }) =>
  apiClient.post("/auth/login", { email, password });

/**
 * Crée un nouveau compte utilisateur.
 * @param {{ firstName: string, lastName: string, email: string, password: string }} dto
 * @returns {Promise<object>} UserDto
 */
export const registerUser = ({ firstName, lastName, email, password }) =>
  apiClient.post("/auth/register", { firstName, lastName, email, password });

/**
 * Renouvelle le token d'accès à partir du refresh token.
 * @param {{ refreshToken: string }} dto
 * @returns {Promise<object>}
 */
export const refreshToken = ({ refreshToken }) =>
  apiClient.post("/auth/refresh", { refreshToken });

/**
 * Invalide la session côté serveur.
 * @param {{ refreshToken: string }} dto
 * @returns {Promise<null>}
 */
export const logout = ({ refreshToken }) =>
  apiClient.post("/auth/logout", { refreshToken });