import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm, useFieldArray } from "react-hook-form";
import { Package, X, CheckCircle, AlertCircle, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import apiFetch from "../../utils/api";
import { getToken } from "../../utils/tokenStore";
import { toast } from "../../hooks/use-toast";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../hooks/useAuth";

interface ProductSize {
  id?: number;
  size: string;
  price: number | "";
  image: string | null;
  imageFile?: File | null;
  imagePreview?: string | null;
}

interface Gemstone {
  type: string;
  carat?: number | "";
  count?: number | "";
}

interface ProductFormData {
  name: string;
  description: string;
  price: number | "";
  categoryId: string;
  sizes: ProductSize[];
  sku: string;
  material: string;
  purity: string;
  weightGrams: number | "";
  gender: string;
  featured: boolean;
  gemstones: Gemstone[];
}

const ProductCreate: React.FC = () => {
  const { user } = useAuth();
  
  const { register, control, handleSubmit, reset, watch, setValue } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      categoryId: "",
      sizes: [],
      sku: "",
      material: "",
      purity: "",
      weightGrams: "",
      gender: "",
      featured: false,
      gemstones: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sizes"
  });

  const {
    fields: gemFields,
    append: appendGem,
    remove: removeGem,
  } = useFieldArray({ control, name: "gemstones" });

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [categories, setCategories] = useState<Array<any>>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSizes, setHasSizes] = useState(false);
  
  // Separate state for size images (react-hook-form doesn't handle File objects well with watch)
  const [sizeImages, setSizeImages] = useState<Map<number, { file: File; preview: string }>>(new Map());

  const sizes = watch("sizes");

  useEffect(() => {
    // load categories from API
    (async () => {
      try {
        const res = await apiFetch('/api/categories');
        if (!res.ok) throw new Error('Error loading categories');
        const data = await res.json();
        setCategories(data || []);
      } catch (err: any) {
        setError(err.message || "Error cargando categorias");
      }
    })();
  }, []);

  const addSize = () => {
    append({ size: "", price: "", image: null, imageFile: null, imagePreview: null });
  };

  const removeSize = (index: number) => {
    // Remove the image from sizeImages state
    setSizeImages(prev => {
      const newMap = new Map();
      prev.forEach((value, key) => {
        if (key < index) {
          newMap.set(key, value);
        } else if (key > index) {
          // Re-index items after the removed one
          newMap.set(key - 1, value);
        }
      });
      return newMap;
    });
    remove(index);
  };

  const updateSize = (index: number, field: keyof ProductSize, value: any) => {
    setValue(`sizes.${index}.${field}` as any, value);
  };

  const handleSizeImageChange = (index: number, file: File | null) => {
    if (file) {
      console.log(`Image selected for size ${index + 1}:`, file.name, file.size);
      const preview = URL.createObjectURL(file);
      
      // Store in separate state (more reliable than react-hook-form for File objects)
      setSizeImages(prev => {
        const newMap = new Map(prev);
        newMap.set(index, { file, preview });
        return newMap;
      });
      
      // Also update form for preview display
      setValue(`sizes.${index}.imagePreview` as any, preview);
      
      console.log(`Size ${index + 1} imageFile updated in sizeImages state`);
    }
  };

  const uploadSizeImage = async (sizeIndex: number, productId: number) => {
    const size = sizes[sizeIndex];
    const sizeImageData = sizeImages.get(sizeIndex);
    
    if (!sizeImageData) {
      console.log(`No image file found for size ${sizeIndex + 1}`);
      return null;
    }

    try {
      const ext = sizeImageData.file.name.split('.').pop() || 'jpg';
      const sanitizedSize = size.size.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
      const filename = `${productId}-size-${sanitizedSize}.${ext}`;

      console.log(`Uploading size image: ${filename}`);

      const form = new FormData();
      form.append("filename", filename);
      form.append("image", sizeImageData.file);

      const API_ROOT = import.meta.env.VITE_API_URL ?? "";
      const token = getToken();
      
      console.log(`Uploading to: ${API_ROOT}/api/uploads/frontend`);
      
      const uploadRes = await axios.post(
        `${API_ROOT}/api/uploads/frontend`,
        form,
        {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        }
      );

      console.log("Upload response:", uploadRes.data);
      
      const savedFilename = uploadRes.data.filename || filename;
      console.log(`Size image saved as: ${savedFilename}`);
      
      return savedFilename;
    } catch (err: any) {
      console.error("Error uploading size image:", err);
      console.error("Error details:", err.response?.data);
      throw new Error(`Error subiendo imagen del tamaño: ${err.response?.data?.error || err.message}`);
    }
  };

  const uploadGalleryImages = async (productId: number) => {
    if (!galleryFiles.length) return;
    const API_ROOT = import.meta.env.VITE_API_URL ?? "";
    const token = getToken();

    for (let i = 0; i < galleryFiles.length; i++) {
      const file = galleryFiles[i];
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${productId}-gallery-${Date.now()}-${i}.${ext}`;
      const form = new FormData();
      form.append("filename", filename);
      form.append("image", file);

      const uploadRes = await axios.post(`${API_ROOT}/api/uploads/frontend`, form, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const savedFilename = uploadRes.data.filename || filename;

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

  const createProductSizes = async (productId: number) => {
    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i];
      const sizeImageData = sizeImages.get(i);

      if (!size.size || size.price === "") {
        throw new Error(`Tamaño ${i + 1}: Completa el nombre y precio`);
      }

      console.log(`Processing size ${i + 1}:`, {
        size: size.size,
        price: size.price,
        hasImageFile: !!sizeImageData,
        imageFileName: sizeImageData?.file.name
      });

      let imageFilename = null;
      if (sizeImageData) {
        console.log(`Uploading image for size ${i + 1}...`);
        imageFilename = await uploadSizeImage(i, productId);
        console.log(`Image uploaded for size ${i + 1}: ${imageFilename}`);
      }

      console.log(`Creating size ${i + 1} in database...`);
      const res = await apiFetch(`/api/product-sizes`, {
        method: "POST",
        body: JSON.stringify({
          productId,
          size: size.size.trim(),
          price: Number(size.price),
          image: imageFilename,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error(`Error creating size ${i + 1}:`, data);
        throw new Error(data.error || `Error creando tamaño ${i + 1}`);
      }

      const createdSize = await res.json();
      console.log(`Size ${i + 1} created successfully:`, createdSize);
    }
  };

  const onSubmit = async (formData: ProductFormData) => {
    setError(null);
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.description || !formData.description.trim()) {
        throw new Error("La descripción es obligatoria");
      }
      if (!formData.categoryId || formData.categoryId === "0") {
        throw new Error("Debes seleccionar una categoría");
      }

      // First create the product without image
      const payload: any = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        sku: formData.sku || null,
        material: formData.material || null,
        purity: formData.purity || null,
        weightGrams: formData.weightGrams === "" ? null : Number(formData.weightGrams),
        gender: formData.gender || null,
        featured: Boolean(formData.featured),
        gemstones: formData.gemstones?.length
          ? JSON.stringify(
              formData.gemstones
                .filter((g) => g.type && g.type.trim())
                .map((g) => ({
                  type: g.type.trim(),
                  carat: g.carat === "" || g.carat == null ? undefined : Number(g.carat),
                  count: g.count === "" || g.count == null ? undefined : Number(g.count),
                })),
            )
          : null,
      };
      if (formData.categoryId && formData.categoryId !== "0") {
        payload.categoryId = Number(formData.categoryId);
      }

      const res = await apiFetch(`/api/products`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error creando producto");

      // If there's an image file selected, upload it with product ID and name
      if (imageFile && data.id) {
        const ext = imageFile.name.split('.').pop() || 'jpg';
        const sanitizedName = formData.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 60);
        const filename = `${data.id}-${sanitizedName}.${ext}`;

        setUploadingImage(true);
        setUploadProgress(0);
        
        const t = toast({ title: "Guardando imagen", description: `0%` });
        
        try {
          const API_ROOT = import.meta.env.VITE_API_URL ?? "";
          const token = getToken();
          
          const form = new FormData();
          form.append("filename", filename);
          form.append("image", imageFile);

          const uploadRes = await axios.post(
            `${API_ROOT}/api/uploads/frontend`,
            form,
            {
              headers: token ? { "Authorization": `Bearer ${token}` } : {},
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / (progressEvent.total || 100)
                );
                setUploadProgress(percentCompleted);
                t.update({ id: t.id, description: `${percentCompleted}%` });
              },
            }
          );

          const savedFilename = uploadRes.data.filename || filename;

          setUploadingImage(false);
          setUploadProgress(100);
          t.update({ id: t.id, title: "Imagen guardada", description: "Listo" });
          
          // Update product with image filename
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

      // Upload gallery images (if any)
      if (galleryFiles.length > 0 && data.id) {
        toast({ title: "Guardando galería", description: `Subiendo ${galleryFiles.length} imagen(es)...` });
        await uploadGalleryImages(data.id);
      }

      // Create product sizes if enabled
      if (hasSizes && formData.sizes.length > 0) {
        console.log(`Creating ${formData.sizes.length} product sizes...`);
        toast({ title: "Guardando tamaños", description: `Procesando ${formData.sizes.length} tamaño(s)...` });
        await createProductSizes(data.id);
        toast({ title: "Tamaños guardados", description: "Todos los tamaños se crearon exitosamente" });
      }

      toast({ title: "Producto creado", description: data.name || "El producto ha sido creado exitosamente" });
      reset();
      setImageFile(null);
      setImagePreview(null);
      setHasSizes(false);
      setSizeImages(new Map());
      setGalleryFiles([]);
      setGalleryPreviews([]);
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-500 delay-75">
            <label className="text-sm font-semibold text-gray-700">Nombre de la pieza *</label>
            <Input
              type="text"
              placeholder="Ej: Anillo solitario oro 18k"
              {...register("name", { required: true })}
              className="h-12 text-base border-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Descripción *</label>
            <Textarea
              placeholder="Detalles del diseño, acabado, materiales, ocasión, etc."
              {...register("description", { required: true })}
              className="min-h-24 text-base border-2 resize-none"
            />
            <p className="text-xs text-gray-500">{watch("description")?.length || 0}/500 caracteres</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Precio *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                $
              </span>
              <Input
                type="number"
                placeholder="0"
                {...register("price", { 
                  required: true,
                  min: 0,
                  valueAsNumber: false,
                  setValueAs: (v) => v === "" ? "" : Number(v)
                })}
                step="1000"
                className="h-12 text-base border-2 pl-7"
              />
            </div>
            {watch("price") !== "" && (
              <p className="text-xs text-gray-500">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(watch("price")))}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Categoría</label>
            <select
              value={watch("categoryId")}
              onChange={(e) => setValue("categoryId", e.target.value)}
              className="w-full h-12 px-3 text-sm border-2 border-gray-200 rounded-md bg-white text-gray-800 focus:outline-none focus:border-gray-800"
            >
              <option value="0">Sin categoría</option>
              {(() => {
                const parents = categories.filter((c: any) => !c.parentId);
                const childrenOf = (pid: number) => categories.filter((c: any) => c.parentId === pid);
                return parents.map((p: any) => {
                  const subs = childrenOf(p.id);
                  return subs.length > 0 ? (
                    <optgroup key={p.id} label={p.name}>
                      {subs.map((s: any) => (
                        <option key={s.id} value={String(s.id)}>{s.name}</option>
                      ))}
                    </optgroup>
                  ) : (
                    <option key={p.id} value={String(p.id)}>{p.name}</option>
                  );
                });
              })()}
            </select>
          </div>

          {/* Jewelry-specific fields */}
          <div className="border-t-2 pt-6">
            <h3 className="text-lg font-display font-semibold text-gray-800 mb-4">Detalles de la pieza</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">SKU / Referencia</label>
                <Input type="text" placeholder="TRES-A-001" {...register("sku")} className="h-11 border-2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Material</label>
                <Input type="text" placeholder="Oro, plata, acero…" {...register("material")} className="h-11 border-2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Pureza / quilates</label>
                <Input type="text" placeholder="18k, 14k, 925…" {...register("purity")} className="h-11 border-2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Peso (gramos)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("weightGrams", { setValueAs: (v) => (v === "" ? "" : Number(v)) })}
                  className="h-11 border-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Género</label>
                <Select value={watch("gender")} onValueChange={(v) => setValue("gender", v)}>
                  <SelectTrigger className="h-11 border-2">
                    <SelectValue placeholder="Sin especificar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mujer">Mujer</SelectItem>
                    <SelectItem value="hombre">Hombre</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-7">
                <Checkbox
                  id="featured"
                  checked={Boolean(watch("featured"))}
                  onCheckedChange={(checked) => setValue("featured", Boolean(checked))}
                />
                <label htmlFor="featured" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Marcar como destacado
                </label>
              </div>
            </div>

            {/* Gemstones editor */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Piedras / gemas</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendGem({ type: "", carat: "", count: "" })}
                >
                  <Plus className="w-4 h-4 mr-1" /> Añadir piedra
                </Button>
              </div>
              {gemFields.length === 0 && (
                <p className="text-xs text-gray-500">Sin piedras añadidas.</p>
              )}
              <div className="space-y-2">
                {gemFields.map((gem, idx) => (
                  <div key={gem.id} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-2 rounded">
                    <div className="col-span-5">
                      <label className="text-xs text-gray-600">Tipo</label>
                      <Input
                        placeholder="Diamante, rubí…"
                        {...register(`gemstones.${idx}.type` as const)}
                        className="h-9 border-2"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-xs text-gray-600">Quilates</label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.25"
                        {...register(`gemstones.${idx}.carat` as const, {
                          setValueAs: (v) => (v === "" ? "" : Number(v)),
                        })}
                        className="h-9 border-2"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-xs text-gray-600">Cantidad</label>
                      <Input
                        type="number"
                        step="1"
                        placeholder="1"
                        {...register(`gemstones.${idx}.count` as const, {
                          setValueAs: (v) => (v === "" ? "" : Number(v)),
                        })}
                        className="h-9 border-2"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeGem(idx)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Imagen principal</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-accent transition-colors">
              {imagePreview ? (
                <div className="relative mb-4">
                  <img 
                    src={imagePreview} 
                    alt="preview" 
                    className="w-full max-h-64 object-contain rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Quitar
                  </Button>
                </div>
              ) : (
                <div className="text-center mb-4">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Arrastra una imagen o haz clic para seleccionar</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files && e.target.files[0];
                  if (f) {
                    setImageFile(f);
                    setImagePreview(URL.createObjectURL(f));
                  }
                }}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-foreground hover:file:bg-accent/20 cursor-pointer"
              />
            </div>
          </div>

          {uploadingImage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700">Subiendo imagen...</span>
                <span className="text-gray-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Gallery */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Galería de imágenes</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                  {galleryPreviews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
                          setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1 right-1 rounded-full bg-red-500/90 text-white p-1 hover:bg-red-600"
                        aria-label="Eliminar imagen"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  setGalleryFiles((prev) => [...prev, ...files]);
                  setGalleryPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
                  e.target.value = "";
                }}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-foreground hover:file:bg-accent/20 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">Puedes subir varias imágenes para mostrar la pieza desde distintos ángulos.</p>
            </div>
          </div>

          {/* Variants / sizes Section */}
          <div className="border-t-2 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Checkbox
                id="has-sizes"
                checked={hasSizes}
                onCheckedChange={(checked) => setHasSizes(checked as boolean)}
              />
              <label htmlFor="has-sizes" className="text-sm font-semibold text-gray-700 cursor-pointer">
                Esta pieza tiene variantes (talla de anillo, longitud, etc.)
              </label>
            </div>

            {hasSizes && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Añade las tallas o longitudes disponibles. Ej: anillo 5, 6, 7… o cadena 40cm, 45cm, 50cm.
                </p>

                {fields.map((field, index) => (
                  <div key={field.id} className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-800">Variante {index + 1}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSize(index)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">Talla / Longitud *</label>
                        <Input
                          type="text"
                          placeholder='Ej: "6", "40cm", "18cm"'
                          {...register(`sizes.${index}.size` as const)}
                          className="h-10 text-sm border-2"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">Precio *</label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <Input
                            type="number"
                            placeholder="0"
                            {...register(`sizes.${index}.price` as const, {
                              setValueAs: (v) => v === "" ? "" : Number(v)
                            })}
                            min="0"
                            step="1000"
                            className="h-10 text-sm border-2 pl-6"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">Imagen para esta variante</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-accent transition-colors">
                        {sizeImages.get(index)?.preview ? (
                          <div className="relative">
                            <img 
                              src={sizeImages.get(index)!.preview} 
                              alt="size preview" 
                              className="w-full max-h-40 object-contain rounded mb-2"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSizeImages(prev => {
                                  const newMap = new Map(prev);
                                  newMap.delete(index);
                                  return newMap;
                                });
                              }}
                              className="absolute top-1 right-1"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 text-center">Selecciona una imagen</p>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files && e.target.files[0];
                            if (f) handleSizeImageChange(index, f);
                          }}
                          className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-foreground"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={addSize}
                  variant="outline"
                  className="w-full border-2 border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir otra variante
                </Button>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || uploadingImage}
            className="w-full sm:w-auto h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            {loading || uploadingImage ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {uploadingImage ? 'Subiendo imagen...' : 'Creando...'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Crear pieza
              </div>
            )}
          </Button>
        </form>
      </div>
    </ProtectedRoute>
  );
};

export default ProductCreate;
