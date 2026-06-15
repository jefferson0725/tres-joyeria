import React, { useEffect, useState } from "react";
import { X, Save, AlertCircle, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProductList from "@/components/admin/ProductList";
import ProductFormFields from "@/components/admin/ProductFormFields";
import { syncProductSizes } from "../../utils/productSizesApi";
import { GemstoneInput } from "@/components/admin/GemstoneEditor";
import { SizeInput } from "@/components/admin/SizeEditor";
import useImageUpload from "@/hooks/useImageUpload";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import apiFetch from "../../utils/api";
import { toast } from "../../hooks/use-toast";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../hooks/useAuth";

type ProductSize = SizeInput;

const ProductEdit: React.FC = () => {
  const { user } = useAuth();
  const imageUpload = useImageUpload();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false); // Track if user removed existing image
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Cache buster to force image refresh after upload
  const [imageCacheBuster, setImageCacheBuster] = useState(Date.now());

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Product sizes state
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [editingSizes, setEditingSizes] = useState<ProductSize[]>([]);

  // Jewelry-specific fields
  const [sku, setSku] = useState("");
  const [material, setMaterial] = useState("");
  const [purity, setPurity] = useState("");
  const [weightGrams, setWeightGrams] = useState<number | "">("");
  const [gender, setGender] = useState("");
  const [featured, setFeatured] = useState(false);
  const [gemstones, setGemstones] = useState<GemstoneInput[]>([]);
  const [galleryImages, setGalleryImages] = useState<{id: number; url: string; preview: string}[]>([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<{file: File; preview: string}[]>([]);
  const [deletedGalleryIds, setDeletedGalleryIds] = useState<number[]>([]);

  useEffect(() => { load(); loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      const res = await apiFetch('/api/categories');
      if (!res.ok) throw new Error('Error loading categories');
      const data = await res.json();
      setCategories(data || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  const loadGallery = async (productId: number) => {
    try {
      const res = await apiFetch(`/api/product-images/product/${productId}`);
      if (!res.ok) return;
      const data = await res.json();
      setGalleryImages((data || []).map((img: any) => ({
        id: img.id,
        url: img.url,
        preview: `/images/${img.url}`,
      })));
    } catch {}
  };

  const load = async () => {
    setError(null);
    try {
      const res = await apiFetch(`/api/products`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Error");
    }
  };

  const openEditor = (p: any) => {
    setEditing(p);
    setName(p.name || "");
    setDescription(p.description || "");
    setPrice(p.price ?? "");
    setCategoryId(p.categoryId ? String(p.categoryId) : "0");
    setImagePreview(p.image ? `/images/${p.image}` : null);
    setImageFile(null);
    setImageRemoved(false);
    setUploadProgress(0);
    setSku(p.sku || "");
    setMaterial(p.material || "");
    setPurity(p.purity || "");
    setWeightGrams(p.weightGrams != null ? Number(p.weightGrams) : "");
    setGender(p.gender || "");
    setFeatured(Boolean(p.featured));
    const rawGems = Array.isArray(p.gemstones)
      ? p.gemstones
      : typeof p.gemstones === "string"
        ? (() => { try { return JSON.parse(p.gemstones); } catch { return []; } })()
        : [];
    setGemstones(rawGems.map((g: any) => ({
      type: g.type || "",
      carat: g.carat != null ? Number(g.carat) : "",
      count: g.count != null ? Number(g.count) : "",
    })));
    setGalleryImages([]);
    setNewGalleryFiles([]);
    setDeletedGalleryIds([]);
    loadGallery(p.id);
    // Load sizes for this product
    if (p.sizes && p.sizes.length > 0) {
      setEditingSizes(p.sizes.map((s: any) => ({
        ...s,
        imageFile: null,
        imagePreview: s.image ? `/images/${s.image}` : null
      })));
    } else {
      setEditingSizes([]);
    }
    setDialogOpen(true);
  };

  const closeEditor = () => {
    setDialogOpen(false);
    setEditing(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategoryId("");
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(false);
    setEditingSizes([]);
    setSku("");
    setMaterial("");
    setPurity("");
    setWeightGrams("");
    setGender("");
    setFeatured(false);
    setGemstones([]);
    setGalleryImages([]);
    setNewGalleryFiles([]);
    setDeletedGalleryIds([]);
  };

  const saveSizes = (productId: number) =>
    syncProductSizes({
      productId,
      current: editingSizes,
      original: editing?.sizes || [],
      upload: imageUpload.upload,
    });

  const handleDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar producto");
      }
      toast({ title: "Producto eliminado", description: `${productToDelete.name} ha sido eliminado` });
      await load();
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Error al eliminar producto", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = products.findIndex((p) => p.id === active.id);
      const newIndex = products.findIndex((p) => p.id === over.id);

      const newProducts = arrayMove(products, oldIndex, newIndex);
      
      // Actualizar el estado local inmediatamente
      setProducts(newProducts);

      // Actualizar displayOrder en el backend
      try {
        const updates = newProducts.map((p, idx) => ({
          id: p.id,
          displayOrder: idx
        }));

        for (const update of updates) {
          await apiFetch(`/api/products/${update.id}`, {
            method: "PUT",
            body: JSON.stringify({ displayOrder: update.displayOrder }),
          });
        }

        toast({ title: "Orden actualizado", description: "El orden de los productos ha sido guardado" });
      } catch (err: any) {
        toast({ title: "Error", description: err.message || "Error al actualizar orden", variant: "destructive" });
        await load();
      }
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setError(null);
    try {
      // Validate category selection
      if (!categoryId || categoryId === "0") {
        throw new Error("Debes seleccionar una categoría");
      }

      const payload: any = {};
      if (name) payload.name = name;
      if (description) payload.description = description;
      if (price !== "") payload.price = Number(price);
      if (categoryId !== "" && categoryId !== "0") payload.categoryId = Number(categoryId);

      payload.sku = sku || null;
      payload.material = material || null;
      payload.purity = purity || null;
      payload.weightGrams = weightGrams === "" ? null : Number(weightGrams);
      payload.gender = gender || null;
      payload.featured = Boolean(featured);
      const validGems = gemstones.filter((g) => g.type.trim());
      payload.gemstones = validGems.length
        ? JSON.stringify(validGems.map((g) => ({
            type: g.type.trim(),
            ...(g.carat !== "" && g.carat !== undefined && { carat: g.carat }),
            ...(g.count !== "" && g.count !== undefined && { count: g.count }),
          })))
        : null;

      // If new image selected, upload first
      if (imageFile) {
        setUploadingImage(true);
        setUploadProgress(0);
        const t = toast({ title: "Guardando imagen", description: "0%" });

        const ext = imageFile.name.split(".").pop() || "jpg";
        const sanitizedName = name.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60);
        const filename = `${editing.id}-${sanitizedName}.${ext}`;

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
          payload.image = savedFilename;
        } catch (uerr: any) {
          setUploadingImage(false);
          setUploadProgress(0);
          const message = uerr?.response?.data?.error || uerr?.message || "Error subiendo imagen";
          t.update({ id: t.id, title: "Error al guardar imagen", description: message });
          throw new Error(message);
        }
      } else if (imageRemoved) {
        // User removed the image without adding a new one
        payload.image = null;
      }

      const res = await apiFetch(`/api/products/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error updating product");
      
      // Always save sizes to handle deletions
      await saveSizes(editing.id);

      // Delete removed gallery images
      for (const imgId of deletedGalleryIds) {
        await apiFetch(`/api/product-images/${imgId}`, { method: "DELETE" });
      }

      // Upload new gallery images
      for (let i = 0; i < newGalleryFiles.length; i++) {
        const { file } = newGalleryFiles[i];
        const ext = file.name.split(".").pop() || "jpg";
        const filename = `${editing.id}-gallery-${Date.now()}-${i}.${ext}`;
        const savedFilename = await imageUpload.upload(file, filename);
        await apiFetch(`/api/product-images/product/${editing.id}`, {
          method: "POST",
          body: JSON.stringify({
            url: savedFilename,
            displayOrder: galleryImages.length + i,
            isPrimary: false,
          }),
        });
      }

      toast({ title: "Producto actualizado", description: data.name });
      
      // Update cache buster to force image refresh
      setImageCacheBuster(Date.now());
      
      await load();
      closeEditor();
    } catch (err: any) {
      setError(err.message || "Error");
      toast({ title: "Error", description: err.message || "Error al actualizar producto", variant: "destructive" });
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-md mx-auto mt-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Solo administradores pueden editar productos.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-gray-800">
            Editar piezas
          </h2>
          <p className="text-gray-600 mt-1">Modifica o elimina piezas del catálogo</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4 animate-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <ProductList
          products={products}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onEdit={openEditor}
          onDelete={(product) => {
            setProductToDelete(product);
            setDeleteConfirmOpen(true);
          }}
          onDragEnd={handleDragEnd}
          cacheBuster={imageCacheBuster}
        />

        {/* Dialog de edición */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Editar Producto
              </DialogTitle>
            </DialogHeader>

            <ProductFormFields
              values={{
                name, description, price, categoryId,
                sku, material, purity, weightGrams, gender, featured,
                gemstones, sizes: editingSizes,
              }}
              set={(key, value) => {
                const map: Record<string, (v: any) => void> = {
                  name: setName, description: setDescription, price: setPrice, categoryId: setCategoryId,
                  sku: setSku, material: setMaterial, purity: setPurity, weightGrams: setWeightGrams,
                  gender: setGender, featured: setFeatured, gemstones: setGemstones, sizes: setEditingSizes,
                };
                map[key]?.(value);
              }}
              categories={categories}
              imagePreview={imagePreview}
              uploadingImage={uploadingImage}
              uploadProgress={uploadProgress}
              onSelectImage={(f) => {
                setImageFile(f);
                setImagePreview(URL.createObjectURL(f));
                setImageRemoved(false);
              }}
              onRemoveImage={() => {
                setImageFile(null);
                setImagePreview(null);
                setImageRemoved(true);
              }}
              galleryExisting={galleryImages.map((g) => ({ id: g.id, preview: g.preview }))}
              galleryNew={newGalleryFiles}
              onAddGalleryFiles={(files) =>
                setNewGalleryFiles([
                  ...newGalleryFiles,
                  ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f) })),
                ])
              }
              onRemoveGalleryExisting={(id) => {
                setDeletedGalleryIds([...deletedGalleryIds, id]);
                setGalleryImages(galleryImages.filter((i) => i.id !== id));
              }}
              onRemoveGalleryNew={(idx) => setNewGalleryFiles(newGalleryFiles.filter((_, i) => i !== idx))}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                onClick={closeEditor}
                variant="outline"
                className="border-2"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading || uploadingImage}
                className="bg-foreground hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95"
              >
                {loading || uploadingImage ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {uploadingImage ? 'Subiendo...' : 'Guardando...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Guardar
                  </div>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmación de eliminación */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                ¿Eliminar producto?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                ¿Estás seguro de que deseas eliminar <strong>{productToDelete?.name}</strong>? Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-2">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
              >
                {deleting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Eliminando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </div>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
};

export default ProductEdit;
