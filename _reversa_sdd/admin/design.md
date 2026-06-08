# Design — Admin

## Fluxo de notificação em tempo real

```
OrdersTab.mount()
  ├── if (!user) navigate("/")       ← único guard de acesso
  ├── loadOrders() → listAllOrders() (service role)
  └── supabase.channel("admin-orders")
        .on("postgres_changes", { event: "INSERT", table: "orders" })
        .subscribe()
           ↓ novo INSERT
        playNotificationSound()
        toast.success("Novo pedido!")
        loadOrders()
```

## Fluxo de upload de imagem

```
uploadImage({ base64, fileName })
  ├── strip "data:image/...;base64,"
  ├── atob(base64) → Uint8Array
  ├── path = `${Date.now()}-${random}.{ext}`
  ├── supabaseAdmin.storage.from("products").upload(path, buffer)
  └── getPublicUrl(path) → { url }
```

## Máquina de estado de pedido (transitions)

```typescript
const nextStatuses = {
  pending:    ["preparing", "cancelled"],
  preparing:  ["delivering", "cancelled"],
  delivering: ["delivered"],
  delivered:  [],
  cancelled:  [],
}
```

## Decisões de design

| Decisão | Rationale | Confiança |
|---------|-----------|-----------|
| Todas as ops admin com service role | Bypassa RLS — admin precisa ver todos os dados | 🟢 |
| Notificação via Realtime (não polling) | Real-time sem overhead de polling | 🟢 |
| Som via Web Audio API (sem arquivo) | Sem dependência de asset externo | 🟢 |
| Upload base64 no servidor | Evita limite de tamanho em requests multipart do cliente | 🟢 |
| Sem RBAC | **Decisão de risco** — provavelmente por simplicidade/urgência | 🔴 |
