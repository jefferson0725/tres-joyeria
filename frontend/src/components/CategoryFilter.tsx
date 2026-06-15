import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "outline"}
          onClick={() => onCategoryChange(category)}
          className={
            activeCategory === category
              ? "bg-secondary text-white hover:bg-secondary/90"
              : "border-border bg-card text-foreground hover:bg-muted"
          }
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
