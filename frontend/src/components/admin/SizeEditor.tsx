import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SizeInput {
  id?: number;
  _key?: number;
  size: string;
  price: number | "";
  image?: string | null;
  imageFile?: File | null;
  imagePreview?: string | null;
}

interface SizeEditorProps {
  sizes: SizeInput[];
  onChange: (sizes: SizeInput[]) => void;
  /** Función para resolver una imagen guardada en backend a URL pública. */
  resolveImageUrl?: (filename: string) => string;
}

const defaultResolve = (f: string) => `/images/${f}`;

const SizeEditor = ({ sizes, onChange, resolveImageUrl = defaultResolve }: SizeEditorProps) => {
  const update = (idx: number, patch: Partial<SizeInput>) => {
    onChange(sizes.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const add = () =>
    onChange([
      ...sizes,
      { _key: Date.now(), size: "", price: "", image: null, imageFile: null, imagePreview: null },
    ]);

  const remove = (idx: number) => onChange(sizes.filter((_, i) => i !== idx));

  const previewFor = (s: SizeInput): string | null =>
    s.imagePreview || (s.image ? resolveImageUrl(s.image) : null);

  return (
    <div className="space-y-3">
      {sizes.map((size, index) => {
        const preview = previewFor(size);
        return (
          <div key={size.id ?? size._key ?? index} className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-sm text-gray-800">Tamaño {index + 1}</h4>
              <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                <Trash2 className="w-3 h-3 mr-1" />
                Eliminar
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor={`size-name-${index}`} className="text-xs font-semibold text-gray-700 mb-1 block">Tamaño *</label>
                <Input
                  id={`size-name-${index}`}
                  type="text"
                  placeholder='Ej: "6", "40cm"'
                  value={size.size}
                  onChange={(e) => update(index, { size: e.target.value })}
                  className="h-9 text-sm border-2"
                />
              </div>
              <div>
                <label htmlFor={`size-price-${index}`} className="text-xs font-semibold text-gray-700 mb-1 block">Precio *</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <Input
                    id={`size-price-${index}`}
                    type="number"
                    placeholder="0"
                    value={size.price === "" ? "" : size.price}
                    onChange={(e) =>
                      update(index, { price: e.target.value === "" ? "" : Number(e.target.value) })
                    }
                    min="0"
                    step="1000"
                    className="h-9 text-sm border-2 pl-6"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor={`size-img-${index}`} className="text-xs font-semibold text-gray-700 mb-1 block">
                Imagen para esta variante
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-accent transition-colors">
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt={`talla ${index + 1}`}
                      className="w-full max-h-40 object-contain rounded mb-2"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        update(index, {
                          imageFile: null,
                          imagePreview: null,
                          image: null,
                        })
                      }
                      className="absolute top-1 right-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 text-center mb-2">Selecciona una imagen</p>
                )}
                <input
                  id={`size-img-${index}`}
                  aria-label="Imagen para esta variante"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    if (f) {
                      update(index, {
                        imageFile: f,
                        imagePreview: URL.createObjectURL(f),
                      });
                    }
                  }}
                  className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-foreground"
                />
              </div>
            </div>
          </div>
        );
      })}

      <Button type="button" onClick={add} variant="outline" className="w-full border-2 border-dashed">
        <Plus className="w-4 h-4 mr-2" />
        Añadir otra variante
      </Button>
    </div>
  );
};

export default SizeEditor;
