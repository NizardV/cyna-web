/**
 * @file api/orders.js
 * @description Appels API pour les commandes et abonnements utilisateur.
 * Fonctionne de manière identique en mode mock et en mode réel.
 */

import { apiClient } from "./client.js"

/**
 * Récupère tous les abonnements actifs de l'utilisateur.
 * @returns {Promise<object[]>}
 */
export const getSubscriptions = () => apiClient.get("/subscriptions")

/**
 * Récupère l'historique des commandes du compte utilisateur (vue enrichie).
 * @returns {Promise<object[]>}
 */
export const getAccountOrders = () => apiClient.get("/account/orders")