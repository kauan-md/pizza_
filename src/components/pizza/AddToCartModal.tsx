import { X, Plus, Check, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useCart } from "@/context/cart";
import { formatBRL, type Product } from "@/data/menu";
import { toast } from "sonner";

interface Props {
  product: Product;
  open: boolean;
  onClose: () => void;
}

function mapProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    oldPrice: p.old_price ?? undefined,
    category: p.category_id,
    tag: p.tag ?? undefined,
    image: p.image,
  };
}

export function AddToCartModal({ product, open, onClose }: Props) {
  const { addItem } = useCart();
  const [mode, setMode] = useState<"choice" | "halfhalf">("choice");
  const [secondProduct, setSecondProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!open) return;
    setMode("choice");
    setSecondProduct(null);
    getSupabase()
      .from("products")
      .select("id, name, description, price, old_price, category_id, tag, image")
      .eq("available", true)
      .order("created_at")
      .then(({ data }) => setAllProducts((data ?? []).map(mapProduct)));
  }, [open]);

  function addWhole() {
    addItem(product);
    toast.success(`${product.name} adicionado ao carrinho`);
    onClose();
  }

  function addHalfHalf() {
    if (!secondProduct) return;
    const price = Math.max(product.price, secondProduct.price);
    addItem({
      id: `montada-${Date.now()}`,
      name: `½ ${product.name} + ½ ${secondProduct.name}`,
      description: `Meio a meio: ${product.name} + ${secondProduct.name}`,
      price,
      oldPrice: undefined,
      category: "montada",
      tag: "Montada",
      image: product.image,
    });
    toast.success("Pizza montada adicionada ao carrinho");
    onClose();
  }

  const otherProducts = allProducts.filter((p) => p.id !== product.id && p.category !== "bebidas" && p.category !== "ofertas");

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-lg animate-slide-up sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
        <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl">
          <div className="relative flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-display text-base font-bold text-foreground">
              {mode === "choice" ? "Personalizar" : "Escolher 2º sabor"}
            </h3>
            <button onClick={onClose} className="rounded-lg p-1 hover:bg-secondary">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Selected product preview */}
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-background p-3">
              <img src={product.image} alt={product.name} className="h-14 w-14 rounded-lg object-cover" />
              <div>
                <p className="font-semibold text-foreground">{product.name}</p>
                <p className="text-sm text-primary font-bold">{formatBRL(product.price)}</p>
              </div>
            </div>

            {mode === "choice" && (
              <div className="space-y-3">
                <button
                  onClick={addWhole}
                  className="flex w-full items-center justify-between rounded-xl border-2 border-primary/30 bg-primary/5 p-4 text-left transition-all hover:border-primary hover:bg-primary/10"
                >
                  <div>
                    <p className="font-bold text-foreground">Pizza inteira</p>
                    <p className="text-xs text-muted-foreground">1 sabor · {formatBRL(product.price)}</p>
                  </div>
                  <Check className="h-5 w-5 text-primary" />
                </button>

                {product.category !== "ofertas" && (
                  <button
                    onClick={() => setMode("halfhalf")}
                    className="flex w-full items-center justify-between rounded-xl border-2 border-border p-4 text-left transition-all hover:border-primary/50"
                  >
                    <div>
                      <p className="font-bold text-foreground">Meio a meio</p>
                      <p className="text-xs text-muted-foreground">2 sabores · preço do mais caro</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                )}
              </div>
            )}

            {mode === "halfhalf" && (
              <div>
                <p className="mb-3 text-sm text-muted-foreground">
                  1º sabor: <span className="font-semibold text-foreground">{product.name}</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {otherProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSecondProduct(p)}
                      className={`group relative overflow-hidden rounded-xl border text-left transition-all ${
                        secondProduct?.id === p.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                      <div className="p-2">
                        <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-primary font-bold">{formatBRL(p.price)}</p>
                      </div>
                      {secondProduct?.id === p.id && (
                        <div className="absolute right-1.5 top-1.5 rounded-full bg-primary p-0.5">
                          <Check className="h-3.5 w-3.5 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-4">
            {mode === "halfhalf" ? (
              <button
                onClick={addHalfHalf}
                disabled={!secondProduct}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {secondProduct
                  ? `Adicionar · ${formatBRL(Math.max(product.price, secondProduct.price))}`
                  : "Selecione o 2º sabor"}
              </button>
            ) : (
              <button
                onClick={addWhole}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-primary-foreground transition-transform active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                Adicionar · {formatBRL(product.price)}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        @media (min-width: 640px) {
          .animate-slide-up { animation: fade-in 0.2s ease-out; }
        }
      `}</style>
    </>
  );
}
