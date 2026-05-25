/**
 * @file api/auth.js
 * @description Appels API pour l'authentification.
 * La connexion retourne volontairement une erreur (sera implémentée par un autre membre de l'équipe).
 */

import { apiClient } from "./client.js"

/**
 * Connecte un utilisateur avec ses identifiants.
 * NOTE : Retourne intentionnellement une erreur — implémentation déléguée à l'équipe login.
 * @param {{ email: string, password: string }} dto
 * @returns {Promise<{ token: string, user: object }>}
 */
export const login = (dto) => apiClient.post("/auth/login", dto)

/**
 * Déconnecte l'utilisateur courant (supprime le token local et appelle le backend).
 * @returns {Promise<null>}
 */
export const logout = () => apiClient.post("/auth/logout", null)

/**
 * Inscrit un nouvel utilisateur.
 * NOTE : Retourne intentionnellement une erreur — implémentation déléguée à l'équipe login.
 * @param {{ name: string, email: string, password: string }} dto
 * @returns {Promise<{ message: string }>}
 */
export const register = (dto) => apiClient.post("/auth/register", dto)