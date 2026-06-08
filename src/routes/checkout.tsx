import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Zap, ArrowLeft, ShoppingBag, MapPin, CreditCard, Banknote, Smartphone, Tag, Sparkles } from "lucide-react";
import { useCart } from "@/context/cart";
import { useAuth } from "@/context/auth";
import { formatBRL } from "@/data/menu";
import { toast } from "sonner";
import { createOrder } from "@/lib/api/orders.functions";
import { validateCoupon } from "@/lib/api/coupons.functions";

const DELIVERY_FEE = 6.99;

type PaymentMethod = "pix" | "money" | "card";

const paymentOptions: { value: PaymentMethod; label: string; icon: typeof Smartphone }[] = [
  { value: "pix", label: "Pix", icon: Smartphone },
  { value: "money", label: "Dinheiro", icon: Banknote },
  { value: "card", label: "Cartão", icon: CreditCard },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, itemCount, clear } = useCart();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    coupon_id: string;
    code: string;
    discount_type: string;
    discount_value: number;
    discount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const discount = appliedCoupon?.discount ?? 0;
  const grandTotal = itemCount > 0 ? Math.max(0, total + DELIVERY_FEE - discount) : 0;

  if (itemCount === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center text-muted-foreground">
        <ShoppingBag className="h-16 w-16 opacity-40" />
        <h1 className="text-xl font-bold text-foreground">Carrinho vazio</h1>
        <p className="text-sm">Adicione itens antes de finalizar o pedido.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground"
        >
          Ver cardápio
        </button>
      </div>
    );
  }

  async function handleApplyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const result = await validateCoupon({
        data: { code, orderTotal: total + DELIVERY_FEE },
      });
      setAppliedCoupon(result);
      toast.success(`Cupom aplicado! Desconto de ${formatBRL(result.discount)}`);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof Error ? err.message : "Cupom inválido");
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.warning("Informe o endereço de entrega.");
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        data: {
          items: items.map((i) => ({
            product_id: i.id,
            product_name: i.name,
            unit_price: i.price,
            quantity: i.quantity,
          })),
          total: grandTotal,
          delivery_address: address.trim(),
          notes: notes.trim() || undefined,
          payment_method: paymentMethod,
          user_id: user?.id || undefined,
          coupon_id: appliedCoupon?.coupon_id || undefined,
          discount_applied: appliedCoupon?.discount ?? 0,
        },
      });

      clear();
      toast.success("Pedido realizado com sucesso!");
      navigate(`/pedido/${order.id}`);
    } catch (err) {
      console.error("Erro ao criar pedido:", err);
      toast.error(`Erro: ${err instanceof Error ? err.message : "Tente novamente."}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button
          onClick={() => navigate("/")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-transform active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1 font-display text-lg font-extrabold uppercase text-primary">
          <span>PIZZA</span>
          <Zap className="h-4 w-4 fill-primary" />
        </div>
      </header>

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6 px-4 py-6">
        <h1 className="text-xl font-bold text-foreground">Finalizar Pedido</h1>

        {user && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <p className="font-semibold text-foreground">{user.name}</p>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Endereço de Entrega
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua, número, bairro, complemento..."
              className="w-full resize-none rounded-xl border border-border bg-background/50 py-3 pl-9 pr-3 text-sm outline-none focus:border-primary/50"
              rows={3}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Observações
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Alguma observação? (opcional)"
            className="w-full resize-none rounded-xl border border-border bg-background/50 px-3 py-3 text-sm outline-none focus:border-primary/50"
            rows={2}
            disabled={submitting}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Forma de Pagamento
          </label>
          <div className="flex gap-3">
            {paymentOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPaymentMethod(value)}
                disabled={submitting}
                className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-all ${
                  paymentMethod === value
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <div className={`rounded-full p-2 transition-colors ${
                  paymentMethod === value ? "bg-primary/15" : "bg-secondary"
                }`}>
                  <Icon className={`h-5 w-5 ${paymentMethod === value ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Cupom de Desconto
          </label>
          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400">
                <Sparkles className="h-4 w-4" />
                {appliedCoupon.code} — {formatBRL(appliedCoupon.discount)} de desconto
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-sm text-muted-foreground underline hover:text-foreground"
              >
                Remover
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null); }}
                  placeholder="Digite o cupom"
                  className="w-full rounded-xl border border-border bg-background/50 py-3 pl-9 pr-3 text-sm outline-none focus:border-primary/50"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="rounded-xl bg-secondary px-4 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/70 disabled:opacity-50"
              >
                {couponLoading ? "..." : "Aplicar"}
              </button>
            </div>
          )}
          {couponError && (
            <p className="text-xs text-red-500">{couponError}</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-bold text-foreground">Resumo do Pedido</h3>
          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-muted-foreground">
                  {item.quantity}x {item.name}
                </span>
                <span className="tabular-nums text-foreground">
                  {formatBRL(item.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="border-t border-border pt-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatBRL(total)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Entrega</span>
                <span className="tabular-nums">{formatBRL(DELIVERY_FEE)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Desconto</span>
                  <span className="tabular-nums">-{formatBRL(discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 font-display text-base font-extrabold text-foreground">
                <span>Total</span>
                <span className="tabular-nums">{formatBRL(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-primary py-4 font-display text-base font-bold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? "Enviando..." : `Confirmar Pedido · ${formatBRL(grandTotal)}`}
        </button>
      </form>
    </div>
  );
}
