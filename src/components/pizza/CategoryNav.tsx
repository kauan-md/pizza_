import { cn } from "@/lib/utils";
import type { CategoryDef } from "@/data/menu";

interface CategoryNavProps {
  categories: CategoryDef[];
  active: string;
  onChange: (category: string) => void;
}

export function CategoryNav({ categories, active, onChange }: CategoryNavProps) {
  return (
    <div className="sticky top-16 z-40 -mx-4 mt-6 bg-background/95 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto w-full max-w-6xl">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95",
                active === cat.id
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-secondary text-foreground hover:bg-secondary/70",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
