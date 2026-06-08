# Design — Checkout

## Fluxo completo

```
Checkout.render()
  ├── itemCount === 0? → exibe UI "carrinho vazio"
  └── itemCount > 0:
       ├── Estado local: address, notes, paymentMethod, couponCode, appliedCoupon
       │
       ├── handleApplyCoupon()
       │    └── validateCoupon({ code, orderTotal: total + DELIVERY_FEE })
       │         ├── OK → setAppliedCoupon(result), toast.success
       │         └── ERRO → setCouponError(msg)
       │
       └── handleSubmit()
            ├── setSubmitting(true)
            ├── createOrder({
            │     items: cart.items.map(→ {product_id, product_name, unit_price, quantity}),
            │     total: grandTotal,
            │     delivery_address: address,
            │     notes, payment_method,
            │     user_id: user?.id,
            │     coupon_id: appliedCoupon?.coupon_id,
            │     discount_applied: appliedCoupon?.discount
            │   })
            ├── cart.clear()
            └── navigate({ to: "/pedido/$id", params: { id: order.id } })
```

## Cálculo de totais

```
subtotal      = cart.total          // Σ(price × qty)
delivery_fee  = 6.99                // hardcoded
discount      = appliedCoupon?.discount ?? 0
grandTotal    = max(0, subtotal + delivery_fee - discount)
```

## Server function: validateCoupon (POST)

**Input (Zod):**
```typescript
{ code: string (toUpperCase), orderTotal: number (positive) }
```

**Validações em cadeia:**
1. `coupon` existe → senão: "Cupom não encontrado."
2. `coupon.active` → senão: "Este cupom não está mais ativo."
3. `expires_at` nulo ou futuro → senão: "Este cupom expirou."
4. `max_uses` nulo ou `used_count < max_uses` → senão: "Este cupom já atingiu o limite de usos."
5. `min_order_value` nulo ou `orderTotal >= min_order_value` → senão: "Valor mínimo do pedido: R$ X,XX."

**Output:**
```typescript
{ coupon_id, code, discount_type, discount_value, discount }
```

## Decisões de design

| Decisão | Rationale | Confiança |
|---------|-----------|-----------|
| `DELIVERY_FEE` constante hardcoded | Simplicidade inicial — taxa única sem variação | 🟢 |
| Cupom validado antes do submit (em passo separado) | UX: usuário vê desconto antes de confirmar | 🟢 |
| Pedido anônimo permitido | Reduz fricção — cliente não precisa de conta | 🟢 |
