import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";

interface AttributeFiltersProps {
  availableGemstones: string[];
  availableMaterials: string[];
  activeGemstones: string[];
  activeMaterials: string[];
  onToggleGemstone: (g: string) => void;
  onToggleMaterial: (m: string) => void;
  onClear: () => void;
}

const Chip = ({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] uppercase tracking-[0.12em] font-medium border rounded-full transition-all ${
      active
        ? "bg-accent/10 border-accent text-accent"
        : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
    }`}
  >
    {label}
    {active && <X className="w-3 h-3" />}
  </button>
);

const AttributeFilters = ({
  availableGemstones,
  availableMaterials,
  activeGemstones,
  activeMaterials,
  onToggleGemstone,
  onToggleMaterial,
  onClear,
}: AttributeFiltersProps) => {
  const [open, setOpen] = useState(false);

  const hasOptions = availableGemstones.length > 0 || availableMaterials.length > 0;
  const hasActive = activeGemstones.length + activeMaterials.length > 0;

  if (!hasOptions) return null;

  return (
    <div className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-4 py-3">
          <button
            onClick={() => setOpen((v) => !v)}
            className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-medium transition-colors ${
              hasActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtros
            {hasActive && (
              <span className="inline-flex items-center justify-center w-4 h-4 text-[9px] rounded-full bg-accent text-white font-bold">
                {activeGemstones.length + activeMaterials.length}
              </span>
            )}
            {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Active filter summary when collapsed */}
          {!open && hasActive && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
              {activeGemstones.map((g) => (
                <Chip key={g} label={g} active onToggle={() => onToggleGemstone(g)} />
              ))}
              {activeMaterials.map((m) => (
                <Chip key={m} label={m} active onToggle={() => onToggleMaterial(m)} />
              ))}
              <button
                onClick={onClear}
                className="whitespace-nowrap text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors ml-1"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>

        {/* Expanded panel */}
        {open && (
          <div className="pb-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            {availableGemstones.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Piedras</p>
                <div className="flex flex-wrap gap-2">
                  {availableGemstones.map((g) => (
                    <Chip
                      key={g}
                      label={g}
                      active={activeGemstones.includes(g)}
                      onToggle={() => onToggleGemstone(g)}
                    />
                  ))}
                </div>
              </div>
            )}

            {availableMaterials.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Material</p>
                <div className="flex flex-wrap gap-2">
                  {availableMaterials.map((m) => (
                    <Chip
                      key={m}
                      label={m}
                      active={activeMaterials.includes(m)}
                      onToggle={() => onToggleMaterial(m)}
                    />
                  ))}
                </div>
              </div>
            )}

            {hasActive && (
              <button
                onClick={() => { onClear(); setOpen(false); }}
                className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttributeFilters;
