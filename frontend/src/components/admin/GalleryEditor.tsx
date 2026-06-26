import { X } from "lucide-react";

export interface ExistingImage {
  id: number;
  preview: string;
}

export interface NewImage {
  file: File;
  preview: string;
}

interface GalleryEditorProps {
  existing?: ExistingImage[];
  newFiles: NewImage[];
  onAddFiles: (files: File[]) => void;
  onRemoveExisting?: (id: number) => void;
  onRemoveNew: (index: number) => void;
  hint?: string;
}

const EMPTY_EXISTING: ExistingImage[] = [];

const GalleryEditor = ({
  existing = EMPTY_EXISTING,
  newFiles,
  onAddFiles,
  onRemoveExisting,
  onRemoveNew,
  hint = "Puedes subir varias imágenes para mostrar la pieza desde distintos ángulos.",
}: GalleryEditorProps) => {
  const hasItems = existing.length > 0 || newFiles.length > 0;

  return (
    <div className="space-y-2">
      <label htmlFor="gallery-upload" className="text-sm font-semibold text-gray-700">Galería de imágenes</label>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
        {hasItems && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {existing.map((img) => (
              <div key={`ex-${img.id}`} className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
                <img src={img.preview} alt="" className="h-full w-full object-cover" />
                {onRemoveExisting && (
                  <button
                    type="button"
                    onClick={() => onRemoveExisting(img.id)}
                    className="absolute top-1 right-1 rounded-full bg-red-500/90 text-white p-1 hover:bg-red-600"
                    aria-label="Eliminar imagen"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
            {newFiles.map((f, idx) => (
              <div key={f.preview} className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
                <img src={f.preview} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onRemoveNew(idx)}
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
          id="gallery-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;
            onAddFiles(files);
            e.target.value = "";
          }}
          className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-foreground hover:file:bg-accent/20 cursor-pointer"
        />
        <p className="text-xs text-gray-500 mt-2">{hint}</p>
      </div>
    </div>
  );
};

export default GalleryEditor;
