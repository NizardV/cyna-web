import { apiClient } from "./client.js"

/**
 * Récupère les données dynamiques de la page d'accueil.
 *
 * @returns {Promise<{
 *   carouselSlides: object[],
 *   missionText: string,
 *   categories: object[],
 *   topProducts: object[]
 * }>}
 */
export const fetchHomeData = () => apiClient.get("/home");
