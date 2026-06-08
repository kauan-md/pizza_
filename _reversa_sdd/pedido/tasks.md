# Tasks — Pedido

## Para melhorias críticas identificadas

- [ ] **T-PED-01** Adicionar verificação de propriedade em `getOrder` — confirmar se `user_id` do pedido corresponde ao usuário autenticado (ou aceitar acesso anônimo explicitamente como decisão)
- [ ] **T-PED-02** Adicionar verificação de ownership em `createReview` — confirmar que `order_id` pertence ao solicitante antes de inserir
- [ ] **T-PED-03** Implementar Supabase Realtime na página de pedido para atualizar status automaticamente (sem reload manual)
