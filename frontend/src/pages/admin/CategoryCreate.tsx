import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { PlusCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import apiFetch from "../../utils/api";
import AdminRoute from "../../components/AdminRoute";
import { toast } from "../../hooks/use-toast";

interface CategoryFormData {
  name: string;
  description: string;
  parentId: string;
}

const CategoryCreate: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>({
    defaultValues: { name: "", description: "", parentId: "" }
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    apiFetch("/api/categories")
      .then((r) => r.json())
      .then((data: any[]) => setParentCategories((data || []).filter((c) => !c.parentId)))
      .catch(() => {});
  }, []);

  const onSubmit = async (data: CategoryFormData) => {
    setError(null);
    setLoading(true);
    try {
      if (!data.name || !data.name.trim()) {
        setError("El nombre es requerido");
        toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" });
        return;
      }
      const payload: any = { name: data.name.trim(), description: data.description };
      if (data.parentId) payload.parentId = Number(data.parentId);
      const res = await apiFetch(`/api/categories`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Error creando categoria");
      
      toast({ title: "Categoría creada", description: resData.name || "La categoría ha sido creada exitosamente" });
      reset(); // Reset form using React Hook Form
    } catch (err: any) {
      setError(err.message || "Error");
      toast({ title: "Error", description: err.message || "Error al crear categoría", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Crear Categoría
          </h2>
          <p className="text-gray-600 mt-1">Agrega una nueva categoría para organizar tus productos</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Nombre de la Categoría *</label>
            <Input
              type="text"
              placeholder="Ej: Anillos de Oro, Piedras Naturales..."
              {...register("name", { required: true })}
              className="h-12 text-base border-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Categoría Padre (Opcional)</label>
            <select
              {...register("parentId")}
              className="w-full h-12 px-3 text-sm border-2 border-gray-200 rounded-md bg-white text-gray-800 focus:outline-none focus:border-gray-800"
            >
              <option value="">— Sin categoría padre (categoría principal)</option>
              {parentCategories.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400">Selecciona una categoría padre para crear una subcategoría</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Descripción (Opcional)</label>
            <Textarea
              placeholder="Describe brevemente esta categoría..."
              {...register("description")}
              rows={3}
              className="text-base border-2 resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto h-12 text-base font-semibold bg-foreground hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Crear Categoría
              </div>
            )}
          </Button>
        </form>
      </div>
    </AdminRoute>
  );
};

export default CategoryCreate;
