# Design — Carrinho

## Estruturas de dados

```typescript
interface CartItem extends Product {  // Product de src/data/menu.ts
  quantity: number;
}

// localStorage key: "pizza_cart"
// Valor: JSON.stringify(CartItem[])
```

## Fluxo de estado

```
useState(loadCart)  ← inicializa do localStorage
    │
    ├── addItem(product)
    │     └── setItems: incrementa ou insere → toast.success
    ├── decrement(id)
    │     └── setItems: qty-1, filter(qty>0)
    ├── removeItem(id)
    │     └── setItems: filter(id !== target)
    └── clear()
          └── setItems([]) + localStorage.removeItem

useEffect([items]) → localStorage.setItem("pizza_cart", JSON.stringify(items))

useMemo → { itemCount, total }  (recalculado apenas quando items muda)
```

## Decisões de design

| Decisão | Rationale | Confiança |
|---------|-----------|-----------|
| Carrinho 100% client-side | Simplicidade — sem conta obrigatória para comprar | 🟢 |
| `useCallback` em todas as ações | Evita re-renders dos consumidores do contexto | 🟢 |
| `useMemo` para `total` e `itemCount` | Performance — calcula apenas quando `items` muda | 🟢 |
