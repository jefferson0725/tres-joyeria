import { useState, useEffect } from "react";

const STORAGE_KEY = "cookie_consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== "accepted" && stored !== "rejected") {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (private mode, etc.) — show banner anyway
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // fail silently
    }
    setVisible(false);
  };

  const handleReject = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "rejected");
    } catch {
      // fail silently
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[120] bg-foreground text-white border-t border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <p className="text-sm text-white/80 flex-1 text-center sm:text-left">
          Usamos cookies y almacenamiento local para mejorar tu experiencia y
          recordar los productos que te interesan. ¿Aceptas su uso?
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleReject}
            className="min-h-[40px] px-4 py-2 text-sm rounded-md border border-white/30 text-white hover:bg-white/10 transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={handleAccept}
            className="min-h-[40px] px-4 py-2 text-sm rounded-md bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
