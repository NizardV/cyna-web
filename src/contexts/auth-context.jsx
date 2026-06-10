import { createContext, useState, useEffect, useCallback } from "react";
import { apiClient } from "@/api/client"; // Import direct pour appeler /auth/me et /auth/logout

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Rehydratation au reload (F5) via le cookie sécurisé
  useEffect(() => {
    apiClient.get("/auth/me")
      .then((userData) => {
        // Si l'API renvoie les infos, le cookie est valide !
        setUser(userData);
      })
      .catch(() => {
        // Si l'appel échoue (401), c'est que le cookie est absent ou expiré
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 2. Appel après un Login réussi
  const login = () => {
    // Comme le contrôleur a déjà déposé les cookies, on récupère juste le profil
    setLoading(true);
    apiClient.get("/auth/me")
      .then((userData) => setUser(userData))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  };

  // 3. Déconnexion
  const logout = useCallback(async () => {
    try {
      // Appelle POST /auth/logout qui va détruire les cookies côté serveur
      await apiClient.post("/auth/logout", {});
    } catch (err) {
      console.warn("Erreur logout serveur", err);
    } finally {
      // On vide l'état front dans tous les cas et on redirige
      setUser(null);
      window.location.href = "/login";
    }
  }, []);

  const value = {
    user,
    setUser,
    loading,
    setLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}