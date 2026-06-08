# Design — Avaliações

## Server functions

| Função | Método | Auth | Tabela | Filtro |
|--------|--------|------|--------|--------|
| `createReview` | POST | service role | `reviews` INSERT | — |
| `listProductReviews` | GET | service role | `reviews` SELECT | `product_id = ?` ORDER `created_at DESC` |
| `listAllReviews` | GET | service role | `reviews` SELECT | ORDER `created_at DESC` |

## Input de createReview (Zod)

```typescript
{
  product_id: string,
  order_id: string (uuid),
  author_name: string (min 1),
  rating: number (int, 1-5),
  comment?: string,
}
```

## Decisões de design

| Decisão | Rationale | Confiança |
|---------|-----------|-----------|
| `author_name` em vez de `user_id` obrigatório | Permite review de anônimos (sem conta) | 🟢 |
| Sem verificação de ownership | Simplificação — trade-off aceitável no MVP | 🟡 |
| Service role em todas as operações | Consistência com demais server functions | 🟢 |
