import { create } from 'zustand';
import axios from 'axios';
import { setTokens } from '../utils/tokenStore';
import { setLogoutCallback } from '../utils/api';

const API_ROOT = import.meta.env.VITE_API_URL ?? "";

interface User {
  id: number;
  email: string;
  role: string;
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  refresh: () => Promise<string>;
  initLogoutCallback: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Estado inicial desde localStorage
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  user: (() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  })(),

  // Login
  login: (t: string, rt: string, u: User) => {
    localStorage.setItem("token", t);
    localStorage.setItem("refreshToken", rt);
    localStorage.setItem("user", JSON.stringify(u));
    setTokens(t, rt);
    set({ token: t, refreshToken: rt, user: u });
  },

  // Logout
  logout: () => {
    const rt = localStorage.getItem("refreshToken");
    if (rt) {
      axios.post(`${API_ROOT}/api/users/logout`, {
        refreshToken: rt,
      }).catch(() => {});
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setTokens(null, null);
    set({ token: null, refreshToken: null, user: null });
    window.location.href = '/login';
  },

  // Refresh token
  refresh: async () => {
    const rt = localStorage.getItem("refreshToken");
    if (!rt) throw new Error("No refresh token");

    const res = await axios.post(`${API_ROOT}/api/users/refresh-token`, {
      refreshToken: rt,
    });
    const data = res.data;
    
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setTokens(data.accessToken, data.refreshToken);
    set({ token: data.accessToken, refreshToken: data.refreshToken });
    
    return data.accessToken;
  },

  // Inicializar callback de logout automático
  initLogoutCallback: () => {
    setLogoutCallback(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setTokens(null, null);
      set({ token: null, refreshToken: null, user: null });
      window.location.href = '/login';
    });
  },
}));
