import { useCallback } from "react";
import axios from "axios";
import { getToken } from "../utils/tokenStore";

interface UploadOptions {
  onProgress?: (percent: number) => void;
}

/**
 * Hook que envuelve el POST a /api/uploads/frontend con auth + progress.
 * Devuelve el filename guardado por el backend (puede diferir del solicitado
 * porque sharp normaliza a .webp).
 */
export function useImageUpload() {
  const upload = useCallback(
    async (file: File, filename: string, options: UploadOptions = {}): Promise<string> => {
      const API_ROOT = import.meta.env.VITE_API_URL ?? "";
      const token = getToken();

      const form = new FormData();
      form.append("filename", filename);
      form.append("image", file);

      const res = await axios.post(`${API_ROOT}/api/uploads/frontend`, form, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        onUploadProgress: options.onProgress
          ? (e) => {
              const total = e.total || 100;
              const pct = Math.round((e.loaded * 100) / total);
              options.onProgress!(pct);
            }
          : undefined,
      });

      return res.data.filename || filename;
    },
    [],
  );

  return { upload };
}

export default useImageUpload;
