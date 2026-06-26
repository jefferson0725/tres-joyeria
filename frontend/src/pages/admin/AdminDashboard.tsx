import React, { useEffect, useState } from "react";
import {
  Download,
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
import { toast } from "@/hooks/use-toast";
import CategoryCreate from "./CategoryCreate";
import CategoryEdit from "./CategoryEdit";
import ProductCreate from "./ProductCreate";
import ProductEdit from "./ProductEdit";
import CarouselManagement from "./CarouselManagement";
import DisplaySettings from "./settings/DisplaySettings";
import ContactSettings from "./settings/ContactSettings";
import SocialSettings from "./settings/SocialSettings";
import PasswordSection from "./settings/PasswordSection";
import { apiFetch } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { id: 0, label: "Crear Categoría", icon: <PlusCircle className="w-5 h-5" /> },
  { id: 1, label: "Editar Categorías", icon: <Edit className="w-5 h-5" /> },
  { id: 2, label: "Crear Producto", icon: <Package className="w-5 h-5" /> },
  { id: 3, label: "Editar Productos", icon: <FolderOpen className="w-5 h-5" /> },
  { id: 4, label: "Configuración", icon: <Settings className="w-5 h-5" /> },
  { id: 5, label: "Cambiar Contraseña", icon: <Lock className="w-5 h-5" /> },
  { id: 6, label: "Carrusel", icon: <Image className="w-5 h-5" /> },
  { id: 7, label: "Redes Sociales", icon: <Share2 className="w-5 h-5" /> },
];

interface SidebarBodyProps {
  tab: number;
  setTab: (id: number) => void;
  exportLoading: boolean;
  handleExportData: () => void;
  handleLogout: () => void;
  onItemClick?: () => void;
}

const SidebarBody = ({ tab, setTab, exportLoading, handleExportData, handleLogout, onItemClick }: SidebarBodyProps) => (
  <>
    <div className="p-6 border-b-2 border-white/10 flex-shrink-0 flex flex-col items-center">
      <img src="/logo-horizontal.png" alt="TRES" className="h-14 w-auto object-contain mb-3" />
      <h1
        className="text-sm font-medium text-white/60 text-center uppercase tracking-widest"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Panel de Administración
      </h1>
    </div>

    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
      {menuItems.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            setTab(item.id);
            onItemClick?.();
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

    <div className="p-4 border-t-2 border-white/10 space-y-2 flex-shrink-0">
      <Button
        variant="outline"
        onClick={handleExportData}
        disabled={exportLoading}
        className="w-full border-2 border-white/20 bg-white/10 text-white hover:bg-white hover:text-foreground transition-all"
      >
        {exportLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
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
  </>
);

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState(4);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  // Logout automático al desmontar el panel
  useEffect(() => () => logout(), [logout]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const res = await apiFetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al exportar datos");
      }
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

  const renderTab = () => {
    switch (tab) {
      case 0: return <CategoryCreate />;
      case 1: return <CategoryEdit />;
      case 2: return <ProductCreate />;
      case 3: return <ProductEdit />;
      case 4: return (
        <div className="space-y-6">
          <DisplaySettings />
          <ContactSettings />
        </div>
      );
      case 5: return <PasswordSection />;
      case 6: return <CarouselManagement />;
      case 7: return <SocialSettings />;
      default: return null;
    }
  };

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
        <SidebarBody tab={tab} setTab={setTab} exportLoading={exportLoading} handleExportData={handleExportData} handleLogout={handleLogout} />
      </motion.aside>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-black z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-foreground shadow-2xl z-50 flex flex-col"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                  aria-label="Cerrar menú"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <SidebarBody tab={tab} setTab={setTab} exportLoading={exportLoading} handleExportData={handleExportData} handleLogout={handleLogout} onItemClick={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden bg-foreground shadow-md sticky top-0 z-30">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2 text-white">
              {currentMenuItem?.icon}
              <h2 className="text-lg font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
                {currentMenuItem?.label}
              </h2>
            </div>
            <div className="w-10" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {renderTab()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
