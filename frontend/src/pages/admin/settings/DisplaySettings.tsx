import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import SettingRow from "@/components/admin/SettingRow";
import useSetting from "@/hooks/useSetting";

const DisplaySettings = () => {
  const prices = useSetting<boolean>("show_prices", true);
  const whatsapp = useSetting<string>("whatsapp_number", "");

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h2
          className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Configuración General
        </h2>
        <p className="text-gray-600">Configura opciones del catálogo y contacto</p>
      </div>

      <SettingRow
        title="Mostrar Precios en Catálogo"
        onSave={() => prices.save()}
        loading={prices.loading}
        success={prices.success}
        error={prices.error}
        saveLabel="Guardar Configuración"
      >
        <div className="flex items-center justify-between">
          <label htmlFor="show-prices" className="block text-sm font-semibold text-gray-700">
            Visibilidad de precios
          </label>
          <Switch
            id="show-prices"
            checked={prices.value}
            onCheckedChange={prices.setValue}
            className="data-[state=checked]:bg-foreground"
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {prices.value
            ? "Los precios son visibles en el catálogo"
            : "Los precios están ocultos en el catálogo"}
        </p>
      </SettingRow>

      <SettingRow
        title="Configuración de WhatsApp"
        description="Formato: código de país + número (ejemplo: 573001234567 para Colombia)"
        onSave={() => whatsapp.save()}
        loading={whatsapp.loading}
        success={whatsapp.success}
        error={whatsapp.error}
        saveLabel="Guardar Número"
      >
        <label htmlFor="whatsapp-number" className="block text-sm font-semibold text-gray-700 mb-2">
          Número de WhatsApp (con código de país)
        </label>
        <Input
          id="whatsapp-number"
          type="text"
          placeholder="573001234567"
          value={whatsapp.value}
          onChange={(e) => whatsapp.setValue(e.target.value)}
          className="h-12 text-base border-2"
        />
      </SettingRow>
    </motion.div>
  );
};

export default DisplaySettings;
