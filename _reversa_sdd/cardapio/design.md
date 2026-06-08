# Design — Cardápio

## Fluxo de carregamento

```
Menu.mount()
  ├─ getSupabase() → null? → setError (sem crash)
  ├─ SELECT categories ORDER BY display_order
  ├─ SELECT products WHERE available=true ORDER BY created_at
  ├─ mapProduct(): old_price→oldPrice, category_id→category
  └─ SELECT reviews(product_id, rating) WHERE product_id IN [...]
      └─ groupBy(product_id) → avg = round(sum/count*10)/10
```

## Mapeamento de contratos

```typescript
// DB → UI (mapProduct)
{ old_price: number | null, category_id: string }
        ↓
{ oldPrice: number | undefined, category: string }
```

> ⚠️ Este mapeamento resolve a incompatibilidade entre os dois contratos `Product` identificados pelo Detective.

## Queries Supabase (client-side, RLS pública)

| Query | Tabela | Filtro | Ordem |
|-------|--------|--------|-------|
| `select("id, label")` | `categories` | — | `display_order ASC` |
| `select("id, name, description, price, old_price, category_id, tag, image")` | `products` | `available=true` | `created_at ASC` |
| `select("product_id, rating")` | `reviews` | `product_id IN [...]` | — |

## Decisão de design

- Ratings carregados client-side junto com produtos (não em server function) — sem cache
- Filtragem por categoria é client-side (todos os produtos já carregados no estado)
