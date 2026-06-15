import { Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadFieldProps {
  label?: string;
  preview: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  compact?: boolean;
}

const ImageUploadField = ({
  label = "Imagen principal",
  preview,
  onSelect,
  onRemove,
  compact = false,
}: ImageUploadFieldProps) => (
  <div className="space-y-2">
    {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
    <div
      className={`border-2 border-dashed border-gray-300 rounded-${compact ? "lg" : "xl"} ${compact ? "p-3" : "p-6"} hover:border-accent transition-colors`}
    >
      {preview ? (
        <div className="relative mb-4">
          <img
            src={preview}
            alt="preview"
            className={`w-full ${compact ? "max-h-40" : "max-h-64"} object-contain rounded-lg`}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
            className="absolute top-2 right-2"
          >
            <X className="w-4 h-4 mr-1" />
            {compact ? null : "Quitar"}
          </Button>
        </div>
      ) : (
        <div className={`text-center ${compact ? "" : "mb-4"}`}>
          {!compact && <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />}
          <p className={`${compact ? "text-xs" : "text-sm"} text-gray-${compact ? "500" : "600"}`}>
            {compact ? "Selecciona una imagen" : "Arrastra una imagen o haz clic para seleccionar"}
          </p>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files && e.target.files[0];
          if (f) onSelect(f);
        }}
        className={`w-full ${compact ? "text-xs" : "text-sm"} text-gray-600 file:mr-${compact ? "2" : "4"} file:py-${compact ? "1" : "2"} file:px-${compact ? "2" : "4"} file:rounded-${compact ? "" : "full"} file:border-0 file:${compact ? "text-xs" : "text-sm"} file:font-semibold file:bg-accent/10 file:text-foreground hover:file:bg-accent/20 cursor-pointer`}
      />
    </div>
  </div>
);

export default ImageUploadField;
