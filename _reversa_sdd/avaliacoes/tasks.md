# Tasks — Avaliações

## Para melhorias críticas identificadas

- [ ] **T-AVL-01** Adicionar verificação de ownership em `createReview`: confirmar que o `order_id` informado pertence ao usuário autenticado (via query `orders WHERE id = order_id AND user_id = claims.sub`)
- [ ] **T-AVL-02** Adicionar RLS na tabela `reviews` para SELECT público (leitura de reviews do cardápio) e INSERT autenticado
- [ ] **T-AVL-03** Adicionar limite de 1 review por produto por pedido (unique constraint em `(product_id, order_id)`)
