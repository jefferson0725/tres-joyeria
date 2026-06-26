import { useState } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import useSetting from "@/hooks/useSetting";
import apiFetch from "../../../utils/api";
import { toast } from "@/hooks/use-toast";

const SOCIAL_OPTS = { autoExport: false };

const SocialSettings = () => {
  const widget = useSetting<boolean>("show_social_widget", false, SOCIAL_OPTS);
  const label = useSetting<string>("social_label", "SÍGUENOS", SOCIAL_OPTS);
  const facebook = useSetting<string>("social_facebook", "", SOCIAL_OPTS);
  const instagram = useSetting<string>("social_instagram", "", SOCIAL_OPTS);
  const youtube = useSetting<string>("social_youtube", "", SOCIAL_OPTS);
  const tiktok = useSetting<string>("social_tiktok", "", SOCIAL_OPTS);

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        widget.save(),
        label.save(),
        facebook.save(),
        instagram.save(),
        youtube.save(),
        tiktok.save(),
      ]);
      await apiFetch("/api/export", { method: "POST" }).catch(() => {});
      toast({ title: "Redes sociales guardadas" });
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const links: Array<{
    key: string;
    label: string;
    hook: ReturnType<typeof useSetting<string>>;
    placeholder: string;
  }> = [
    { key: "fb", label: "Facebook", hook: facebook, placeholder: "https://facebook.com/tresjoyeria" },
    { key: "ig", label: "Instagram", hook: instagram, placeholder: "https://instagram.com/tresjoyeria" },
    { key: "yt", label: "YouTube", hook: youtube, placeholder: "https://youtube.com/@tresjoyeria" },
    { key: "tt", label: "TikTok", hook: tiktok, placeholder: "https://tiktok.com/@tresjoyeria" },
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Redes Sociales</h2>
        <p className="text-gray-500 text-sm">Configura el widget flotante de redes sociales</p>
      </div>

      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
        <div>
          <p className="font-semibold text-gray-800">Mostrar widget</p>
          <p className="text-sm text-gray-500">Activa el botón flotante de redes en el catálogo</p>
        </div>
        <Switch checked={widget.value} onCheckedChange={widget.setValue} />
      </div>

      <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-2">
        <label htmlFor="social-label" className="text-sm font-semibold text-gray-700">Texto del widget</label>
        <Input
          id="social-label"
          value={label.value}
          onChange={(e) => label.setValue(e.target.value)}
          placeholder="SÍGUENOS"
          className="max-w-xs"
        />
        <p className="text-xs text-gray-400">Texto vertical que aparece debajo de los iconos</p>
      </div>

      <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
        <p className="text-sm font-semibold text-gray-700">Links de redes sociales</p>
        <p className="text-xs text-gray-400">Deja vacío para ocultar esa red</p>
        {links.map(({ key, label: name, hook, placeholder }) => (
          <div key={key} className="space-y-1">
            <label htmlFor={`social-${key}`} className="text-xs font-medium text-gray-600">{name}</label>
            <Input
              id={`social-${key}`}
              value={hook.value}
              onChange={(e) => hook.setValue(e.target.value)}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving} className="bg-foreground hover:bg-foreground/90 text-white">
        <Save className="w-4 h-4 mr-2" />
        {saving ? "Guardando..." : "Guardar configuración"}
      </Button>
    </motion.div>
  );
};

export default SocialSettings;
