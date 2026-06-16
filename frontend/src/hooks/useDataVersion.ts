import { useEffect, useRef } from 'react';
import axios from 'axios';

export const useDataVersion = (intervalMs: number = 5000) => {
  const lastVersionRef = useRef<number | null>(null);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Cache-buster: evita que móvil Safari sirva respuesta cacheada
        const response = await axios.get(`/data.json?_v=${Date.now()}`, {
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
        });
        const currentVersion = response.data.version;

        if (lastVersionRef.current === null) {
          lastVersionRef.current = currentVersion;
        } else if (lastVersionRef.current !== currentVersion) {
          lastVersionRef.current = currentVersion;
          // Hard reload: fuerza al navegador a pedir recursos frescos al servidor
          window.location.reload();
        }
      } catch (err) {
        // silencioso — no interrumpir UX si falla la verificación
      }
    };

    const interval = setInterval(checkVersion, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);
};
