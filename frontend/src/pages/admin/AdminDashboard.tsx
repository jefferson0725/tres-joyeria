import React, { useState, useEffect } from "react";
import {
  Download,
  CheckCircle,
  Save,
  Package,
  FolderOpen,
  Settings,
  LogOut,
  Edit,
  PlusCircle,
  Lock,
  X,
  Image,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import CategoryCreate from "./CategoryCreate";
import CategoryEdit from "./CategoryEdit";
import ProductCreate from "./ProductCreate";
import ProductEdit from "./ProductEdit";
import CarouselManagement from "./CarouselManagement";
import { apiFetch } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import heroBanner from "@/assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState(4); // Iniciar en configuración
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [whatsappSuccess, setWhatsappSuccess] = useState(false);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);

  const [showPrices, setShowPrices] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [pricesSuccess, setPricesSuccess] = useState(false);
  const [pricesError, setPricesError] = useState<string | null>(null);

  const [contactPhone, setContactPhone] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneSuccess, setPhoneSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [contactEmail, setContactEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [contactAddress, setContactAddress] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const [showAddress, setShowAddress] = useState(true);
  const [showAddressLoading, setShowAddressLoading] = useState(false);
  const [showAddressSuccess, setShowAddressSuccess] = useState(false);
  const [showAddressError, setShowAddressError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Redes sociales
  const [showSocialWidget, setShowSocialWidget] = useState(false);
  const [socialLabel, setSocialLabel] = useState("SÍGUENOS");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialYoutube, setSocialYoutube] = useState("");
  const [socialTiktok, setSocialTiktok] = useState("");
  const [socialLoading, setSocialLoading] = useState(false);

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Logout cuando el usuario abandona el panel
  useEffect(() => {
    return () => {
      // Este efecto de limpieza se ejecuta cuando el componente se desmonta
      logout();
    };
  }, [logout]);

  // Load WhatsApp number on mount
  useEffect(() => {
    const loadWhatsApp = async () => {
      try {
        const res = await apiFetch("/api/settings/whatsapp_number");
        if (res.ok) {
          const data = await res.json();
          setWhatsappNumber(data.value || "");
        }
      } catch (err) {
        console.error("Error loading WhatsApp number:", err);
      }
    };
    loadWhatsApp();
  }, []);

  // Load show prices setting on mount
  useEffect(() => {
    const loadShowPrices = async () => {
      try {
        const res = await apiFetch("/api/settings/show_prices");
        if (res.ok) {
          const data = await res.json();
          setShowPrices(data.value === "true" || data.value === true);
        }
      } catch (err) {
        console.error("Error loading show prices setting:", err);
      }
    };
    loadShowPrices();
  }, []);

  // Load contact phone on mount
  useEffect(() => {
    const loadContactPhone = async () => {
      try {
        const res = await apiFetch("/api/settings/contact_phone");
        if (res.ok) {
          const data = await res.json();
          setContactPhone(data.value || "");
        }
      } catch (err) {
        console.error("Error loading contact phone:", err);
      }
    };
    loadContactPhone();
  }, []);

  // Load contact email on mount
  useEffect(() => {
    const loadContactEmail = async () => {
      try {
        const res = await apiFetch("/api/settings/contact_email");
        if (res.ok) {
          const data = await res.json();
          setContactEmail(data.value || "");
        }
      } catch (err) {
        console.error("Error loading contact email:", err);
      }
    };
    loadContactEmail();
  }, []);

  // Load contact address on mount
  useEffect(() => {
    const loadContactAddress = async () => {
      try {
        const res = await apiFetch("/api/settings/contact_address");
        if (res.ok) {
          const data = await res.json();
          setContactAddress(data.value || "");
        }
      } catch (err) {
        console.error("Error loading contact address:", err);
      }
    };
    loadContactAddress();
  }, []);

  // Load show address setting on mount
  useEffect(() => {
    const loadShowAddress = async () => {
      try {
        const res = await apiFetch("/api/settings/show_address");
        if (res.ok) {
          const data = await res.json();
          setShowAddress(data.value === "true" || data.value === true);
        }
      } catch (err) {
        console.error("Error loading show address setting:", err);
      }
    };
    loadShowAddress();
  }, []);

  // Load social settings on mount
  useEffect(() => {
    const keys = ["show_social_widget", "social_label", "social_facebook", "social_instagram", "social_youtube", "social_tiktok"];
    Promise.all(keys.map((k) => apiFetch(`/api/settings/${k}`).then((r) => r.ok ? r.json() : { value: "" }))).then(
      ([widget, label, fb, ig, yt, tt]) => {
        setShowSocialWidget(widget.value === "true" || widget.value === true);
        setSocialLabel(label.value || "SÍGUENOS");
        setSocialFacebook(fb.value || "");
        setSocialInstagram(ig.value || "");
        setSocialYoutube(yt.value || "");
        setSocialTiktok(tt.value || "");
      }
    ).catch(() => {});
  }, []);

  const handleSaveSocial = async () => {
    setSocialLoading(true);
    try {
      await Promise.all([
        apiFetch("/api/settings/show_social_widget", { method: "PUT", body: JSON.stringify({ value: showSocialWidget ? "true" : "false" }) }),
        apiFetch("/api/settings/social_label", { method: "PUT", body: JSON.stringify({ value: socialLabel }) }),
        apiFetch("/api/settings/social_facebook", { method: "PUT", body: JSON.stringify({ value: socialFacebook }) }),
        apiFetch("/api/settings/social_instagram", { method: "PUT", body: JSON.stringify({ value: socialInstagram }) }),
        apiFetch("/api/settings/social_youtube", { method: "PUT", body: JSON.stringify({ value: socialYoutube }) }),
        apiFetch("/api/settings/social_tiktok", { method: "PUT", body: JSON.stringify({ value: socialTiktok }) }),
      ]);
      await apiFetch("/api/export", { method: "POST" });
      toast({ title: "Redes sociales guardadas" });
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setSocialLoading(false);
    }
  };

  const handleSaveWhatsApp = async () => {
    setWhatsappLoading(true);
    setWhatsappSuccess(false);
    setWhatsappError(null);

    try {
      const res = await apiFetch("/api/settings/whatsapp_number", {
        method: "PUT",
        body: JSON.stringify({ value: whatsappNumber }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar");
      }

      toast({
        title: "Configuración guardada",
        description: "Número de WhatsApp actualizado exitosamente",
      });

      // Auto-export después de guardar
      await handleExportData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Error al guardar",
        variant: "destructive",
      });
    } finally {
      setWhatsappLoading(false);
    }
  };

  const handleSaveShowPrices = async () => {
    setPricesLoading(true);
    setPricesSuccess(false);
    setPricesError(null);

    try {
      const res = await apiFetch("/api/settings/show_prices", {
        method: "PUT",
        body: JSON.stringify({ value: showPrices.toString() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar");
      }

      toast({
        title: "Configuración guardada",
        description: "Visibilidad de precios actualizada exitosamente",
      });

      // Auto-export después de guardar
      await handleExportData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Error al guardar",
        variant: "destructive",
      });
    } finally {
      setPricesLoading(false);
    }
  };

  const handleSaveContactPhone = async () => {
    setPhoneLoading(true);
    setPhoneSuccess(false);
    setPhoneError(null);

    try {
      const res = await apiFetch("/api/settings/contact_phone", {
        method: "PUT",
        body: JSON.stringify({ value: contactPhone }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar");
      }

      toast({
        title: "Configuración guardada",
        description: "Teléfono de contacto actualizado exitosamente",
      });

      // Auto-export después de guardar
      await handleExportData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Error al guardar",
        variant: "destructive",
      });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleSaveContactEmail = async () => {
    setEmailLoading(true);
    setEmailSuccess(false);
    setEmailError(null);

    try {
      const res = await apiFetch("/api/settings/contact_email", {
        method: "PUT",
        body: JSON.stringify({ value: contactEmail }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar");
      }

      toast({
        title: "Configuración guardada",
        description: "Email de contacto actualizado exitosamente",
      });

      // Auto-export después de guardar
      await handleExportData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Error al guardar",
        variant: "destructive",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSaveContactAddress = async () => {
    setAddressLoading(true);
    setAddressSuccess(false);
    setAddressError(null);

    try {
      const res = await apiFetch("/api/settings/contact_address", {
        method: "PUT",
        body: JSON.stringify({ value: contactAddress }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar");
      }

      toast({
        title: "Configuración guardada",
        description: "Dirección actualizada exitosamente",
      });

      // Auto-export después de guardar
      await handleExportData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Error al guardar",
        variant: "destructive",
      });
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSaveShowAddress = async () => {
    setShowAddressLoading(true);
    setShowAddressSuccess(false);
    setShowAddressError(null);

    try {
      const res = await apiFetch("/api/settings/show_address", {
        method: "PUT",
        body: JSON.stringify({ value: showAddress.toString() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar");
      }

      toast({
        title: "Configuración guardada",
        description: "Visibilidad de dirección actualizada exitosamente",
      });

      // Auto-export después de guardar
      await handleExportData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Error al guardar",
        variant: "destructive",
      });
    } finally {
      setShowAddressLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordLoading(true);
    setPasswordSuccess(false);
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Todos los campos son obligatorios");
      setPasswordLoading(false);
      setTimeout(() => setPasswordError(null), 5000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas nuevas no coinciden");
      setPasswordLoading(false);
      setTimeout(() => setPasswordError(null), 5000);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      setPasswordLoading(false);
      setTimeout(() => setPasswordError(null), 5000);
      return;
    }

    try {
      const res = await apiFetch("/api/users/change-password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al cambiar contraseña");
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (err: any) {
      setPasswordError(err.message || "Error al cambiar contraseña");
      setTimeout(() => setPasswordError(null), 5000);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    setExportSuccess(false);
    setExportError(null);

    try {
      const res = await apiFetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        let errorMessage = "Error al exportar datos";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseErr) {
          console.error("Error al parsear respuesta de error");
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      toast({
        title: "Datos exportados",
        description: "El archivo data.json se ha generado exitosamente",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Error al exportar datos",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const menuItems = [
    {
      id: 0,
      label: "Crear Categoría",
      icon: <PlusCircle className="w-5 h-5" />,
    },
    { id: 1, label: "Editar Categorías", icon: <Edit className="w-5 h-5" /> },
    { id: 2, label: "Crear Producto", icon: <Package className="w-5 h-5" /> },
    {
      id: 3,
      label: "Editar Productos",
      icon: <FolderOpen className="w-5 h-5" />,
    },
    { id: 4, label: "Configuración", icon: <Settings className="w-5 h-5" /> },
    { id: 5, label: "Cambiar Contraseña", icon: <Lock className="w-5 h-5" /> },
    { id: 6, label: "Carrusel", icon: <Image className="w-5 h-5" /> },
    { id: 7, label: "Redes Sociales", icon: <Share2 className="w-5 h-5" /> },
  ];

  const currentMenuItem = menuItems.find((item) => item.id === tab);

  return (
    <motion.div
      className="min-h-screen flex bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Sidebar - Desktop */}
      <motion.aside
        className="hidden lg:flex lg:flex-col lg:w-72 bg-foreground border-r-2 border-white/10 shadow-lg h-screen sticky top-0"
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo */}
        <div className="p-6 border-b-2 border-white/10 flex-shrink-0 flex flex-col items-center">
          <img
            src="/logo-horizontal.png"
            alt="TRES"
            className="h-14 w-auto object-contain mb-3"
          />
          <h1
            className="text-sm font-medium text-white/60 text-center uppercase tracking-widest"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Panel de Administración
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 ${
                tab === item.id
                  ? "bg-white text-foreground shadow-lg scale-105"
                  : "text-white hover:bg-white/10 hover:scale-102"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Export Button */}
        <div className="p-4 border-t-2 border-white/10 space-y-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleExportData}
            disabled={exportLoading}
            className="w-full border-2 border-white/20 bg-white/10 text-white hover:bg-white hover:text-foreground transition-all"
          >
            {exportLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                Exportando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar Datos
              </div>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-red-500 text-white border-white/20 hover:border-red-500 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </motion.aside>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="lg:hidden fixed inset-0 bg-black z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleCloseSidebar}
            />

            {/* Sidebar Drawer */}
            <motion.aside
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-foreground shadow-2xl z-50 flex flex-col"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Close Button */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={handleCloseSidebar}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                  aria-label="Cerrar menú"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Logo */}
              <div className="p-6 border-b-2 border-white/10 flex flex-col items-center">
                <img
                  src="/logo-horizontal.png"
                  alt="TRES"
                  className="h-14 w-auto object-contain mb-3"
                />
                <h1
                  className="text-sm font-medium text-white/60 text-center uppercase tracking-widest"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Panel de Administración
                </h1>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTab(item.id);
                      handleCloseSidebar();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 ${
                      tab === item.id
                        ? "bg-white text-foreground shadow-lg scale-105"
                        : "text-white hover:bg-white/10 hover:scale-102"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* Export Button */}
              <div className="p-4 border-t-2 border-white/10 space-y-2 flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  disabled={exportLoading}
                  className="w-full border-2 border-white/20 bg-white/10 text-white hover:bg-white hover:text-foreground transition-all"
                >
                  {exportLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      Exportando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Exportar Datos
                    </div>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-red-500 text-white border-white/20 hover:border-red-500 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header - Mobile only */}
        <header className="lg:hidden bg-foreground shadow-md sticky top-0 z-30">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center gap-2 text-white">
              {currentMenuItem?.icon}
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {currentMenuItem?.label}
              </h2>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Success/Error Alerts - Solo para exportar datos */}
        <div className="flex-1 overflow-y-auto">
          {/* Content Area */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {tab === 0 && <CategoryCreate />}
              {tab === 1 && <CategoryEdit />}
              {tab === 2 && <ProductCreate />}
              {tab === 3 && <ProductEdit />}
              {tab === 4 && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <h2
                      className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Configuración General
                    </h2>
                    <p className="text-gray-600">
                      Configura opciones del catálogo y contacto
                    </p>
                  </motion.div>

                  {/* Mostrar Precios */}
                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Mostrar Precios en Catálogo
                      </label>
                      <Switch
                        checked={showPrices}
                        onCheckedChange={setShowPrices}
                        className="data-[state=checked]:bg-foreground"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      {showPrices
                        ? "Los precios son visibles en el catálogo"
                        : "Los precios están ocultos en el catálogo"}
                    </p>
                  </div>

                  {pricesSuccess && (
                    <Alert className="bg-green-50 border-green-200 animate-in slide-in-from-top-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        ¡Configuración de precios guardada exitosamente!
                      </AlertDescription>
                    </Alert>
                  )}

                  {pricesError && (
                    <Alert
                      variant="destructive"
                      className="animate-in slide-in-from-top-2"
                    >
                      <AlertDescription>{pricesError}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleSaveShowPrices}
                    disabled={pricesLoading}
                    className="w-full sm:w-auto h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    {pricesLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Guardando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="w-5 h-5" />
                        Guardar Configuración
                      </div>
                    )}
                  </Button>

                  {/* WhatsApp */}
                  <div className="border-t-2 border-gray-200 pt-6">
                    <h3
                      className="text-xl font-bold text-gray-800 mb-4"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Configuración de WhatsApp
                    </h3>

                    <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Número de WhatsApp (con código de país)
                      </label>
                      <Input
                        type="text"
                        placeholder="573001234567"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="h-12 text-base border-2 mb-2"
                      />
                      <p className="text-sm text-gray-600">
                        Formato: código de país + número (ejemplo: 573001234567
                        para Colombia)
                      </p>
                    </div>

                    <Button
                      onClick={handleSaveWhatsApp}
                      disabled={whatsappLoading}
                      className="w-full sm:w-auto h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 mt-4"
                    >
                      {whatsappLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Guardando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-5 h-5" />
                          Guardar Número
                        </div>
                      )}
                    </Button>
                  </div>

                  {/* Contact Phone */}
                  <div className="border-t-2 border-gray-200 pt-6">
                    <h3
                      className="text-xl font-bold text-gray-800 mb-4"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Teléfono de Contacto (Footer)
                    </h3>

                    <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono de Contacto
                      </label>
                      <Input
                        type="text"
                        placeholder="+57 300 123 4567"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="h-12 text-base border-2 mb-2"
                      />
                      <p className="text-sm text-gray-600">
                        Este número se mostrará en el footer del sitio web
                      </p>
                    </div>

                    <Button
                      onClick={handleSaveContactPhone}
                      disabled={phoneLoading}
                      className="w-full sm:w-auto h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 mt-4"
                    >
                      {phoneLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Guardando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-5 h-5" />
                          Guardar Teléfono
                        </div>
                      )}
                    </Button>
                  </div>

                  {/* Contact Email */}
                  <div className="border-t-2 border-gray-200 pt-6">
                    <h3
                      className="text-xl font-bold text-gray-800 mb-4"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Email de Contacto (Footer)
                    </h3>

                    <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email de Contacto
                      </label>
                      <Input
                        type="email"
                        placeholder="contacto@ejemplo.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="h-12 text-base border-2 mb-2"
                      />
                      <p className="text-sm text-gray-600">
                        Este email se mostrará en el footer del sitio web
                      </p>
                    </div>

                    <Button
                      onClick={handleSaveContactEmail}
                      disabled={emailLoading}
                      className="w-full sm:w-auto h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 mt-4"
                    >
                      {emailLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Guardando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-5 h-5" />
                          Guardar Email
                        </div>
                      )}
                    </Button>
                  </div>

                  {/* Contact Address */}
                  <div className="border-t-2 border-gray-200 pt-6">
                    <h3
                      className="text-xl font-bold text-gray-800 mb-4"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Dirección de la Tienda (Footer)
                    </h3>

                    {/* Switch para mostrar/ocultar dirección */}
                    <div className="bg-white p-6 rounded-xl border-2 border-gray-200 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Mostrar Dirección en Footer
                        </label>
                        <Switch
                          checked={showAddress}
                          onCheckedChange={setShowAddress}
                          className="data-[state=checked]:bg-foreground"
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        {showAddress
                          ? "La dirección es visible en el footer"
                          : "La dirección está oculta en el footer"}
                      </p>
                    </div>

                    {showAddressSuccess && (
                      <Alert className="bg-green-50 border-green-200 animate-in slide-in-from-top-2 mb-4">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          ¡Configuración guardada exitosamente!
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      onClick={handleSaveShowAddress}
                      disabled={showAddressLoading}
                      className="w-full sm:w-auto h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 mb-6"
                    >
                      {showAddressLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Guardando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-5 h-5" />
                          Guardar Configuración
                        </div>
                      )}
                    </Button>

                    <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Dirección de la Tienda
                      </label>
                      <Input
                        type="text"
                        placeholder="Calle 123 #45-67, Ciudad, País"
                        value={contactAddress}
                        onChange={(e) => setContactAddress(e.target.value)}
                        className="h-12 text-base border-2 mb-2"
                      />
                      <p className="text-sm text-gray-600">
                        Esta dirección se mostrará en el footer del sitio web
                        (si está habilitada)
                      </p>
                    </div>

                    <Button
                      onClick={handleSaveContactAddress}
                      disabled={addressLoading}
                      className="w-full sm:w-auto h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 mt-4"
                    >
                      {addressLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Guardando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-5 h-5" />
                          Guardar Dirección
                        </div>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
              {tab === 5 && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <h2
                      className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Cambiar Contraseña
                    </h2>
                    <p className="text-gray-600">
                      Actualiza la contraseña de tu cuenta de administrador
                    </p>
                  </motion.div>

                  {passwordSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          ¡Contraseña actualizada exitosamente!
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {passwordError && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert variant="destructive">
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  <motion.div
                    className="bg-white p-6 rounded-xl border-2 border-gray-200 space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
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
                      <p className="text-sm text-gray-600 mt-1">
                        Mínimo 6 caracteres
                      </p>
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
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Button
                      onClick={handleChangePassword}
                      disabled={passwordLoading}
                      className="w-full sm:w-auto h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                      {passwordLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                </motion.div>
              )}
              {tab === 6 && <CarouselManagement />}

              {tab === 7 && (
                <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Redes Sociales</h2>
                    <p className="text-gray-500 text-sm">Configura el widget flotante de redes sociales</p>
                  </div>

                  {/* Toggle */}
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-800">Mostrar widget</p>
                      <p className="text-sm text-gray-500">Activa el botón flotante de redes en el catálogo</p>
                    </div>
                    <Switch checked={showSocialWidget} onCheckedChange={setShowSocialWidget} />
                  </div>

                  {/* Label */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Texto del widget</label>
                    <Input value={socialLabel} onChange={(e) => setSocialLabel(e.target.value)} placeholder="SÍGUENOS" className="max-w-xs" />
                    <p className="text-xs text-gray-400">Texto vertical que aparece debajo de los iconos</p>
                  </div>

                  {/* Social links */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
                    <p className="text-sm font-semibold text-gray-700">Links de redes sociales</p>
                    <p className="text-xs text-gray-400">Deja vacío para ocultar esa red</p>
                    {[
                      { label: "Facebook", value: socialFacebook, set: setSocialFacebook, placeholder: "https://facebook.com/tresjoyeria" },
                      { label: "Instagram", value: socialInstagram, set: setSocialInstagram, placeholder: "https://instagram.com/tresjoyeria" },
                      { label: "YouTube", value: socialYoutube, set: setSocialYoutube, placeholder: "https://youtube.com/@tresjoyeria" },
                      { label: "TikTok", value: socialTiktok, set: setSocialTiktok, placeholder: "https://tiktok.com/@tresjoyeria" },
                    ].map(({ label, value, set, placeholder }) => (
                      <div key={label} className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">{label}</label>
                        <Input value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} />
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleSaveSocial} disabled={socialLoading} className="bg-foreground hover:bg-foreground/90 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    {socialLoading ? "Guardando..." : "Guardar configuración"}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
