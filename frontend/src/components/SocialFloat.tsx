import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

interface SocialSettings {
  show: boolean;
  label: string;
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
}

const icons: Record<string, JSX.Element> = {
  facebook: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.77 1.52V6.75a4.85 4.85 0 01-1-.06z" />
    </svg>
  ),
};

const SocialFloat = () => {
  const [settings, setSettings] = useState<SocialSettings | null>(null);

  useEffect(() => {
    axios.get("/data.json").then((res) => {
      const s = res.data.settings || {};
      if (s.show_social_widget !== "true" && s.show_social_widget !== true) return;
      setSettings({
        show: true,
        label: s.social_label || "",
        facebook: s.social_facebook || "",
        instagram: s.social_instagram || "",
        youtube: s.social_youtube || "",
        tiktok: s.social_tiktok || "",
      });
    }).catch(() => {});
  }, []);

  if (!settings?.show) return null;

  const networks = [
    { key: "facebook", url: settings.facebook },
    { key: "instagram", url: settings.instagram },
    { key: "youtube", url: settings.youtube },
    { key: "tiktok", url: settings.tiktok },
  ].filter((n) => n.url);

  if (!networks.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, duration: 0.4 }}
      className="fixed left-0 top-[65%] -translate-y-1/2 z-40 flex flex-col items-center gap-0 bg-white shadow-xl rounded-r-3xl overflow-hidden"
      style={{ boxShadow: "4px 0 24px rgba(0,0,0,0.12)" }}
    >
      {/* Social icons */}
      <div className="flex flex-col items-center gap-1 py-4 px-3">
        {networks.map(({ key, url }) => (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-foreground/70 hover:text-foreground transition-colors hover:scale-110 active:scale-95 transform"
            aria-label={key}
          >
            {icons[key]}
          </a>
        ))}
      </div>

      {/* Label vertical — solo si hay texto */}
      {settings.label && (
        <>
          <div className="w-full h-px bg-gray-100" />
          <div className="py-4 px-3 flex items-center justify-center">
            <span
              className="text-[9px] uppercase tracking-[0.2em] text-foreground/40 font-medium"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {settings.label}
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default SocialFloat;
