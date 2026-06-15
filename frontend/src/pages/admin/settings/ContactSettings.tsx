import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import SettingRow from "@/components/admin/SettingRow";
import useSetting from "@/hooks/useSetting";

const ContactSettings = () => {
  const phone = useSetting<string>("contact_phone", "");
  const email = useSetting<string>("contact_email", "");
  const address = useSetting<string>("contact_address", "");
  const showAddress = useSetting<boolean>("show_address", true);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
    >
      <SettingRow
        title="Teléfono de Contacto (Footer)"
        description="Este número se mostrará en el footer del sitio web"
        onSave={() => phone.save()}
        loading={phone.loading}
        success={phone.success}
        error={phone.error}
        saveLabel="Guardar Teléfono"
      >
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Teléfono de Contacto
        </label>
        <Input
          type="text"
          placeholder="+57 300 123 4567"
          value={phone.value}
          onChange={(e) => phone.setValue(e.target.value)}
          className="h-12 text-base border-2"
        />
      </SettingRow>

      <SettingRow
        title="Email de Contacto (Footer)"
        description="Este email se mostrará en el footer del sitio web"
        onSave={() => email.save()}
        loading={email.loading}
        success={email.success}
        error={email.error}
        saveLabel="Guardar Email"
      >
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Email de Contacto
        </label>
        <Input
          type="email"
          placeholder="contacto@ejemplo.com"
          value={email.value}
          onChange={(e) => email.setValue(e.target.value)}
          className="h-12 text-base border-2"
        />
      </SettingRow>

      <SettingRow
        title="Mostrar Dirección en Footer"
        onSave={() => showAddress.save()}
        loading={showAddress.loading}
        success={showAddress.success}
        error={showAddress.error}
        saveLabel="Guardar Configuración"
      >
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700">
            Visibilidad de dirección
          </label>
          <Switch
            checked={showAddress.value}
            onCheckedChange={showAddress.setValue}
            className="data-[state=checked]:bg-foreground"
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {showAddress.value
            ? "La dirección es visible en el footer"
            : "La dirección está oculta en el footer"}
        </p>
      </SettingRow>

      <SettingRow
        title="Dirección de la Tienda (Footer)"
        description="Esta dirección se mostrará en el footer del sitio web (si está habilitada)"
        onSave={() => address.save()}
        loading={address.loading}
        success={address.success}
        error={address.error}
        saveLabel="Guardar Dirección"
      >
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Dirección de la Tienda
        </label>
        <Input
          type="text"
          placeholder="Calle 123 #45-67, Ciudad, País"
          value={address.value}
          onChange={(e) => address.setValue(e.target.value)}
          className="h-12 text-base border-2"
        />
      </SettingRow>
    </motion.div>
  );
};

export default ContactSettings;
