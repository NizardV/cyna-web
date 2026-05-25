/**
 * @file api/orders.js
 * @description Appels API pour les commandes et abonnements utilisateur.
 * Fonctionne de manière identique en mode mock et en mode réel.
 */

import { apiClient } from "./client.js"

/**
 * Récupère toutes les commandes de l'utilisateur connecté.
 * @returns {Promise<object[]>}
 */
export const getOrders = () => apiClient.get("/orders")

/**
 * Récupère le détail d'une commande par son identifiant.
 * @param {string} id - Identifiant de la commande
 * @returns {Promise<object>}
 */
export const getOrder = (id) =>
  apiClient.get("/orders/:id", { params: { id } })

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

/**
 * Récupère le détail d'une commande du compte par son identifiant.
 * @param {string} id - Identifiant de la commande
 * @returns {Promise<object>}
 */
export const getAccountOrder = (id) =>
  apiClient.get("/account/orders/:id", { params: { id } })