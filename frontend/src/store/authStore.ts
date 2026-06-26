import { create } from 'zustand';
import axios from 'axios';
import { setTokens, getRefreshToken } from '../utils/tokenStore';
import { setLogoutCallback } from '../utils/api';

const API_ROOT = import.meta.env.VITE_API_URL ?? "";
const USER_KEY = "user";
const USER_VERSION = 1;

const saveUser = (u: User) =>
  localStorage.setItem(USER_KEY, JSON.stringify({ v: USER_VERSION, data: u }));

const loadUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Migrate: old format was a plain object; new format is { v, data }
    return parsed?.v === USER_VERSION ? parsed.data : (parsed?.id ? parsed : null);
  } catch {
    return null;
  }
};

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
  user: loadUser(),

  // Login
  login: (t: string, rt: string, u: User) => {
    localStorage.setItem("token", t);
    localStorage.setItem("refreshToken", rt);
    saveUser(u);
    setTokens(t, rt);
    set({ token: t, refreshToken: rt, user: u });
  },

  // Logout
  logout: () => {
    const rt = getRefreshToken();
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
    const rt = getRefreshToken();
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
