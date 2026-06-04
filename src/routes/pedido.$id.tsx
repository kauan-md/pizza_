import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Zap, CheckCircle, Package, MapPin, CreditCard, ArrowLeft, Star } from "lucide-react";
import { getOrder } from "@/lib/api/orders.functions";
import { createReview } from "@/lib/api/reviews.functions";
import { formatBRL } from "@/data/menu";
import type { Order, OrderItem } from "@/lib/db/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/pedido/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Pedido #${params.id.slice(0, 8)} — Pizza` }],
  }),
  component: OrderConfirmation,
});

const statusLabels: Record<string, string> = {
  pending: "Aguardando confirmação",
  preparing: "Preparando",
  delivering: "Saiu para entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const paymentLabels: Record<string, string> = {
  pix: "Pix",
  money: "Dinheiro",
  card: "Cartão",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  failed: "Falhou",
  refunded: "Reembolsado",
};

function OrderConfirmation() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/pedido/$id" });
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reviews, setReviews] = useState<Record<string, { rating: number; comment: string }>>({});
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    getOrder({ data: { id } })
      .then((result) => {
        setOrder(result.order as Order);
        setItems(result.items as OrderItem[]);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-xl font-bold text-foreground">Pedido não encontrado</h1>
        <p className="text-sm text-muted-foreground">Não foi possível carregar os dados do pedido.</p>
        <button
          onClick={() => navigate({ to: "/" })}
          className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 border-b border-border px-4 py-4">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-transform active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1 font-display text-lg font-extrabold uppercase text-primary">
          <span>PIZZA</span>
          <Zap className="h-4 w-4 fill-primary" />
        </div>
      </header>

      <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
        <div className="flex flex-col items-center gap-2 rounded-xl bg-primary/10 p-6 text-center">
          <CheckCircle className="h-12 w-12 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Pedido Confirmado!</h1>
          <p className="text-sm text-muted-foreground">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-4">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-semibold text-foreground">
                {statusLabels[order.status] || order.status}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-4">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Entrega</p>
              <p className="font-semibold text-foreground">{order.delivery_address}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Pagamento</p>
              <p className="font-semibold text-foreground">
                {paymentLabels[order.payment_method || ""] || order.payment_method} ·{" "}
                {paymentStatusLabels[order.payment_status || ""] || order.payment_status}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-bold text-foreground">Itens</h3>
          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-muted-foreground">
                  {item.quantity}x {item.product_name}
                </span>
                <span className="tabular-nums text-foreground">
                  {formatBRL(item.unit_price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-border pt-3 text-right font-display text-base font-extrabold text-foreground">
            Total: {formatBRL(order.total)}
          </div>
        </div>

        {order.notes && (
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Observações
            </p>
            <p className="mt-1 text-foreground">{order.notes}</p>
          </div>
        )}

        {order.status === "delivered" && (
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
              <Star className="h-4 w-4 text-primary" />
              Avalie seu pedido
            </h3>
            <div className="space-y-4">
              {items.map((item) => {
                const rev = reviews[item.product_id] || { rating: 0, comment: "" };
                return (
                  <div key={item.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <p className="mb-2 text-sm font-semibold text-foreground">{item.product_name}</p>
                    <StarRating
                      value={rev.rating}
                      onChange={(r) => setReviews((prev) => ({ ...prev, [item.product_id]: { ...prev[item.product_id], rating: r } }))}
                    />
                    <textarea
                      value={rev.comment}
                      onChange={(e) => setReviews((prev) => ({ ...prev, [item.product_id]: { ...prev[item.product_id], comment: e.target.value } }))}
                      placeholder="Conte o que achou (opcional)"
                      className="mt-2 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50"
                      rows={2}
                    />
                  </div>
                );
              })}
              <button
                onClick={async () => {
                  setSubmittingReview(true);
                  try {
                    for (const item of items) {
                      const rev = reviews[item.product_id];
                      if (!rev || rev.rating === 0) continue;
                      await createReview({
                        data: {
                          product_id: item.product_id,
                          order_id: order.id,
                          author_name: "Cliente",
                          rating: rev.rating,
                          comment: rev.comment || undefined,
                        },
                      });
                    }
                    toast.success("Avaliação enviada! Obrigado.");
                    setReviews({});
                  } catch (err) {
                    toast.error("Erro ao enviar avaliação.");
                  }
                  setSubmittingReview(false);
                }}
                disabled={submittingReview || !Object.values(reviews).some((r) => r.rating > 0)}
                className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
              >
                {submittingReview ? "Enviando..." : "Enviar Avaliação"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (r: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform active:scale-90"
        >
          <Star
            className={`h-5 w-5 ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
          />
        </button>
      ))}
    </div>
  );
}
