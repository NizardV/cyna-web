import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "@/contexts/auth-context";

const ROLE_OVERRIDE = import.meta.env.VITE_OVERRIDE_ROLE === "true";

/**
 * Hook d'accès au contexte d'authentification.
 * Expose toutes les valeurs de AuthContext plus `isAdminView`.
 *
 * Si VITE_OVERRIDE_ROLE=true, on détermine le rôle visuel depuis l'URL
 * (/admin/* → vue admin, tout le reste → vue user) — utile en développement.
 *
 * @returns {{
 *   user: object|null,
 *   setUser: Function,
 *   loading: boolean,
 *   setLoading: Function,
 *   login: Function,
 *   logout: Function,
 *   isAuthenticated: boolean,
 *   isAdmin: boolean,
 *   isAdminView: boolean
 * }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");

  const { pathname } = useLocation();

  // Si VITE_OVERRIDE_ROLE=true, on détermine le rôle visuel depuis l'URL
  // /admin/* → vue admin, tout le reste → vue user
  const isAdminView = ROLE_OVERRIDE
    ? pathname.startsWith("/admin")
    : context.isAdmin;

  return { ...context, isAdminView };
}