import { createContext, useState, useEffect, useCallback } from "react";
import { loginUser, logout as logoutApi, refreshToken as refreshTokenApi } from "@/api/auth";

export const AuthContext = createContext();

function parseJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydratation au reload
  useEffect(() => {
    const savedToken = localStorage.getItem("cyna_token");
    const savedRefresh = localStorage.getItem("cyna_refresh_token");

    if (savedToken && savedRefresh) {
      const payload = parseJwt(savedToken);
    if (payload && payload.exp * 1000 > Date.now()) {
      setToken(savedToken);
      setUser({
        id: payload?.id,
        firstName: payload?.firstName,
        lastName: payload?.lastName,
        email: payload?.email,
        role: payload?.role
      });
    } else {
        // Token expiré → tente un refresh
        refreshTokenApi({ refreshToken: savedRefresh })
          .then((res) => {
            _applySession(res.token, res.refreshToken);
          })
          .catch(() => _clearSession());
      }
    }
    setLoading(false);
  }, []);

const _applySession = (newToken, newRefreshToken) => {
  const payload = parseJwt(newToken);
  setToken(newToken);

  setUser({
    id: payload?.id,
    firstName: payload?.firstName,
    lastName: payload?.lastName,
    email: payload?.email,
    role: payload?.role
  });

  localStorage.setItem("cyna_token", newToken);
  localStorage.setItem("cyna_refresh_token", newRefreshToken);
};

  const _clearSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("cyna_token");
    localStorage.removeItem("cyna_refresh_token");
  };

  const login = (newToken, newRefreshToken) => {
    _applySession(newToken, newRefreshToken);
  };

  const logout = useCallback(async () => {
    const savedRefresh = localStorage.getItem("cyna_refresh_token");
    if (savedRefresh) {
      await logoutApi({ refreshToken: savedRefresh }).catch(() => {});
    }
    _clearSession();
  }, []);

  const value = {
    user,
    token,
    loading,
    setLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}