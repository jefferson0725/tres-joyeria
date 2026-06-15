import React, { useEffect, useState } from "react";
import { Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProductFormFields from "@/components/admin/ProductFormFields";
import { GemstoneInput } from "@/components/admin/GemstoneEditor";
import { SizeInput } from "@/components/admin/SizeEditor";
import useImageUpload from "@/hooks/useImageUpload";
import { syncProductSizes } from "../../utils/productSizesApi";
import apiFetch from "../../utils/api";
import { toast } from "../../hooks/use-toast";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../hooks/useAuth";

const ProductCreate: React.FC = () => {
  const { user } = useAuth();
  const imageUpload = useImageUpload();

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [sku, setSku] = useState("");
  const [material, setMaterial] = useState("");
  const [purity, setPurity] = useState("");
  const [weightGrams, setWeightGrams] = useState<number | "">("");
  const [gender, setGender] = useState("");
  const [featured, setFeatured] = useState(false);
  const [gemstones, setGemstones] = useState<GemstoneInput[]>([]);
  const [sizes, setSizes] = useState<SizeInput[]>([]);

  // Non-form state
  const [categories, setCategories] = useState<Array<any>>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/categories");
        if (!res.ok) throw new Error("Error loading categories");
        const data = await res.json();
        setCategories(data || []);
      } catch (err: any) {
        setError(err.message || "Error cargando categorias");
      }
    })();
  }, []);

  const setValue = <K extends string>(key: K, value: any) => {
    const map: Record<string, (v: any) => void> = {
      name: setName, description: setDescription, price: setPrice, categoryId: setCategoryId,
      sku: setSku, material: setMaterial, purity: setPurity, weightGrams: setWeightGrams,
      gender: setGender, featured: setFeatured, gemstones: setGemstones, sizes: setSizes,
    };
    map[key]?.(value);
  };

  const resetForm = () => {
    setName(""); setDescription(""); setPrice("");
    setCategoryId(""); setSku(""); setMaterial(""); setPurity("");
    setWeightGrams(""); setGender(""); setFeatured(false);
    setGemstones([]); setSizes([]);
    setImageFile(null); setImagePreview(null);
    setGalleryFiles([]); setGalleryPreviews([]);
  };

  const uploadGalleryImages = async (productId: number) => {
    for (let i = 0; i < galleryFiles.length; i++) {
      const file = galleryFiles[i];
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${productId}-gallery-${Date.now()}-${i}.${ext}`;
      const savedFilename = await imageUpload.upload(file, filename);
      const res = await apiFetch(`/api/product-images/product/${productId}`, {
        method: "POST",
        body: JSON.stringify({ url: savedFilename, displayOrder: i, isPrimary: false }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error guardando imagen de galería");
      }
    }
  };

  const handleCreate = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!name.trim()) throw new Error("El nombre es obligatorio");
      if (!description.trim()) throw new Error("La descripción es obligatoria");
      if (price === "" || Number(price) < 0) throw new Error("Precio inválido");
      if (!categoryId || categoryId === "0") throw new Error("Debes seleccionar una categoría");

      const validGems = gemstones.filter((g) => g.type && g.type.trim());
      const payload: any = {
        name,
        description,
        price: Number(price),
        sku: sku || null,
        material: material || null,
        purity: purity || null,
        weightGrams: weightGrams === "" ? null : Number(weightGrams),
        gender: gender || null,
        featured: Boolean(featured),
        gemstones: validGems.length
          ? JSON.stringify(
              validGems.map((g) => ({
                type: g.type.trim(),
                ...(g.carat !== "" && g.carat != null && { carat: Number(g.carat) }),
                ...(g.count !== "" && g.count != null && { count: Number(g.count) }),
              })),
            )
          : null,
        categoryId: Number(categoryId),
      };

      const res = await apiFetch(`/api/products`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error creando producto");

      // Main image upload
      if (imageFile && data.id) {
        const ext = imageFile.name.split(".").pop() || "jpg";
        const sanitizedName = name.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60);
        const filename = `${data.id}-${sanitizedName}.${ext}`;

        setUploadingImage(true);
        setUploadProgress(0);
        const t = toast({ title: "Guardando imagen", description: "0%" });

        try {
          const savedFilename = await imageUpload.upload(imageFile, filename, {
            onProgress: (pct) => {
              setUploadProgress(pct);
              t.update({ id: t.id, description: `${pct}%` });
            },
          });
          setUploadingImage(false);
          setUploadProgress(100);
          t.update({ id: t.id, title: "Imagen guardada", description: "Listo" });

          const updateRes = await apiFetch(`/api/products/${data.id}`, {
            method: "PUT",
            body: JSON.stringify({ image: savedFilename }),
          });
          if (!updateRes.ok) throw new Error("Error actualizando imagen del producto");
        } catch (uerr: any) {
          setUploadingImage(false);
          setUploadProgress(0);
          const message = uerr?.response?.data?.error || uerr?.message || "Error guardando imagen";
          t.update({ id: t.id, title: "Error al guardar imagen", description: message });
          throw new Error(message);
        }
      }

      if (galleryFiles.length > 0 && data.id) {
        toast({ title: "Guardando galería", description: `Subiendo ${galleryFiles.length} imagen(es)...` });
        await uploadGalleryImages(data.id);
      }

      if (sizes.length > 0) {
        toast({ title: "Guardando tamaños", description: `Procesando ${sizes.length} tamaño(s)...` });
        await syncProductSizes({ productId: data.id, current: sizes, upload: imageUpload.upload });
        toast({ title: "Tamaños guardados", description: "Todos los tamaños se crearon exitosamente" });
      }

      toast({ title: "Producto creado", description: data.name || "El producto ha sido creado exitosamente" });
      resetForm();
    } catch (err: any) {
      setError(err.message || "Error");
      toast({ title: "Error", description: err.message || "Error al crear producto", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-md mx-auto mt-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Solo administradores pueden crear productos.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-gray-800">
            Crear pieza
          </h2>
          <p className="text-gray-600 mt-1">Añade una nueva joya al catálogo</p>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <ProductFormFields
            values={{ name, description, price, categoryId, sku, material, purity, weightGrams, gender, featured, gemstones, sizes }}
            set={setValue}
            categories={categories}
            imagePreview={imagePreview}
            uploadingImage={uploadingImage}
            uploadProgress={uploadProgress}
            onSelectImage={(f) => {
              setImageFile(f);
              setImagePreview(URL.createObjectURL(f));
            }}
            onRemoveImage={() => {
              setImageFile(null);
              setImagePreview(null);
            }}
            galleryNew={galleryFiles.map((f, i) => ({ file: f, preview: galleryPreviews[i] }))}
            onAddGalleryFiles={(files) => {
              setGalleryFiles((prev) => [...prev, ...files]);
              setGalleryPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
            }}
            onRemoveGalleryNew={(idx) => {
              setGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
              setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
            }}
          />

          <Button
            onClick={handleCreate}
            disabled={loading || uploadingImage}
            className="w-full sm:w-auto h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            {loading || uploadingImage ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {uploadingImage ? "Subiendo imagen..." : "Creando..."}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Crear pieza
              </div>
            )}
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProductCreate;
