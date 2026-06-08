# Design — Perfil

## Fluxo

```
Profile.mount()
  ├── if (!user) navigate("/")
  └── loadOrders()
       ├── supabase.from("orders").select("*").eq("user_id", user.id).order("created_at DESC")
       └── Para cada pedido: supabase.from("order_items").select("*").eq("order_id", id)
```

## Decisões de design

| Decisão | Rationale | Confiança |
|---------|-----------|-----------|
| Query via client Supabase (não server function) | Usa JWT do usuário — RLS garante isolamento sem service role | 🟢 |
| N+1 queries para itens de pedido | `order_items` carregados um por um por pedido — pode ser otimizado | 🟡 |
