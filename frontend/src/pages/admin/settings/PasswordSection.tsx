import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import apiFetch from "../../../utils/api";

const PasswordSection = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 5000);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      showError("Todos los campos son obligatorios");
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("Las contraseñas nuevas no coinciden");
      setLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      showError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/api/users/change-password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al cambiar contraseña");
      }
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      showError(err.message || "Error al cambiar contraseña");
    } finally {
      setLoading(false);
    }
  };

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
          Cambiar Contraseña
        </h2>
        <p className="text-gray-600">Actualiza la contraseña de tu cuenta de administrador</p>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200 animate-in slide-in-from-top-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ¡Contraseña actualizada exitosamente!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white p-6 rounded-xl border-2 border-gray-200 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Contraseña Actual
          </label>
          <Input
            type="password"
            placeholder="Ingresa tu contraseña actual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="h-12 text-base border-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nueva Contraseña
          </label>
          <Input
            type="password"
            placeholder="Ingresa tu nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-12 text-base border-2"
          />
          <p className="text-sm text-gray-600 mt-1">Mínimo 6 caracteres</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirmar Nueva Contraseña
          </label>
          <Input
            type="password"
            placeholder="Confirma tu nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12 text-base border-2"
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full sm:w-auto h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Cambiando...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Cambiar Contraseña
          </div>
        )}
      </Button>
    </motion.div>
  );
};

export default PasswordSection;
