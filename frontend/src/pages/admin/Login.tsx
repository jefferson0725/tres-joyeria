import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogIn, Lock, User, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import apiFetch from "../../utils/api";
import heroBanner from "@/assets/logo.png";
import { motion, useAnimationControls } from "framer-motion";

interface LoginFormData {
  identifier: string;
  password: string;
}

const friendlyError = (msg: string): string => {
  const lower = msg.toLowerCase();
  if (lower.includes("invalid") || lower.includes("incorrect") || lower.includes("wrong") || lower.includes("credentials") || lower.includes("contraseña") || lower.includes("unauthorized"))
    return "Usuario o contraseña incorrectos";
  if (lower.includes("not found") || lower.includes("no existe") || lower.includes("user"))
    return "No existe ningún usuario con esas credenciales";
  if (lower.includes("network") || lower.includes("fetch"))
    return "No se pudo conectar al servidor. Verifica tu conexión.";
  if (lower.includes("timeout"))
    return "El servidor tardó demasiado en responder. Inténtalo de nuevo.";
  return msg || "Error al iniciar sesión";
};

const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ mode: "onSubmit" });

  const identifierField = register("identifier", { required: "Este campo es obligatorio" });
  const passwordField = register("password", { required: "Ingresa tu contraseña" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const cardControls = useAnimationControls();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Entrance animation on mount
  React.useEffect(() => {
    cardControls.start({ opacity: 1, scale: 1, transition: { duration: 0.6, delay: 0.3 } });
  }, [cardControls]);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      setLoading(true);
      const res = await apiFetch(`/api/users/login`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || responseData.message || "Login failed");

      login(responseData.token, responseData.refreshToken, responseData.user);
      setIsTransitioning(true);
      setTimeout(() => {
        navigate(responseData.user?.role === "admin" ? "/admin" : "/products/create");
      }, 800);
    } catch (err: any) {
      const msg = friendlyError(err.message || "");
      setError(msg);
      cardControls.start({
        x: [0, -10, 10, -8, 8, -4, 4, 0],
        transition: { duration: 0.5 },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-foreground"
      initial={{ opacity: 1 }}
      animate={{ opacity: isTransitioning ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/logo-horizontal.png"
            alt="TRES"
            className="h-16 mx-auto object-contain mb-4"
          />
          <motion.h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "Poppins, sans-serif" }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Panel de Administración
          </motion.h1>
          <motion.p
            className="text-gray-300 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Ingresa tus credenciales para continuar
          </motion.p>
        </div>

        {/* Login Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={cardControls}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Username/Email Input */}
            <div className="space-y-2">
              <label htmlFor="identifier" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Usuario o Correo
              </label>
              <Input
                id="identifier"
                type="text"
                placeholder="Ingresa tu usuario o email"
                disabled={loading}
                {...identifierField}
                onChange={(e) => { identifierField.onChange(e); setError(null); }}
                className={`h-12 pl-4 pr-4 text-base border-2 transition-colors ${errors.identifier ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-foreground"}`}
              />
              {errors.identifier && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.identifier.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  disabled={loading}
                  {...passwordField}
                  onChange={(e) => { passwordField.onChange(e); setError(null); }}
                  className={`h-12 pl-4 pr-10 text-base border-2 transition-colors ${errors.password ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-foreground"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />{errors.password.message}
                </p>
              )}
            </div>

            {/* Server Error Alert */}
            {error && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Iniciando sesión...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Iniciar Sesión
                </div>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-sm text-gray-300 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          © 2025 TRES Joyería - Todos los derechos reservados
        </motion.p>
      </div>
    </motion.div>
  );
};

export default Login;
