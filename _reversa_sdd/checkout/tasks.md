# Tasks — Checkout

## Para migração (desacoplar Lovable)

- Sem acoplamento direto com Lovable nesta unit.

## Para melhorias críticas identificadas

- [ ] **T-CHK-01** Implementar `createOrder` como transação real no Supabase (função PL/pgSQL) para garantir atomicidade entre INSERT `orders` e INSERT `order_items`
- [ ] **T-CHK-02** Mover `DELIVERY_FEE` para tabela de configurações ou variável de ambiente
- [ ] **T-CHK-03** Implementar integração de pagamento real para `payment_status` (Pix via Pagar.me, Stripe ou similar)
