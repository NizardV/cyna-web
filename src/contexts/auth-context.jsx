import { createContext, useState, useEffect, useCallback } from "react";
import { apiClient } from "@/api/client";

// Rôles reconnus comme admin (à adapter si le backend évolue)
const ADMIN_ROLE = ["Administrateur", "Super Administrateur"];

/**
 * Contexte React d'authentification.
 * Consommer via le hook `useAuth` — ne pas utiliser `useContext(AuthContext)` directement.
 */
export const AuthContext = createContext();

/**
 * Fournisseur du contexte d'authentification.
 * Rehydrate la session au montage via GET /auth/me et expose les actions login/logout.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Fonction partagée — évite la duplication entre useEffect et login()
  const fetchMe = useCallback(() => {
    setLoading(true);
    return apiClient.get("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Rehydratation au démarrage
  useEffect(() => { fetchMe(); }, [fetchMe]);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } catch (err) {
      console.warn("Erreur logout serveur", err);
    } finally {
      setUser(null);
      window.location.href = "/";
    }
  }, []);

  const isAdmin = ADMIN_ROLE.includes(user?.role ?? "");

  return (
    <AuthContext.Provider value={{
      user, setUser, loading, setLoading,
      login: fetchMe,          // login() = juste appeler fetchMe()
      logout,
      isAuthenticated: !!user,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}