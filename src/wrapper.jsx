import { useAuth } from "@/hooks/use-auth.js";
import { Navigate, Outlet } from "react-router-dom";
import Loading from "./pages/specials/loading";

/** Routes accessibles aux utilisateurs non-admin (null ou "Utilisateur") */
export function UserRoute() {
  const { loading, isAdminView } = useAuth();
  if (loading) return <Loading />;
  if (isAdminView) return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}

/** Routes accessibles uniquement aux admins */
export function AdminRoute() {
  const { isAdminView, loading } = useAuth();
  if (loading) return <Loading />;
  if (!isAdminView) return <Navigate to="/" replace />;
  return <Outlet />;
}