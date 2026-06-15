import { Pencil, Search, Trash2 } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScrollReveal from "@/components/ScrollReveal";
import SortableProductRow from "@/components/admin/SortableProductRow";
import { formatPrice } from "../../utils/formatPrice";

interface ProductListProps {
  products: any[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onEdit: (product: any) => void;
  onDelete: (product: any) => void;
  onDragEnd: (event: DragEndEvent) => void;
  cacheBuster: number;
}

const ProductList = ({
  products,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  onDragEnd,
  cacheBuster,
}: ProductListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const matchesQuery = (p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.name.toLowerCase().includes(searchQuery.toLowerCase());

  const filtered = products.filter(matchesQuery);

  return (
    <>
      {products.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre o categoría..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-12 border-2 pl-12 text-base"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {filtered.length} de {products.length} productos
          </p>
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No hay productos para editar</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No hay productos que coincidan con tu búsqueda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {searchQuery === "" ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext
                items={products.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {products.map((p, index) => (
                  <ScrollReveal key={p.id} delay={Math.min(index * 0.05, 0.3)}>
                    <SortableProductRow
                      product={p}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      cacheBuster={cacheBuster}
                    />
                  </ScrollReveal>
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            filtered.map((p, index) => (
              <ScrollReveal key={p.id} delay={Math.min(index * 0.05, 0.3)}>
                <div className="bg-white border-2 border-gray-100 rounded-xl p-4 sm:p-6 hover:border-accent/40 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    {p.image && (
                      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100">
                        <img src={`/images/${p.image}`} alt={p.name} className="w-full h-full object-cover" />
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
                        onClick={() => onEdit(p)}
                        className="flex-shrink-0 bg-foreground hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95"
                        size="sm"
                      >
                        <Pencil className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                      <Button
                        onClick={() => onDelete(p)}
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
    </>
  );
};

export default ProductList;
