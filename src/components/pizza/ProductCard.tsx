import { Plus } from "lucide-react";
import { useCart } from "@/context/cart";
import { formatBRL, type Product } from "@/data/menu";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:scale-[1.02] hover:border-primary/60">
      <div className="relative aspect-square w-full overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.tag && (
          <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
            {product.tag}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base font-bold leading-snug text-foreground">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatBRL(product.oldPrice)}
              </span>
            )}
            <span className="font-display text-lg font-extrabold text-primary">
              {formatBRL(product.price)}
            </span>
          </div>

          <button
            onClick={() => addItem(product)}
            aria-label={`Adicionar ${product.name}`}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-transform active:scale-95 hover:brightness-105"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
