import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Zap, ArrowLeft, Package, MapPin, CreditCard, ShoppingBag, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/auth";
import { getSupabase } from "@/lib/supabase";
import { formatBRL } from "@/data/menu";
import type { Order, OrderItem } from "@/lib/db/types";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function Profile() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState<(Order & { items?: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/");
      return;
    }

    async function loadOrders() {
      if (!user) return;
      try {
        const supabase = getSupabase();
        if (!supabase) {
          setOrders([]);
          setLoading(false);
          return;
        }

        const { data: orderData, error: orderErr } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (orderErr) throw new Error(orderErr.message);

        const orderIds = (orderData ?? []).map((o) => o.id);
        if (orderIds.length === 0) {
          setOrders(orderData ?? []);
          return;
        }

        const { data: itemData, error: itemErr } = await supabase
          .from("order_items")
          .select("*")
          .in("order_id", orderIds);

        if (itemErr) throw new Error(itemErr.message);

        const itemsByOrder = new Map<string, OrderItem[]>();
        for (const item of itemData ?? []) {
          const list = itemsByOrder.get(item.order_id) ?? [];
          list.push(item as OrderItem);
          itemsByOrder.set(item.order_id, list);
        }

        const ordersWithItems = (orderData ?? []).map((o) => ({
          ...(o as Order),
          items: itemsByOrder.get(o.id) ?? [],
        }));

        setOrders(ordersWithItems);
      } catch (e) {
        console.error("Erro ao carregar pedidos:", e);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

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

      <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">{user?.name}</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <h2 className="font-display text-base font-bold text-foreground">Meus Pedidos</h2>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhum pedido encontrado.</p>
            <Link
              to="/"
              className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground"
            >
              Fazer primeiro pedido
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/pedido/${order.id}`}
                className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {paymentLabels[order.payment_method || ""] || order.payment_method}
                  </span>
                </div>

                {order.items && order.items.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.items.map((i) => `${i.quantity}x ${i.product_name}`).join(", ")}
                  </p>
                )}

                <div className="mt-2 border-t border-border pt-2 text-right font-display font-extrabold text-primary">
                  {formatBRL(order.total)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
