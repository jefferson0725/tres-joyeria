import { ReactNode } from "react";
import { CheckCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SettingRowProps {
  title: string;
  description?: string;
  children: ReactNode;
  onSave: () => void;
  loading?: boolean;
  success?: boolean;
  error?: string | null;
  saveLabel?: string;
  successMessage?: string;
}

const SettingRow = ({
  title,
  description,
  children,
  onSave,
  loading = false,
  success = false,
  error = null,
  saveLabel = "Guardar",
  successMessage = "¡Configuración guardada exitosamente!",
}: SettingRowProps) => (
  <div className="border-t-2 border-gray-200 pt-6 first:border-t-0 first:pt-0">
    <h3
      className="text-xl font-bold text-gray-800 mb-4"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {title}
    </h3>

    <div className="bg-white p-6 rounded-xl border-2 border-gray-200 mb-4">
      {children}
      {description && <p className="text-sm text-gray-600 mt-2">{description}</p>}
    </div>

    {success && (
      <Alert className="bg-green-50 border-green-200 animate-in slide-in-from-top-2 mb-4">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
      </Alert>
    )}

    {error && (
      <Alert variant="destructive" className="animate-in slide-in-from-top-2 mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}

    <Button
      onClick={onSave}
      disabled={loading}
      className="w-full sm:w-auto h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Guardando...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Save className="w-5 h-5" />
          {saveLabel}
        </div>
      )}
    </Button>
  </div>
);

export default SettingRow;
