import { useAuth } from "@/hooks/use-auth.js";
import { Navigate, Outlet } from "react-router-dom";
import Loading from "./pages/specials/loading";

/**
 * Garde de route pour les utilisateurs non-admin.
 * Redirige les admins vers le tableau de bord.
 * @returns {React.ReactElement}
 */
export function UserRoute() {
  const { loading, isAdminView } = useAuth();
  if (loading) return <Loading />;
  if (isAdminView) return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}

/**
 * Garde de route pour les administrateurs uniquement.
 * Redirige les non-admins vers la page d'accueil.
 * @returns {React.ReactElement}
 */
export function AdminRoute() {
  const { isAdminView, loading } = useAuth();
  if (loading) return <Loading />;
  if (!isAdminView) return <Navigate to="/" replace />;
  return <Outlet />;
}

/**
 * Garde de route pour les utilisateurs connectés non-admin.
 * Redirige les invités vers la page de connexion.
 * Redirige les admins vers le tableau de bord.
 * @returns {React.ReactElement}
 */
export function AuthRoute() {
  const { loading, user } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/**
 * Garde de route pour les utilisateurs authentifiés.
 * Redirige les utilisateurs (User) non authentifiés vers la page de connexion.
 * @returns {React.ReactElement}
 */
export function UserAuthRoute() {
  const { loading, isAuthenticated, isAdminView } = useAuth();
  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdminView) return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}