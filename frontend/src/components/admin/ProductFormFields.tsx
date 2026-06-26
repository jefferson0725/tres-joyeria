import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GemstoneEditor, { GemstoneInput } from "@/components/admin/GemstoneEditor";
import GalleryEditor, { ExistingImage, NewImage } from "@/components/admin/GalleryEditor";
import SizeEditor, { SizeInput } from "@/components/admin/SizeEditor";
import ImageUploadField from "@/components/admin/ImageUploadField";
import CategorySelect, { CategoryOption } from "@/components/admin/CategorySelect";
import { formatPrice } from "../../utils/formatPrice";

export interface ProductFormValues {
  name: string;
  description: string;
  price: number | "";
  categoryId: string;
  sku: string;
  material: string;
  purity: string;
  weightGrams: number | "";
  gender: string;
  featured: boolean;
  gemstones: GemstoneInput[];
  sizes: SizeInput[];
}

interface ProductFormFieldsProps {
  values: ProductFormValues;
  set: <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => void;
  categories: CategoryOption[];

  // Image
  imagePreview: string | null;
  uploadingImage?: boolean;
  uploadProgress?: number;
  onSelectImage: (file: File) => void;
  onRemoveImage: () => void;

  // Gallery (existing only used in edit mode)
  galleryExisting?: ExistingImage[];
  galleryNew: NewImage[];
  onAddGalleryFiles: (files: File[]) => void;
  onRemoveGalleryExisting?: (id: number) => void;
  onRemoveGalleryNew: (idx: number) => void;
}

const ProductFormFields = ({
  values,
  set,
  categories,
  imagePreview,
  uploadingImage,
  uploadProgress = 0,
  onSelectImage,
  onRemoveImage,
  galleryExisting,
  galleryNew,
  onAddGalleryFiles,
  onRemoveGalleryExisting,
  onRemoveGalleryNew,
}: ProductFormFieldsProps) => (
  <div className="space-y-4 py-4">
    <div className="space-y-2">
      <label htmlFor="pf-name" className="text-sm font-semibold text-gray-700">Nombre *</label>
      <Input
        id="pf-name"
        value={values.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="Nombre del producto"
        className="h-12 border-2"
      />
    </div>

    <div className="space-y-2">
      <label htmlFor="pf-description" className="text-sm font-semibold text-gray-700">Descripción</label>
      <Textarea
        id="pf-description"
        value={values.description}
        onChange={(e) => set("description", e.target.value)}
        placeholder="Describe los detalles del producto, características, materiales, tallas disponibles, etc."
        className="min-h-24 text-base border-2 resize-none"
      />
      <p className="text-xs text-gray-500">{values.description.length}/500 caracteres</p>
    </div>

    <div className="space-y-2">
      <label htmlFor="pf-price" className="text-sm font-semibold text-gray-700">Precio *</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
        <Input
          id="pf-price"
          type="number"
          value={values.price}
          onChange={(e) => set("price", e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="0"
          min="0"
          step="1000"
          className="h-12 border-2 pl-7"
        />
      </div>
      {values.price !== "" && (
        <p className="text-xs text-gray-500">{formatPrice(Number(values.price))}</p>
      )}
    </div>

    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-700">Categoría</p>
      <CategorySelect categories={categories} value={values.categoryId} onChange={(v) => set("categoryId", v)} />
    </div>

    <ImageUploadField
      label="Imagen del Producto"
      preview={imagePreview}
      onSelect={onSelectImage}
      onRemove={onRemoveImage}
    />

    {uploadingImage && (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-700">Subiendo imagen...</span>
          <span className="text-gray-600">{uploadProgress}%</span>
        </div>
        <Progress value={uploadProgress} className="h-2" />
      </div>
    )}

    <GalleryEditor
      existing={galleryExisting}
      newFiles={galleryNew}
      onAddFiles={onAddGalleryFiles}
      onRemoveExisting={onRemoveGalleryExisting}
      onRemoveNew={onRemoveGalleryNew}
      hint="Imágenes adicionales desde distintos ángulos."
    />

    <div className="border-t-2 pt-4 mt-4">
      <h3 className="font-semibold text-gray-700 mb-3">Detalles de la pieza</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="pf-sku" className="text-xs font-semibold text-gray-700">SKU / Referencia</label>
          <Input
            id="pf-sku"
            value={values.sku}
            onChange={(e) => set("sku", e.target.value)}
            className="h-10 border-2"
            placeholder="TRES-A-001"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="pf-material" className="text-xs font-semibold text-gray-700">Material</label>
          <Input
            id="pf-material"
            value={values.material}
            onChange={(e) => set("material", e.target.value)}
            className="h-10 border-2"
            placeholder="Oro 18k, plata 925…"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="pf-purity" className="text-xs font-semibold text-gray-700">Pureza</label>
          <Input
            id="pf-purity"
            value={values.purity}
            onChange={(e) => set("purity", e.target.value)}
            className="h-10 border-2"
            placeholder="18k, 925…"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="pf-weight" className="text-xs font-semibold text-gray-700">Peso (g)</label>
          <Input
            id="pf-weight"
            type="number"
            step="0.01"
            min="0"
            value={values.weightGrams}
            onChange={(e) => set("weightGrams", e.target.value === "" ? "" : Number(e.target.value))}
            className="h-10 border-2"
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-700">Género</p>
          <Select
            value={values.gender || "_none"}
            onValueChange={(v) => set("gender", v === "_none" ? "" : v)}
          >
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
          <Checkbox
            id="edit-featured"
            checked={values.featured}
            onCheckedChange={(v) => set("featured", Boolean(v))}
          />
          <label htmlFor="edit-featured" className="text-xs font-semibold text-gray-700 cursor-pointer">
            Pieza destacada
          </label>
        </div>
      </div>
      <div className="mt-3">
        <GemstoneEditor gemstones={values.gemstones} onChange={(g) => set("gemstones", g)} />
      </div>
    </div>

    <div className="border-t-2 pt-4 mt-4">
      <h3 className="font-semibold text-gray-700 mb-3">Tallas / Longitudes</h3>
      <p className="text-xs text-gray-600 mb-3">
        Variantes disponibles. Ej: anillo 5/6/7, cadena 40/45/50cm…
      </p>
      <SizeEditor sizes={values.sizes} onChange={(s) => set("sizes", s)} />
    </div>
  </div>
);

export default ProductFormFields;
