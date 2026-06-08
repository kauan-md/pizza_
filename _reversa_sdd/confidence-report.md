# Relatório de Confiança — Pizza Lopez

> Gerado pelo Revisor em 2026-06-08
> doc_level: essencial | Revisão cruzada: não realizada (essencial)

---

## Resumo Geral

| Classificação | Quantidade | % |
|---------------|-----------|---|
| 🟢 CONFIRMADO | 78 | **81%** |
| 🟡 INFERIDO | 11 | **11%** |
| 🔴 LACUNA | 8 | **8%** |
| **Total** | **97** | **100%** |

**Confiança geral: 81%**

---

## Por Unit

| Unit | 🟢 | 🟡 | 🔴 | Confiança |
|------|-----|-----|-----|-----------|
| `autenticacao/` | 14 | 1 | 1 | 88% |
| `cardapio/` | 10 | 2 | 1 | 77% |
| `carrinho/` | 9 | 0 | 0 | 100% |
| `checkout/` | 10 | 1 | 2 | 77% |
| `pedido/` | 8 | 1 | 3 | 64% |
| `admin/` | 12 | 1 | 2 | 80% |
| `avaliacoes/` | 7 | 1 | 2 | 70% |
| `perfil/` | 8 | 4 | 0 | 67%* |
| **Globais** (domain, architecture, state-machines, permissions) | 0 | 1 | 0 | — |

*`perfil/` tem 4 🟡 por N+1 queries não verificadas em profundidade.

---

## Reclassificações realizadas nesta sessão

| Unit | Item | De | Para | Motivo |
|------|------|-----|------|--------|
| `admin/requirements.md` | "Produto desativado não aparece no cardápio" | 🟢/🟡 | 🟢 | Confirmado em `Menu.tsx:.eq("available", true)` |

---

## Lacunas críticas (🔴 — bloqueiam reimplementação segura)

| ID | Unit | Lacuna | Pergunta |
|----|------|--------|---------|
| L-01 | `admin/` | Controle de acesso ao painel admin — sem RBAC | Q-01 |
| L-02 | `checkout/`, `pedido/` | `payment_status` nunca atualizado — gateway ausente | Q-02 |
| L-03 | `pedido/` | Acesso ao pedido sem verificação de propriedade | — (decisão implícita — anônimos têm acesso por UUID) |
| L-04 | `avaliacoes/` | `createReview` sem ownership check do `order_id` | — (risco de fraude aceito no MVP?) |
| L-05 | `checkout/` | `createOrder` sem transação atômica real | T-CHK-01 |

## Lacunas de negócio (🔴 — requerem decisão do usuário)

| ID | Unit | Lacuna | Pergunta |
|----|------|--------|---------|
| L-06 | `cardapio/` | Feature "meio a meio" — presente no Git, ausente no código | Q-03 |
| L-07 | `checkout/` | Taxa de entrega hardcoded — configurável? | Q-04 |
| L-08 | `pedido/` | Cliente não recebe atualização em tempo real de status | Q-05 |

---

## Consistência entre units

| Verificação | Resultado |
|-------------|-----------|
| `checkout/` depende de `orders/` (createOrder) | ✅ Consistente |
| `checkout/` depende de `coupons/` (validateCoupon) | ✅ Consistente |
| `cardapio/` usa contrato `Product` de `data/menu.ts` | ✅ `mapProduct` confirma conversão |
| `carrinho/` usa contrato `Product` de `data/menu.ts` | ✅ Consistente |
| `pedido/` usa `createReview` de `avaliacoes/` | ✅ Consistente |
| `admin/` usa `listAllReviews` de `avaliacoes/` | ✅ Consistente |
| `autenticacao/` fornece `userId` para `checkout/` e `perfil/` | ✅ Consistente |
| Dois contratos `Product` (DB vs UI) | 🟡 Mapeamento via `mapProduct` — sem conflito funcional |

---

## Cobertura das specs vs código

| Arquivo de código | Unit correspondente | Status |
|-------------------|-------------------|--------|
| `src/context/auth.tsx` | `autenticacao/` | ✅ |
| `src/integrations/supabase/*` | `autenticacao/` | ✅ |
| `src/context/cart.tsx` | `carrinho/` | ✅ |
| `src/data/menu.ts` | `cardapio/` | ✅ |
| `src/components/pizza/Menu.tsx` | `cardapio/` | ✅ |
| `src/lib/api/orders.functions.ts` | `checkout/` + `pedido/` | ✅ |
| `src/lib/api/coupons.functions.ts` | `checkout/` | ✅ |
| `src/lib/api/admin.functions.ts` | `admin/` | ✅ |
| `src/lib/api/reviews.functions.ts` | `avaliacoes/` | ✅ |
| `src/routes/admin.tsx` | `admin/` | ✅ |
| `src/routes/checkout.tsx` | `checkout/` | ✅ |
| `src/routes/pedido.$id.tsx` | `pedido/` | ✅ |
| `src/routes/perfil.tsx` | `perfil/` | ✅ |
| `src/routes/index.tsx` | `cardapio/` | ✅ |
| `src/lib/db/schema.sql` | `architecture.md` + `domain.md` | ✅ |
| `src/lib/notification.ts` | `admin/` | ✅ |
| `vite.config.ts` | `architecture.md` (acoplamentos Lovable) | ✅ |
| `src/lib/lovable-error-reporting.ts` | `architecture.md` | ✅ |
| `src/routes/sobre.tsx` | ⚠️ Sem spec gerada | 🟡 |
| `src/routes/reset-password.tsx` | ⚠️ Sem spec — fluxo coberto em `autenticacao/` parcialmente | 🟡 |
| `src/lib/api/example.functions.ts` | ⚠️ Sem spec — provavelmente boilerplate/unused | 🟡 |

---

## Próximos passos recomendados

1. **Responder `questions.md`** — 5 perguntas aguardando validação humana
2. **Prioridade 1 — Migração Lovable:** tarefas T-AUTH-01 a T-AUTH-03, T-CARD-01 (remover referências Lovable)
3. **Prioridade 2 — Segurança:** T-ADM-01 a T-ADM-05 (RBAC), T-AVL-01 a T-AVL-02 (ownership)
4. **Prioridade 3 — Robustez:** T-CHK-01 (transação real em createOrder)

> Para iniciar o desenvolvimento, use `/reversa-forward` para ativar o pipeline de evolução de features.
