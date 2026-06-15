import { useCallback, useEffect, useState } from "react";
import apiFetch from "../utils/api";

interface UseSettingOptions {
  /** Trigger /api/export after a successful save. Defaults to true. */
  autoExport?: boolean;
}

interface UseSettingResult<T> {
  value: T;
  setValue: (v: T) => void;
  save: (override?: T) => Promise<void>;
  loading: boolean;
  success: boolean;
  error: string | null;
  loaded: boolean;
}

const parseValue = <T,>(raw: unknown, fallback: T): T => {
  if (raw === null || raw === undefined) return fallback;
  if (typeof fallback === "boolean") {
    return (raw === "true" || raw === true) as unknown as T;
  }
  return raw as T;
};

const serializeValue = (v: unknown): string => {
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v ?? "");
};

export function useSetting<T>(
  key: string,
  defaultValue: T,
  options: UseSettingOptions = {},
): UseSettingResult<T> {
  const { autoExport = true } = options;
  const [value, setValue] = useState<T>(defaultValue);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiFetch(`/api/settings/${key}`);
        if (!active || !res.ok) return;
        const data = await res.json();
        setValue(parseValue(data.value, defaultValue));
      } catch (err) {
        console.error(`Error loading setting "${key}":`, err);
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const save = useCallback(
    async (override?: T) => {
      const v = override !== undefined ? override : value;
      setLoading(true);
      setSuccess(false);
      setError(null);
      try {
        const res = await apiFetch(`/api/settings/${key}`, {
          method: "PUT",
          body: JSON.stringify({ value: serializeValue(v) }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al guardar");
        }
        if (autoExport) {
          await apiFetch("/api/export", { method: "POST" }).catch(() => {});
        }
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err: any) {
        setError(err.message || "Error al guardar");
        setTimeout(() => setError(null), 5000);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [key, value, autoExport],
  );

  return { value, setValue, save, loading, success, error, loaded };
}

export default useSetting;
