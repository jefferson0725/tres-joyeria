import { useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * Hook que periódicamente revisa si hay una nueva versión del data.json
 * Si la versión cambió, recarga la página automáticamente
 */
export const useDataVersion = (intervalMs: number = 5000) => {
  const lastVersionRef = useRef<number | null>(null);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await axios.get('/data.json');
        const currentVersion = response.data.version;

        if (lastVersionRef.current === null) {
          // Primera vez, solo guardar la versión
          lastVersionRef.current = currentVersion;
        } else if (lastVersionRef.current !== currentVersion) {
          // La versión cambió, recargar la página
          console.log(`[DataVersion] Update detected! Old: ${lastVersionRef.current}, New: ${currentVersion}`);
          lastVersionRef.current = currentVersion;
          // Recargar la página sin limpiar caché (soft reload)
          window.location.href = window.location.href;
        }
      } catch (err) {
        console.error('[DataVersion] Error checking version:', err);
      }
    };

    // Revisar cada intervalMs milisegundos
    const interval = setInterval(checkVersion, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);
};
