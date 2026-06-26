import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { useDataJson } from "@/hooks/useDataJson";

interface Settings {
  show_prices: boolean;
  whatsapp_number: string;
  show_carousel: boolean;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  error: string | null;
}

const DEFAULT_SETTINGS: Settings = {
  show_prices: false,
  whatsapp_number: "573007571199",
  show_carousel: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data, isLoading, isError } = useDataJson();

  const settings = useMemo<Settings>(() => {
    if (!data?.settings) return DEFAULT_SETTINGS;
    const s = data.settings;
    return {
      show_prices: s.show_prices === "true" || s.show_prices === true,
      whatsapp_number: s.whatsapp_number || "573007571199",
      show_carousel: s.show_carousel === "true" || s.show_carousel === true,
    };
  }, [data]);

  const value = useMemo(
    () => ({ settings, loading: isLoading, error: isError ? "Failed to load settings" : null }),
    [settings, isLoading, isError]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
