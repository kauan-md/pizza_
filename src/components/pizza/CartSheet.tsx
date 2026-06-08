import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCart } from "@/context/cart";
import { formatBRL } from "@/data/menu";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DELIVERY_FEE = 6.99;

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const navigate = useNavigate();
  const { items, total, itemCount, addItem, decrement, removeItem } =
    useCart();

  const grandTotal = itemCount > 0 ? total + DELIVERY_FEE : 0;

  const handleCheckout = () => {
    onOpenChange(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col bg-card sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle className="font-display text-xl font-extrabold">
            Seu Carrinho
          </SheetTitle>
        </SheetHeader>

        {itemCount === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <ShoppingBag className="h-12 w-12 opacity-40" />
            <p>Seu carrinho está vazio.</p>
          </div>
        ) : (
          <>
            <div className="-mx-2 flex-1 space-y-3 overflow-y-auto px-2 py-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-border bg-background p-2"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold leading-snug text-foreground">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label="Remover"
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {formatBRL(item.price * item.quantity)}
                    </span>
                    <div className="mt-auto flex items-center gap-2 self-start rounded-lg bg-secondary p-1">
                      <button
                        onClick={() => decrement(item.id)}
                        aria-label="Diminuir"
                        className="flex h-6 w-6 items-center justify-center rounded-md text-foreground transition-transform active:scale-90 hover:bg-background"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addItem(item)}
                        aria-label="Aumentar"
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground transition-transform active:scale-90"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SheetFooter className="border-t border-border pt-4">
              <div className="w-full space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatBRL(total)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxa de entrega</span>
                  <span className="tabular-nums">{formatBRL(DELIVERY_FEE)}</span>
                </div>
                <div className="flex justify-between pt-1 font-display text-base font-extrabold text-foreground">
                  <span>Total</span>
                  <span className="tabular-nums">{formatBRL(grandTotal)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="mt-3 w-full rounded-xl bg-primary py-3.5 font-display text-base font-bold text-primary-foreground transition-transform active:scale-95 hover:brightness-105"
              >
                Finalizar Pedido
              </button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
