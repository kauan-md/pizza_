import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { type CategoryDef, type Product } from "@/data/menu";
import { CategoryNav } from "./CategoryNav";
import { ProductCard } from "./ProductCard";
import { Skeleton, ProductCardSkeleton } from "@/components/ui/skeleton";

function mapProduct(p: {
  id: string; name: string; description: string; price: number;
  old_price: number | null; category_id: string; tag: string | null; image: string;
}): Product {
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

export function Menu() {
  const [active, setActive] = useState<string>("ofertas");
  const [categories, setCategories] = useState<CategoryDef[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabase();
        if (!supabase) {
          setError("As variáveis de ambiente do Supabase não estão configuradas. Configure NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY e NEXT_SUPABASE_ANON_KEY para carregar o cardápio.");
          setLoading(false);
          return;
        }

        const { data: cats, error: catErr } = await supabase
          .from("categories")
          .select("id, label")
          .order("display_order");

        if (catErr) throw new Error(catErr.message);
        setCategories(cats ?? []);

        const { data: prods, error: prodErr } = await supabase
          .from("products")
          .select("id, name, description, price, old_price, category_id, tag, image")
          .eq("available", true)
          .order("created_at");

        if (prodErr) throw new Error(prodErr.message);
        setProducts((prods ?? []).map(mapProduct));

        const prodIds = (prods ?? []).map((p) => p.id);
        if (prodIds.length > 0) {
          const { data: revs } = await supabase
            .from("reviews")
            .select("product_id, rating")
            .in("product_id", prodIds);
          const grouped: Record<string, { sum: number; count: number }> = {};
          for (const r of revs ?? []) {
            if (!grouped[r.product_id]) grouped[r.product_id] = { sum: 0, count: 0 };
            grouped[r.product_id].sum += r.rating;
            grouped[r.product_id].count += 1;
          }
          const avgMap: Record<string, { avg: number; count: number }> = {};
          for (const [pid, g] of Object.entries(grouped)) {
            avgMap[pid] = { avg: Math.round((g.sum / g.count) * 10) / 10, count: g.count };
          }
          setRatings(avgMap);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (error) {
    return (
      <section id="cardapio" className="mx-auto w-full max-w-6xl px-4">
        <div className="mt-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <p className="font-bold">Erro ao carregar cardápio</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section id="cardapio" className="mx-auto w-full max-w-6xl px-4">
        <Skeleton className="mb-4 h-10 w-48" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  const filtered = products.filter((p) => p.category === active);
  const activeLabel = categories.find((c: CategoryDef) => c.id === active)?.label;

  return (
    <section id="cardapio" className="mx-auto w-full max-w-6xl px-4">
      <CategoryNav categories={categories} active={active} onChange={setActive} />

      <h2 className="mt-2 font-display text-2xl font-extrabold text-foreground">
        {activeLabel}
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} rating={ratings[product.id]} />
        ))}
      </div>
    </section>
  );
}
