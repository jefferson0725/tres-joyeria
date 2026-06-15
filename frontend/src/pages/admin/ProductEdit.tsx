import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Pencil, X, Save, AlertCircle, Trash2, Image as ImageIcon, Search, GripVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import ScrollReveal from "@/components/ScrollReveal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { getToken } from "../../utils/tokenStore";
import { toast } from "../../hooks/use-toast";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../hooks/useAuth";
import { formatPrice } from "../../utils/formatPrice";

interface ProductSize {
  id?: number;
  size: string;
  price: number | "";
  image: string | null;
  imageFile?: File | null;
  imagePreview?: string | null;
}

interface SortableProductProps {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (product: any) => void;
  cacheBuster: number;
}

function SortableProduct({ product, onEdit, onDelete, cacheBuster }: SortableProductProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border-2 border-gray-100 rounded-xl p-4 sm:p-6 hover:border-accent/40 hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
    >
      <div className="flex items-start gap-4">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
          title="Arrastra para reordenar"
        >
          <GripVertical className="w-6 h-6 text-gray-400 hover:text-gray-600" />
        </div>

        {product.image && (
          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={`/images/${product.image}?v=${cacheBuster}`}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{product.name}</h3>
          <p className="text-base sm:text-lg font-semibold text-foreground mb-1">
            {formatPrice(product.price)}
          </p>
          <p className="text-sm text-gray-600">
            Categoría: {product.category?.name || "Sin categoría"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => onEdit(product)}
            className="flex-shrink-0 bg-foreground hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95"
            size="sm"
          >
            <Pencil className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button
            onClick={() => onDelete(product)}
            variant="destructive"
            className="flex-shrink-0 hover:scale-105 active:scale-95 transition-all"
            size="sm"
          >
            <Trash2 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Eliminar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

const ProductEdit: React.FC = () => {
  const { user } = useAuth();
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
  const [gemstonesText, setGemstonesText] = useState("");

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
    setGemstonesText(
      Array.isArray(p.gemstones)
        ? JSON.stringify(p.gemstones, null, 2)
        : typeof p.gemstones === "string"
          ? p.gemstones
          : "",
    );
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
    setGemstonesText("");
  };

  const addSize = () => {
    setEditingSizes([...editingSizes, { size: "", price: "", image: null, imageFile: null, imagePreview: null }]);
  };

  const removeSize = (index: number) => {
    setEditingSizes(editingSizes.filter((_, i) => i !== index));
  };

  const updateSize = (index: number, field: keyof ProductSize, value: any) => {
    const newSizes = [...editingSizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setEditingSizes(newSizes);
  };

  const handleSizeImageChange = (index: number, file: File | null) => {
    if (file) {
      console.log(`Image selected for size ${index + 1}:`, file.name, file.size);
      const preview = URL.createObjectURL(file);
      // Update both fields in a single state update to avoid race conditions
      setEditingSizes(prev => {
        const newSizes = [...prev];
        newSizes[index] = { 
          ...newSizes[index], 
          imageFile: file, 
          imagePreview: preview 
        };
        return newSizes;
      });
      console.log(`Size ${index + 1} imageFile updated`);
    }
  };

  const uploadSizeImage = async (sizeIndex: number, productId: number) => {
    const size = editingSizes[sizeIndex];
    if (!size.imageFile) return null;

    try {
      const ext = size.imageFile.name.split('.').pop() || 'jpg';
      const sanitizedSize = size.size.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
      const filename = `${productId}-size-${sanitizedSize}.${ext}`;

      const form = new FormData();
      form.append("filename", filename);
      form.append("image", size.imageFile);

      const API_ROOT = import.meta.env.VITE_API_URL ?? "";
      const token = getToken();
      const uploadRes = await axios.post(
        `${API_ROOT}/api/uploads/frontend`,
        form,
        {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        }
      );

      return uploadRes.data.filename || filename;
    } catch (err: any) {
      console.error("Error uploading size image:", err);
      throw err;
    }
  };

  const saveSizes = async (productId: number) => {
    // Get IDs of sizes currently being edited
    const currentSizeIds = new Set(editingSizes.filter(s => s.id).map(s => s.id));

    // Delete sizes that were removed (exist in original but not in current)
    if (editing && editing.sizes) {
      for (const existing of editing.sizes) {
        if (!currentSizeIds.has(existing.id)) {
          console.log(`Deleting removed size ID: ${existing.id}`);
          const res = await apiFetch(`/api/product-sizes/${existing.id}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            const data = await res.json();
            console.error(`Error deleting size ${existing.id}:`, data.error);
          }
        }
      }
    }

    // Create or update remaining sizes
    for (let i = 0; i < editingSizes.length; i++) {
      const size = editingSizes[i];

      if (!size.size || size.price === "") {
        throw new Error(`Tamaño ${i + 1}: Completa el nombre y precio`);
      }

      let imageFilename = size.image || null;
      
      // Si se seleccionó un nuevo archivo, súbelo
      if (size.imageFile) {
        imageFilename = await uploadSizeImage(i, productId);
      } else if (size.imagePreview === null && size.image) {
        // Si se eliminó la imagen (imagePreview es null pero había una imagen)
        imageFilename = null;
      }

      if (size.id) {
        // Update existing
        const res = await apiFetch(`/api/product-sizes/${size.id}`, {
          method: "PUT",
          body: JSON.stringify({
            size: size.size.trim(),
            price: Number(size.price),
            image: imageFilename,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Error actualizando tamaño ${i + 1}`);
        }
      } else {
        // Create new
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
          throw new Error(data.error || `Error creando tamaño ${i + 1}`);
        }
      }
    }
  };

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      if (gemstonesText.trim()) {
        try {
          const parsed = JSON.parse(gemstonesText);
          payload.gemstones = JSON.stringify(parsed);
        } catch {
          throw new Error("El JSON de piedras no es válido");
        }
      } else {
        payload.gemstones = null;
      }

      // If new image selected, upload first
      if (imageFile) {
        setUploadingImage(true);
        setUploadProgress(0);
        const API_ROOT = import.meta.env.VITE_API_URL ?? "";
        const token = getToken();
        const t = toast({ title: "Guardando imagen", description: `0%` });

        // Generate filename with product ID and name
        const ext = imageFile.name.split('.').pop() || 'jpg';
        const sanitizedName = name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 60);
        const filename = `${editing.id}-${sanitizedName}.${ext}`;

        try {
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

        {products.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 border-2 pl-12 text-base"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {products.filter((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).length} de {products.length} productos
            </p>
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No hay productos para editar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products
              .filter((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No hay productos que coincidan con tu búsqueda</p>
              </div>
            ) : searchQuery === "" ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={products.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {products.map((p, index) => (
                    <ScrollReveal key={p.id} delay={Math.min(index * 0.05, 0.3)}>
                      <SortableProduct
                        product={p}
                        onEdit={openEditor}
                        onDelete={(product) => {
                          setProductToDelete(product);
                          setDeleteConfirmOpen(true);
                        }}
                        cacheBuster={imageCacheBuster}
                      />
                    </ScrollReveal>
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              products
                .filter((p) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((p, index) => (
              <ScrollReveal key={p.id} delay={Math.min(index * 0.05, 0.3)}>
              <div
                className="bg-white border-2 border-gray-100 rounded-xl p-4 sm:p-6 hover:border-accent/40 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  {p.image && (
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={`/images/${p.image}`} 
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{p.name}</h3>
                    <p className="text-base sm:text-lg font-semibold text-foreground mb-1">
                      {formatPrice(p.price)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Categoría: {p.category?.name || "Sin categoría"}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => openEditor(p)}
                      className="flex-shrink-0 bg-foreground hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95"
                      size="sm"
                    >
                      <Pencil className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                    <Button
                      onClick={() => {
                        setProductToDelete(p);
                        setDeleteConfirmOpen(true);
                      }}
                      variant="destructive"
                      className="flex-shrink-0 hover:scale-105 active:scale-95 transition-all"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </Button>
                  </div>
                </div>
              </div>
              </ScrollReveal>
                ))
            )}
          </div>
        )}

        {/* Dialog de edición */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Editar Producto
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nombre *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del producto"
                  className="h-12 border-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Descripción</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe los detalles del producto, características, materiales, tallas disponibles, etc."
                  className="min-h-24 text-base border-2 resize-none"
                />
                <p className="text-xs text-gray-500">{description.length}/500 caracteres</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Precio *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    $
                  </span>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="1000"
                    className="h-12 border-2 pl-7"
                  />
                </div>
                {price !== "" && (
                  <p className="text-xs text-gray-500">
                    {formatPrice(Number(price))}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Categoría</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
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

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Imagen del Producto</label>
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
                          setImageRemoved(true);
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
                        setImageRemoved(false);
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

              {/* Jewelry-specific fields */}
              <div className="border-t-2 pt-4 mt-4">
                <h3 className="font-semibold text-gray-700 mb-3">Detalles de la pieza</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">SKU / Referencia</label>
                    <Input value={sku} onChange={(e) => setSku(e.target.value)} className="h-10 border-2" placeholder="TRES-A-001" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Material</label>
                    <Input value={material} onChange={(e) => setMaterial(e.target.value)} className="h-10 border-2" placeholder="Oro 18k, plata 925…" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Pureza</label>
                    <Input value={purity} onChange={(e) => setPurity(e.target.value)} className="h-10 border-2" placeholder="18k, 925…" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Peso (g)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={weightGrams}
                      onChange={(e) => setWeightGrams(e.target.value === "" ? "" : Number(e.target.value))}
                      className="h-10 border-2"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Género</label>
                    <Select value={gender || "_none"} onValueChange={(v) => setGender(v === "_none" ? "" : v)}>
                      <SelectTrigger className="h-10 border-2">
                        <SelectValue placeholder="Sin especificar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">Sin especificar</SelectItem>
                        <SelectItem value="mujer">Mujer</SelectItem>
                        <SelectItem value="hombre">Hombre</SelectItem>
                        <SelectItem value="unisex">Unisex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <Checkbox id="edit-featured" checked={featured} onCheckedChange={(v) => setFeatured(Boolean(v))} />
                    <label htmlFor="edit-featured" className="text-xs font-semibold text-gray-700 cursor-pointer">
                      Pieza destacada
                    </label>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs font-semibold text-gray-700">Piedras (JSON)</label>
                  <Textarea
                    value={gemstonesText}
                    onChange={(e) => setGemstonesText(e.target.value)}
                    className="min-h-20 text-xs font-mono border-2"
                    placeholder='[{"type":"diamante","carat":0.25,"count":1}]'
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Formato: array de objetos {`{type, carat?, count?}`}.</p>
                </div>
              </div>

              {/* Variants / sizes Section */}
              <div className="border-t-2 pt-4 mt-4">
                <h3 className="font-semibold text-gray-700 mb-3">Tallas / Longitudes</h3>
                <p className="text-xs text-gray-600 mb-3">Variantes disponibles. Ej: anillo 5/6/7, cadena 40/45/50cm…</p>

                {editingSizes.map((size, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm text-gray-800">Tamaño {index + 1}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSize(index)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">Tamaño *</label>
                        <Input
                          type="text"
                          placeholder="Ej: S, M, L, XL"
                          value={size.size}
                          onChange={(e) => updateSize(index, "size", e.target.value)}
                          className="h-9 text-sm border-2"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">Precio *</label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                          <Input
                            type="number"
                            placeholder="0"
                            value={size.price}
                            onChange={(e) => updateSize(index, "price", e.target.value === "" ? "" : Number(e.target.value))}
                            min="0"
                            step="1000"
                            className="h-9 text-sm border-2 pl-6"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">Imagen para este tamaño</label>
                      <div className="border-2 border-dashed border-gray-300 rounded p-2 hover:border-accent transition-colors">
                        {size.imagePreview ? (
                          <div className="relative">
                            <img 
                              src={size.imagePreview} 
                              alt="size preview" 
                              className="w-full max-h-32 object-contain rounded mb-1"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                updateSize(index, "imageFile", null);
                                updateSize(index, "imagePreview", null);
                                updateSize(index, "image", null);
                              }}
                              className="absolute top-0 right-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 text-center py-2">Selecciona una imagen</p>
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
                  className="w-full border-2 border-dashed text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir tamaño
                </Button>
              </div>
            </div>

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
