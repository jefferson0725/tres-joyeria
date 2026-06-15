import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";

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

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>({
    show_prices: false, // Default to false for safety
    whatsapp_number: "573007571199",
    show_carousel: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to load from /data.json first (public data)
        try {
          const res = await axios.get("/data.json");
          const data = res.data;

          // Extract settings with proper type conversion
          const showPrices =
            data.settings?.show_prices === "true" ||
            data.settings?.show_prices === true;

          const showCarousel =
            data.settings?.show_carousel === "true" ||
            data.settings?.show_carousel === true;

          const whatsappNumber =
            data.settings?.whatsapp_number || "573007571199";

          setSettings({
            show_prices: showPrices,
            whatsapp_number: whatsappNumber,
            show_carousel: showCarousel,
          });
        } catch (err) {
          console.warn("data.json not found, using default settings");
          // Keep default settings if data.json doesn't exist
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        setError("Failed to load settings");
        // Keep default settings on error
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, error }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
