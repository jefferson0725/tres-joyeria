export interface CategoryOption {
  id: number;
  name: string;
  parentId?: number | null;
}

interface CategorySelectProps {
  categories: CategoryOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

const CategorySelect = ({
  categories,
  value,
  onChange,
  required = false,
  className = "w-full h-12 px-3 text-sm border-2 border-gray-200 rounded-md bg-white text-gray-800 focus:outline-none focus:border-gray-800",
}: CategorySelectProps) => {
  const parents = categories.filter((c) => !c.parentId);
  const childrenOf = (pid: number) => categories.filter((c) => c.parentId === pid);

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} required={required} className={className}>
      <option value="0">Sin categoría</option>
      {parents.map((p) => {
        const subs = childrenOf(p.id);
        return subs.length > 0 ? (
          <optgroup key={p.id} label={p.name}>
            {subs.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </optgroup>
        ) : (
          <option key={p.id} value={String(p.id)}>
            {p.name}
          </option>
        );
      })}
    </select>
  );
};

export default CategorySelect;
