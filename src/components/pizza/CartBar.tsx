import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/cart";
import { formatBRL } from "@/data/menu";
import { cn } from "@/lib/utils";

interface CartBarProps {
  onCheckout: () => void;
}

export function CartBar({ onCheckout }: CartBarProps) {
  const { itemCount, total } = useCart();
  const hasItems = itemCount > 0;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 transition-all duration-300",
        hasItems ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
      )}
    >
      <div className="mx-auto w-full max-w-6xl">
        <button
          onClick={onCheckout}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-primary/30 bg-card/90 p-2 pl-4 shadow-2xl backdrop-blur-md transition-transform active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                {itemCount}
              </span>
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">
                {itemCount} {itemCount === 1 ? "item" : "itens"}
              </p>
              <p className="font-display text-base font-extrabold text-foreground tabular-nums">
                {formatBRL(total)}
              </p>
            </div>
          </div>

          <span className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-display text-sm font-bold text-primary-foreground">
            Ver Carrinho
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </div>
    </div>
  );
}
