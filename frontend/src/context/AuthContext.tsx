import React, { createContext, useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { setTokens } from "../utils/tokenStore";
import { setLogoutCallback } from "../utils/api";

const API_ROOT = import.meta.env.VITE_API_URL ?? "";

type AuthContextType = {
  token: string | null;
  refreshToken: string | null;
  user: any | null;
  login: (token: string, refreshToken: string, user: any) => void;
  logout: () => void;
  refresh?: () => Promise<string>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem("refreshToken"));
  const [user, setUser] = useState<any | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  // Configurar el callback de logout automático cuando expira el token
  useEffect(() => {
    setLogoutCallback(() => {
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setTokens(null, null);
      window.location.href = '/login';
    });
  }, []);

  const login = useCallback((t: string, rt: string, u: any) => {
    setToken(t);
    setRefreshToken(rt);
    setUser(u);
    localStorage.setItem("token", t);
    localStorage.setItem("refreshToken", rt);
    localStorage.setItem("user", JSON.stringify(u));
    setTokens(t, rt);
  }, []);

  const logout = useCallback(() => {
    // call backend to revoke refresh token
    const rt = localStorage.getItem("refreshToken");
    if (rt) {
      axios.post(`${API_ROOT}/api/users/logout`, {
        refreshToken: rt,
      }).catch(() => {});
    }

    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setTokens(null, null);
    window.location.href = '/login';
  }, []);

  const refresh = useCallback(async () => {
    const rt = localStorage.getItem("refreshToken");
    if (!rt) throw new Error("No refresh token");

    const res = await axios.post(`${API_ROOT}/api/users/refresh-token`, {
      refreshToken: rt,
    });
    const data = res.data;
    setToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  }, []);

  const value = useMemo(
    () => ({ token, refreshToken, user, login, logout, refresh }),
    [token, refreshToken, user, login, logout, refresh]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
