import { apiClient } from "./client.js"

/**
 * Récupère les données dynamiques de la page d'accueil
 * (Carrousel, Texte fixe, Catégories, Top Produits)
 */
export const fetchHomeData = async () => {
  // apiClient va faire un appel GET vers l'URL '/home'
  // Si VITE_MOCK_API=true, l'intercepteur (MSW ou ton MockRegistry) va intercepter l'appel
  // et renvoyer tes fausses données à la place !
  const data = await apiClient.get("/home");
  
  return data;
};
