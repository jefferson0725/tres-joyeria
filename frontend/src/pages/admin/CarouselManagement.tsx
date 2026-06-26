import React, { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { apiFetch } from "@/utils/api";
import { getToken } from "@/utils/tokenStore";
import { motion } from "framer-motion";
import axios from "axios";

interface CarouselImage {
  filename: string;
  url: string;
  mobileFilename?: string;
  mobileUrl?: string;
}

const validateImageFile = (file: File): string | null => {
  if (!file.type.startsWith("image/")) return "Por favor selecciona una imagen válida";
  if (file.size > 5 * 1024 * 1024) return "La imagen no debe superar 5MB";
  return null;
};

const CarouselManagement: React.FC = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [showCarousel, setShowCarousel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const mobileFileRef = useRef<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);

  useEffect(() => {
    loadCarouselData();
  }, []);

  const loadCarouselData = async () => {
    try {
      setLoading(true);

      // Load images
      const imagesRes = await apiFetch("/api/carousel");
      if (imagesRes.ok) {
        const data = await imagesRes.json();
        setImages(data.images || []);
      }

      // Load settings from data.json
      const settingsRes = await fetch("/data.json");
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setShowCarousel(
          data.settings?.show_carousel === "true" ||
            data.settings?.show_carousel === true,
        );
      }
    } catch (err) {
      console.error("Error loading carousel data:", err);
      toast({
        title: "Error",
        description: "Error al cargar datos del carrusel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleDesktopSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) { toast({ title: "Error", description: err, variant: "destructive" }); return; }
    setDesktopFile(file);
    setDesktopPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleMobileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) { toast({ title: "Error", description: err, variant: "destructive" }); return; }
    mobileFileRef.current = file;
    setMobilePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleUploadSlide = async () => {
    if (!desktopFile) {
      toast({ title: "Error", description: "Selecciona al menos la imagen de escritorio", variant: "destructive" });
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", desktopFile);
      if (mobileFileRef.current) formData.append("mobileImage", mobileFileRef.current);

      const API_URL = import.meta.env.VITE_API_URL || "";
      const token = getToken();
      await axios.post(`${API_URL}/api/carousel/upload`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      toast({ title: "Éxito", description: "Slide subido correctamente" });
      setDesktopFile(null);
      mobileFileRef.current = null;
      setDesktopPreview(null);
      setMobilePreview(null);
      await loadCarouselData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || err.message || "Error al subir",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (filename: string) => {
    if (!confirm("¿Estás seguro de eliminar esta imagen?")) return;

    try {
      const res = await apiFetch(`/api/carousel/${filename}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al eliminar imagen");
      }

      toast({
        title: "Éxito",
        description: "Imagen eliminada correctamente",
      });

      await loadCarouselData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Error al eliminar imagen",
        variant: "destructive",
      });
    }
  };

  const handleToggleCarousel = async (enabled: boolean) => {
    try {
      const res = await apiFetch("/api/carousel/settings", {
        method: "PUT",
        body: JSON.stringify({ show_carousel: enabled }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al actualizar configuración");
      }

      setShowCarousel(enabled);

      toast({
        title: "Éxito",
        description: `Carrusel ${enabled ? "activado" : "desactivado"}`,
      });

      // Export data
      await apiFetch("/api/export", { method: "POST" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Error al actualizar configuración",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Carrusel de Imágenes
        </h2>
        <p className="text-gray-600">
          Gestiona las imágenes del carrusel de la página principal
        </p>
      </div>

      {/* Show/Hide Carousel */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
        <div>
          <h3 className="font-semibold text-gray-800">Mostrar Carrusel</h3>
          <p className="text-sm text-gray-600">
            Activa o desactiva el carrusel en la página principal
          </p>
        </div>
        <Switch checked={showCarousel} onCheckedChange={handleToggleCarousel} />
      </div>

      {/* Upload Section */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4 bg-white">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Añadir nuevo slide</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Desktop image */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">Imagen escritorio <span className="text-red-500">*</span></p>
            <input type="file" id="desktop-upload" accept="image/*" className="hidden" onChange={handleDesktopSelect} disabled={uploading} />
            <label
              htmlFor="desktop-upload"
              className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors overflow-hidden ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{ aspectRatio: "16/9" }}
            >
              {desktopPreview ? (
                <img src={desktopPreview} className="w-full h-full object-cover" alt="Preview escritorio" />
              ) : (
                <div className="flex flex-col items-center gap-2 p-4 text-gray-400">
                  <Upload className="w-8 h-8" />
                  <span className="text-xs text-center">Horizontal (16:9)</span>
                </div>
              )}
            </label>
          </div>

          {/* Mobile image */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">Imagen mobile <span className="text-gray-400">(opcional)</span></p>
            <input type="file" id="mobile-upload" accept="image/*" className="hidden" onChange={handleMobileSelect} disabled={uploading} />
            <label
              htmlFor="mobile-upload"
              className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors overflow-hidden mx-auto ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{ aspectRatio: "9/16", maxWidth: "120px" }}
            >
              {mobilePreview ? (
                <img src={mobilePreview} className="w-full h-full object-cover" alt="Preview mobile" />
              ) : (
                <div className="flex flex-col items-center gap-2 p-4 text-gray-400">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs text-center">Vertical (9:16)</span>
                </div>
              )}
            </label>
          </div>
        </div>

        <Button
          onClick={handleUploadSlide}
          disabled={uploading || !desktopFile}
          className="w-full sm:w-auto bg-foreground hover:bg-foreground/90"
        >
          {uploading ? "Subiendo..." : "Subir slide"}
        </Button>
      </div>

      {/* Images Grid */}
      {images.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No hay imágenes en el carrusel. Sube algunas para comenzar.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <motion.div
              key={image.filename}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="border border-gray-200 rounded-lg overflow-hidden bg-white"
            >
              {/* Desktop preview */}
              <div className="relative group">
                <img src={image.url} alt={`Slide ${index + 1} desktop`} className="w-full h-36 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteImage(image.filename)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                  </Button>
                </div>
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                  #{index + 1} · escritorio
                </div>
              </div>

              {/* Mobile preview (if exists) */}
              {image.mobileUrl && (
                <div className="flex items-center gap-3 p-3 border-t border-gray-100 bg-gray-50">
                  <img src={image.mobileUrl} alt={`Slide ${index + 1} mobile`} className="h-16 w-9 object-cover rounded flex-shrink-0" />
                  <span className="text-xs text-gray-500">Versión mobile disponible</span>
                </div>
              )}
              {!image.mobileUrl && (
                <div className="px-3 py-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Sin versión mobile</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CarouselManagement;
