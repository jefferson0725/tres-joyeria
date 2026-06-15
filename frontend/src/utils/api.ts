import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getToken, getRefreshToken, setTokens, clearTokens } from "./tokenStore";

// If VITE_API_URL is /api or empty, use empty string (same-origin relative requests)
// Otherwise use it as baseURL
const VITE_API = import.meta.env.VITE_API_URL || "";
const API_ROOT = (VITE_API === "/api" || VITE_API === "") ? "" : VITE_API;

// Variable para almacenar callback de logout
let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: API_ROOT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet (skip for login — el 401 de credenciales inválidas no debe disparar el refresh)
    const isAuthEndpoint = originalRequest.url?.includes("/users/login") || originalRequest.url?.includes("/users/register");
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const rt = getRefreshToken();
        if (!rt) {
          // No refresh token, logout
          clearTokens();
          if (logoutCallback) logoutCallback();
          return Promise.reject(error);
        }

        // Refresh the token
        const res = await axios.post(`${API_ROOT}/api/users/refresh-token`, {
          refreshToken: rt,
        });

        const { accessToken, refreshToken } = res.data;
        setTokens(accessToken, refreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and logout
        clearTokens();
        if (logoutCallback) logoutCallback();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to maintain compatibility with existing fetch-style code
export async function apiFetch(
  url: string,
  options: {
    method?: string;
    body?: string;
    headers?: Record<string, string>;
  } = {}
): Promise<Response> {
  try {
    const config: AxiosRequestConfig = {
      url,
      method: (options.method || "GET") as any,
      data: options.body ? JSON.parse(options.body) : undefined,
      headers: options.headers,
    };

    const axiosResponse = await apiClient.request(config);

    // Create a Response-like object to maintain compatibility
    return {
      ok: axiosResponse.status >= 200 && axiosResponse.status < 300,
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
      json: async () => axiosResponse.data,
      text: async () => JSON.stringify(axiosResponse.data),
      headers: new Headers(axiosResponse.headers as any),
    } as Response;
  } catch (error: any) {
    // If axios error, create Response-like object with error info
    if (error.response) {
      return {
        ok: false,
        status: error.response.status,
        statusText: error.response.statusText,
        json: async () => error.response.data,
        text: async () => JSON.stringify(error.response.data),
        headers: new Headers(error.response.headers),
      } as Response;
    }
    // Network error or other
    throw error;
  }
}

export default apiFetch;
export { apiClient };
