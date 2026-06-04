import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Zap, ArrowLeft, RefreshCw, Package, Pizza, Plus, Pencil, X, Upload, Tag, Star } from "lucide-react";
import { useAuth } from "@/context/auth";
import { getSupabase } from "@/lib/supabase";
import {
  listAllOrders,
  updateOrderStatus,
  listAllProducts,
  createProduct,
  updateProduct,
  toggleProductAvailability,
  uploadImage,
  listAllCoupons,
  createCoupon,
  toggleCoupon,
} from "@/lib/api/admin.functions";
import { listAllReviews } from "@/lib/api/reviews.functions";
import { formatBRL } from "@/data/menu";
import { playNotificationSound, clearNewOrderCount } from "@/lib/notification";
import { toast } from "sonner";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Skeleton, ListSkeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Pizza" }],
  }),
  component: AdminPage,
});

const statusLabels: Record<string, string> = {
  pending: "Aguardando",
  preparing: "Preparando",
  delivering: "Saiu para entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-blue-100 text-blue-800",
  delivering: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const nextStatuses: Record<string, string[]> = {
  pending: ["preparing", "cancelled"],
  preparing: ["delivering", "cancelled"],
  delivering: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

type AdminTab = "orders" | "products" | "coupons" | "reviews";

function AdminPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<AdminTab>("orders");

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
        <div className="ml-auto text-sm font-semibold text-muted-foreground">Admin</div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex gap-2 border-b border-border">
          <button
            onClick={() => setTab("orders")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "orders" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="h-4 w-4" />
            Pedidos
          </button>
          <button
            onClick={() => setTab("products")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "products" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Pizza className="h-4 w-4" />
            Produtos
          </button>
          <button
            onClick={() => setTab("coupons")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "coupons" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tag className="h-4 w-4" />
            Cupons
          </button>
          <button
            onClick={() => setTab("reviews")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "reviews" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className="h-4 w-4" />
            Avaliações
          </button>
        </div>

        {tab === "orders" ? (
          <OrdersTab />
        ) : tab === "products" ? (
          <ProductsTab />
        ) : tab === "coupons" ? (
          <CouponsTab />
        ) : (
          <ReviewsTab />
        )}
      </div>
    </div>
  );
}

// ─── Orders Tab ────────────────────────────────────────────────────────

function OrdersTab() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const subRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate({ to: "/" }); return; }
    clearNewOrderCount();
    loadOrders();

    const supabase = getSupabase();
    if (!supabase) return;
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          playNotificationSound();
          toast.success("Novo pedido!", {
            description: `#${payload.new.id.slice(0, 8).toUpperCase()} — ${formatBRL(payload.new.total)}`,
          });
          loadOrders();
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, authLoading]);

  async function loadOrders() {
    setLoading(true);
    setError(null);
    try {
      const data = await listAllOrders();
      setOrders(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId: string, status: string) {
    setUpdating(orderId);
    try {
      await updateOrderStatus({ data: { orderId, status: status as any } });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (e) {
      console.error("Erro ao atualizar status:", e);
    } finally {
      setUpdating(null);
    }
  }

  if (authLoading || loading) return <div className="px-2 py-4"><ListSkeleton rows={4} /></div>;

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <button onClick={loadOrders} className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">Pedidos Recebidos</h2>
        <button onClick={loadOrders} className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Nenhum pedido recebido.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</span>
                <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString("pt-BR")}</span>
              </div>
              <p className="mt-1 text-sm text-foreground">{order.delivery_address}</p>
              {order.notes && <p className="mt-1 text-xs italic text-muted-foreground">Obs: {order.notes}</p>}
              <div className="mt-2 border-t border-border pt-2">
                <p className="text-xs text-muted-foreground">
                  {order.items?.map((i: any) => `${i.quantity}x ${i.product_name}`).join(", ") || "Sem itens"}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  disabled={updating === order.id}
                  className={`rounded-lg border px-2 py-1 text-xs font-bold uppercase ${statusColors[order.status] || ""}`}
                >
                  {nextStatuses[order.status]?.length > 0 ? (
                    <>
                      <option value={order.status} disabled>{statusLabels[order.status]}</option>
                      {nextStatuses[order.status].map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                    </>
                  ) : (
                    <option value={order.status}>{statusLabels[order.status]}</option>
                  )}
                </select>
                <span className="font-display font-extrabold text-primary">{formatBRL(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Products Tab ──────────────────────────────────────────────────────

function ProductsTab() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate({ to: "/" }); return; }
    loadData();
  }, [user, authLoading]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const [prods, catData] = await Promise.all([
        listAllProducts(),
        supabase ? supabase.from("categories").select("*").order("display_order").then((r) => r.data ?? []) : Promise.resolve([]),
      ]);
      setProducts(prods);
      setCategories(catData as any[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id: string, available: boolean) {
    try {
      await toggleProductAvailability({ data: { id, available } });
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, available } : p)));
    } catch (e) {
      console.error(e);
    }
  }

  function handleEdit(product: any) {
    setEditing(product);
    setShowForm(true);
  }

  function handleNew() {
    setEditing(null);
    setShowForm(true);
  }

  if (authLoading || loading) return <div className="px-2 py-4"><ListSkeleton rows={4} /></div>;

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <button onClick={loadData} className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">Produtos</h2>
        <div className="flex gap-2">
          <button onClick={loadData} className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={handleNew} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">
            <Plus className="h-4 w-4" />
            Novo
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {products.map((product) => (
          <div key={product.id} className={`rounded-xl border p-4 ${product.available ? "border-border bg-card" : "border-dashed border-muted bg-muted/30 opacity-60"}`}>
            <div className="flex gap-3">
              <img src={product.image} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-foreground truncate">{product.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                  </div>
                  <button onClick={() => handleEdit(product)} className="shrink-0 rounded-lg p-1 hover:bg-secondary">
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="font-display font-bold text-primary">{formatBRL(product.price)}</span>
                  {product.old_price && <span className="text-muted-foreground line-through">{formatBRL(product.old_price)}</span>}
                  <span className="text-muted-foreground">· {product.category_id}</span>
                  {product.tag && <span className="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">{product.tag}</span>}
                </div>
                <div className="mt-2">
                  <button
                    onClick={() => handleToggle(product.id, !product.available)}
                    className={`text-xs font-semibold ${product.available ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600"}`}
                  >
                    {product.available ? "Desativar" : "Ativar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); loadData(); }}
        />
      )}
    </div>
  );
}

// ─── Product Form Modal ────────────────────────────────────────────────

function ProductForm({ product, categories, onClose, onSaved }: {
  product: any | null;
  categories: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const isNew = !product;

  const [id, setId] = useState(product?.id || "");
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [oldPrice, setOldPrice] = useState(product?.old_price?.toString() || "");
  const [categoryId, setCategoryId] = useState(product?.category_id || categories[0]?.id || "");
  const [tag, setTag] = useState(product?.tag || "");
  const [image, setImage] = useState(product?.image || "");
  const [available, setAvailable] = useState(product?.available ?? true);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const result = await uploadImage({ data: { base64, fileName: file.name } });
        setImage(result.url);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
    } finally {
      setUploadingImg(false);
    }
  }

  function parseCurrency(val: string): number {
    return parseFloat(val.replace(/\./g, "").replace(",", ".")) || 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !description || !price || !image) return;

    setSaving(true);
    try {
      const payload = {
        id: isNew ? id : product.id,
        name,
        description,
        price: parseCurrency(price),
        old_price: oldPrice ? parseCurrency(oldPrice) : null,
        category_id: categoryId,
        tag: tag || null,
        image,
        available,
      };

      if (isNew) {
        await createProduct({ data: payload });
      } else {
        await updateProduct({ data: payload });
      }
      onSaved();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">{isNew ? "Novo Produto" : "Editar Produto"}</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-secondary"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ID</label>
              <input value={id} onChange={(e) => setId(e.target.value)} disabled={!isNew}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categoria</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50">
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50" />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Descrição</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preço</label>
              <CurrencyInput value={price} onChange={setPrice}
                className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preço Antigo</label>
              <CurrencyInput value={oldPrice} onChange={setOldPrice}
                className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tag</label>
              <input value={tag} onChange={(e) => setTag(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Imagem</label>
            <div className="mt-1 flex gap-2">
              <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="URL da imagem..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50" />
              <label className={`flex cursor-pointer items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-secondary ${uploadingImg ? "opacity-50" : ""}`}>
                <Upload className="h-4 w-4" />
                {uploadingImg ? "Enviando..." : "Upload"}
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploadingImg} />
              </label>
            </div>
          </div>

          {image && (
            <img src={image} alt="preview" className="h-24 w-full rounded-lg object-cover" />
          )}

          <div className="flex items-center gap-2">
            <input type="checkbox" id="available" checked={available} onChange={(e) => setAvailable(e.target.checked)}
              className="h-4 w-4 rounded border-border" />
            <label htmlFor="available" className="text-sm text-foreground">Disponível no cardápio</label>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-border bg-background py-3 text-sm font-semibold text-foreground">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">
              {saving ? "Salvando..." : isNew ? "Criar Produto" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Coupons Tab ───────────────────────────────────────────────────────

const discountTypeLabels: Record<string, string> = {
  percentage: "Porcentagem",
  fixed: "Valor Fixo",
};

function CouponsTab() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => { loadCoupons(); }, []);

  async function loadCoupons() {
    setLoading(true);
    try {
      const data = await listAllCoupons();
      setCoupons(data);
    } catch { /* ignore */ }
    setLoading(false);
  }

  function parseCurrency(val: string): number {
    return parseFloat(val.replace(/\./g, "").replace(",", ".")) || 0;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createCoupon({
        data: {
          code,
          discount_type: discountType,
          discount_value: discountType === "fixed" ? parseCurrency(discountValue) : parseFloat(discountValue),
          min_order_value: minOrderValue ? parseCurrency(minOrderValue) : null,
          max_uses: maxUses ? parseInt(maxUses) : null,
          expires_at: expiresAt || null,
        },
      });
      setShowForm(false);
      setCode(""); setDiscountValue(""); setMinOrderValue(""); setMaxUses(""); setExpiresAt("");
      toast.success("Cupom criado!");
      loadCoupons();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar cupom");
    }
    setSaving(false);
  }

  async function handleToggle(id: string, active: boolean) {
    try {
      await toggleCoupon({ data: { id, active } });
      loadCoupons();
    } catch { /* ignore */ }
  }

  if (loading) return <div className="px-2 py-4"><ListSkeleton rows={4} /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{coupons.length} cupom(ns)</p>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
          <Plus className="h-3.5 w-3.5" /> Novo Cupom
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Código</label>
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="EX: PROMO10"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50" required />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50">
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valor</label>
              <input value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder={discountType === "percentage" ? "10" : "5.00"} type="number" step="0.01" min="0"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50" required />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valor mínimo (opcional)</label>
              <CurrencyInput value={minOrderValue} onChange={setMinOrderValue}
                className="mt-1" placeholder="R$ 30,00" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Usos máximos (opcional)</label>
              <input value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="100" type="number" min="1"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Expira em (opcional)</label>
              <input value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} type="date"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 rounded-lg border border-border py-2 text-sm font-semibold text-foreground">Cancelar</button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-lg bg-primary py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
              {saving ? "Criando..." : "Criar Cupom"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {coupons.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{c.code}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${c.active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                  {c.active ? "Ativo" : "Inativo"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {c.discount_type === "percentage" ? `${c.discount_value}%` : formatBRL(c.discount_value)}
                {c.min_order_value && ` · Mín: ${formatBRL(c.min_order_value)}`}
                {c.max_uses && ` · ${c.used_count}/${c.max_uses} usos`}
                {c.expires_at && ` · Exp: ${new Date(c.expires_at).toLocaleDateString("pt-BR")}`}
              </p>
            </div>
            <button onClick={() => handleToggle(c.id, !c.active)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold ${c.active ? "bg-red-500/10 text-red-600 hover:bg-red-500/20" : "bg-green-500/10 text-green-600 hover:bg-green-500/20"}`}>
              {c.active ? "Desativar" : "Ativar"}
            </button>
          </div>
        ))}
        {coupons.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">Nenhum cupom cadastrado.</p>
        )}
      </div>
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────

function ReviewsTab() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAllReviews()
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="px-2 py-4"><ListSkeleton rows={4} /></div>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{reviews.length} avaliação(ões)</p>
      {reviews.map((r) => (
        <div key={r.id} className="rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{r.author_name}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                ))}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleDateString("pt-BR")}
            </span>
          </div>
          {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
          <p className="mt-1 text-xs text-muted-foreground">Produto: {r.product_id}</p>
        </div>
      ))}
      {reviews.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">Nenhuma avaliação ainda.</p>
      )}
    </div>
  );
}
