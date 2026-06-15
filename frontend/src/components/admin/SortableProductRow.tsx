import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { formatPrice } from "../../utils/formatPrice";

interface SortableProductRowProps {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (product: any) => void;
  cacheBuster: number;
}

const SortableProductRow = ({ product, onEdit, onDelete, cacheBuster }: SortableProductRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  });

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
};

export default SortableProductRow;
