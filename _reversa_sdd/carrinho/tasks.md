# Tasks — Carrinho

## Sem itens bloqueadores para a migração Lovable → Vercel

O módulo de carrinho não tem acoplamento com Lovable. Nenhuma tarefa obrigatória para migração.

## Melhorias identificadas (opcionais)

- [ ] **T-CART-01** Vincular carrinho ao usuário autenticado (sincronizar com banco) para persistência cross-device
- [ ] **T-CART-02** Limpar carrinho automaticamente após `createOrder` com sucesso (já ocorre via `clear()` no checkout — confirmar)
