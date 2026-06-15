import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface GemstoneInput {
  type: string;
  carat?: number | "";
  count?: number | "";
}

interface GemstoneEditorProps {
  gemstones: GemstoneInput[];
  onChange: (gems: GemstoneInput[]) => void;
  label?: string;
}

const GemstoneEditor = ({ gemstones, onChange, label = "Piedras / gemas" }: GemstoneEditorProps) => {
  const update = (idx: number, patch: Partial<GemstoneInput>) => {
    onChange(gemstones.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
  };

  const add = () => onChange([...gemstones, { type: "", carat: "", count: "" }]);
  const remove = (idx: number) => onChange(gemstones.filter((_, i) => i !== idx));

  const numericValue = (v: number | "" | undefined): string =>
    v === undefined || v === "" ? "" : String(v);

  const parseNumeric = (raw: string): number | "" => (raw === "" ? "" : Number(raw));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="w-4 h-4 mr-1" /> Añadir piedra
        </Button>
      </div>

      {gemstones.length === 0 && <p className="text-xs text-gray-500">Sin piedras añadidas.</p>}

      <div className="space-y-2">
        {gemstones.map((gem, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-2 rounded">
            <div className="col-span-5">
              <label className="text-xs text-gray-600">Tipo</label>
              <Input
                placeholder="Diamante, rubí…"
                value={gem.type}
                onChange={(e) => update(idx, { type: e.target.value })}
                className="h-9 border-2"
              />
            </div>
            <div className="col-span-3">
              <label className="text-xs text-gray-600">Quilates</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.25"
                value={numericValue(gem.carat)}
                onChange={(e) => update(idx, { carat: parseNumeric(e.target.value) })}
                className="h-9 border-2"
              />
            </div>
            <div className="col-span-3">
              <label className="text-xs text-gray-600">Cantidad</label>
              <Input
                type="number"
                step="1"
                placeholder="1"
                value={numericValue(gem.count)}
                onChange={(e) => update(idx, { count: parseNumeric(e.target.value) })}
                className="h-9 border-2"
              />
            </div>
            <div className="col-span-1">
              <Button type="button" variant="destructive" size="sm" onClick={() => remove(idx)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GemstoneEditor;
