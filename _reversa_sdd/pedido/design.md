# Design — Pedido

## Fluxo

```
OrderConfirmation.mount()
  └── getOrder({ id })
       ├── SELECT orders WHERE id = ?
       └── SELECT order_items WHERE order_id = ?
       ──► setOrder + setItems

Formulário de review por produto:
  └── createReview({
        product_id, order_id,
        author_name, rating, comment
      })
       ──► toast.success / toast.error
```

## Labels de status

```typescript
const statusLabels = {
  pending:    "Aguardando confirmação",
  preparing:  "Preparando",
  delivering: "Saiu para entrega",
  delivered:  "Entregue",
  cancelled:  "Cancelado",
}
const paymentStatusLabels = {
  pending:  "Aguardando pagamento",
  paid:     "Pago",
  failed:   "Falhou",
  refunded: "Reembolsado",
}
```

## Decisões de design

| Decisão | Rationale | Confiança |
|---------|-----------|-----------|
| Pedido acessível sem autenticação | Permite que anônimos vejam o próprio pedido via link direto | 🟢 |
| Review inline na página de pedido | UX: avaliação imediata após recebimento | 🟢 |
| `author_name` informado manualmente | Permite review mesmo sem conta, mas abre brecha para fraude | 🟢/🔴 |
