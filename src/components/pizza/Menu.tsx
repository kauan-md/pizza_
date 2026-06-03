import { useMemo, useState } from "react";
import { categories, products, type Category } from "@/data/menu";
import { CategoryNav } from "./CategoryNav";
import { ProductCard } from "./ProductCard";

export function Menu() {
  const [active, setActive] = useState<Category>("ofertas");

  const filtered = useMemo(
    () => products.filter((p) => p.category === active),
    [active],
  );

  const activeLabel = categories.find((c) => c.id === active)?.label;

  return (
    <section id="cardapio" className="mx-auto w-full max-w-6xl px-4">
      <CategoryNav active={active} onChange={setActive} />

      <h2 className="mt-2 font-display text-2xl font-extrabold text-foreground">
        {activeLabel}
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
