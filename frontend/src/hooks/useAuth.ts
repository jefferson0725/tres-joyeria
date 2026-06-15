import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * Hook de compatibilidad con el antiguo AuthContext
 * Permite usar Zustand sin cambiar todos los componentes
 */
export const useAuth = () => {
  const { token, refreshToken, user, login, logout, refresh, initLogoutCallback } = useAuthStore();

  // Inicializar callback de logout al montar
  useEffect(() => {
    initLogoutCallback();
  }, [initLogoutCallback]);

  return { token, refreshToken, user, login, logout, refresh };
};
