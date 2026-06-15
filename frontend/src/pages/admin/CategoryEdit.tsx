import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Edit, X, Save, AlertCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import apiFetch from "../../utils/api";
import { toast } from "../../hooks/use-toast";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../hooks/useAuth";

interface CategoryFormData {
  name: string;
  description: string;
  parentId: string;
}

const CategoryEdit: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<CategoryFormData>({
    defaultValues: { name: "", description: "", parentId: "" }
  });

  const loadCategories = async () => {
    setError(null);
    try {
      const res = await apiFetch('/api/categories');
      if (!res.ok) throw new Error('Error loading categories');
      const data = await res.json();
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message || "Error");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openEditor = (category: any) => {
    setEditing(category);
    setValue("name", category.name || "");
    setValue("description", category.description || "");
    setValue("parentId", category.parentId ? String(category.parentId) : "");
  };

  const closeEditor = () => {
    setEditing(null);
    reset();
  };

  const onSubmit = async (data: CategoryFormData) => {
    if (!editing) return;
    setError(null);
    setLoading(true);

    try {
      const payload: any = {};
      if (data.name && data.name !== editing.name) payload.name = data.name;
      if (data.description !== editing.description) payload.description = data.description;
      const newParentId = data.parentId ? Number(data.parentId) : null;
      if (newParentId !== (editing.parentId ?? null)) payload.parentId = newParentId;

      const res = await apiFetch(`/api/categories/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Error actualizando categoría");

      toast({ title: "Categoría actualizada", description: "Los cambios se han guardado correctamente" });
      closeEditor();
      await loadCategories();
    } catch (err: any) {
      setError(err.message || "Error al actualizar");
      toast({ title: "Error", description: err.message || "Error al actualizar categoría", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Editar Categorías
          </h2>
          <p className="text-gray-600 mt-1">Modifica las categorías existentes</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4 animate-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {categories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 animate-in fade-in">
            <p className="text-gray-500 text-lg">No hay categorías para editar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Parent categories */}
            {categories.filter((c) => !c.parentId).map((parent, index) => {
              const children = categories.filter((c) => c.parentId === parent.id);
              return (
                <div key={parent.id}>
                  <div
                    className="bg-white border-2 border-gray-100 rounded-xl p-4 sm:p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200 animate-in fade-in slide-in-from-left-4"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-800">{parent.name}</h3>
                        {parent.description && <p className="text-xs text-gray-500 mt-0.5">{parent.description}</p>}
                        {children.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">{children.length} subcategoría{children.length !== 1 ? "s" : ""}</p>
                        )}
                      </div>
                      <Button onClick={() => openEditor(parent)} size="sm" className="flex-shrink-0 bg-foreground hover:bg-foreground/90">
                        <Pencil className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Editar</span>
                      </Button>
                    </div>
                  </div>
                  {/* Subcategories */}
                  {children.map((child) => (
                    <div key={child.id}
                      className="ml-6 border-l-2 border-gray-100 pl-4 mt-1"
                    >
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 sm:p-4 hover:border-gray-300 transition-all flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-gray-400 uppercase tracking-wider">Subcategoría de {parent.name}</span>
                          <h4 className="text-sm font-semibold text-gray-700">{child.name}</h4>
                          {child.description && <p className="text-xs text-gray-400">{child.description}</p>}
                        </div>
                        <Button onClick={() => openEditor(child)} size="sm" variant="outline" className="flex-shrink-0 border-gray-200">
                          <Pencil className="w-3 h-3 sm:mr-1" /><span className="hidden sm:inline text-xs">Editar</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        <Dialog open={!!editing} onOpenChange={(open) => !open && closeEditor()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Editar Categoría
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nombre *</label>
                <Input
                  {...register("name", { required: true })}
                  placeholder="Nombre de la categoría"
                  className="h-12 border-2"
                />
              </div>

              {/* Parent select — only show if editing has no children */}
              {editing && categories.filter((c) => c.parentId === editing.id).length === 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Categoría Padre</label>
                  <select
                    {...register("parentId")}
                    className="w-full h-10 px-3 text-sm border-2 border-gray-200 rounded-md bg-white text-gray-800 focus:outline-none focus:border-gray-800"
                  >
                    <option value="">— Sin categoría padre (principal)</option>
                    {categories.filter((c) => !c.parentId && c.id !== editing?.id).map((c) => (
                      <option key={c.id} value={String(c.id)}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Descripción</label>
                <Textarea
                  {...register("description")}
                  placeholder="Descripción de la categoría"
                  rows={3}
                  className="border-2 resize-none"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  onClick={closeEditor}
                  variant="outline"
                  className="border-2"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-foreground hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Guardar
                    </div>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
};

export default CategoryEdit;
