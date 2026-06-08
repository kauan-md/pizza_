# Matriz de Permissões — Pizza Lopez

> Gerado pelo Detective em 2026-06-08

## Escala de confiança
- 🟢 CONFIRMADO — extraído diretamente do código
- 🟡 INFERIDO — baseado em padrões
- 🔴 LACUNA — requer validação humana

---

## Papéis identificados

| Papel | Definição | Confiança |
|-------|-----------|-----------|
| **Anônimo** | Visitante sem conta | 🟢 |
| **Usuário autenticado** | Logado via Supabase Auth | 🟢 |
| **Admin** | Qualquer usuário autenticado — sem papel dedicado | 🔴 RISCO |

> 🔴 **RISCO CRÍTICO:** Não existe campo `role` em `profiles`, nem middleware de autorização. A rota `/admin` só verifica `if (!user) navigate({ to: "/" })`. Qualquer conta pode acessar o painel admin. Isso deve ser corrigido na migração.

---

## Matriz de Permissões

| Recurso / Ação | Anônimo | Usuário Auth | "Admin" |
|----------------|---------|--------------|---------|
| **Cardápio** — visualizar produtos | ✅ | ✅ | ✅ |
| **Cardápio** — filtrar por categoria | ✅ | ✅ | ✅ |
| **Carrinho** — adicionar/remover itens | ✅ | ✅ | ✅ |
| **Checkout** — criar pedido | ✅ ¹ | ✅ | ✅ |
| **Checkout** — aplicar cupom | ✅ | ✅ | ✅ |
| **Pedido** — visualizar próprio (`/pedido/:id`) | ✅ ² | ✅ | ✅ |
| **Perfil** — visualizar/editar | ❌ | ✅ | ✅ |
| **Auth** — login/registro | ✅ | ❌ | ❌ |
| **Auth** — logout | ❌ | ✅ | ✅ |
| **Auth** — redefinir senha | ✅ | ✅ | ✅ |
| **Reviews** — criar avaliação | ❌ ³ | ✅ ³ | ✅ |
| **Reviews** — visualizar por produto | ✅ | ✅ | ✅ |
| **Admin** — visualizar todos os pedidos | ❌ | ✅ 🔴 | ✅ |
| **Admin** — atualizar status de pedido | ❌ | ✅ 🔴 | ✅ |
| **Admin** — gerenciar produtos | ❌ | ✅ 🔴 | ✅ |
| **Admin** — gerenciar cupons | ❌ | ✅ 🔴 | ✅ |
| **Admin** — visualizar reviews | ❌ | ✅ 🔴 | ✅ |
| **Admin** — upload de imagem | ❌ | ✅ 🔴 | ✅ |

**Legenda:**
- ✅ = permitido
- ❌ = negado
- 🔴 = **RISCO** — permitido incorretamente (qualquer usuário auth tem acesso admin)

**Notas:**
1. ¹ Pedido anônimo é permitido pelo schema (`user_id` nullable), mas o checkout UI exige endereço de entrega — autenticação não é forçada
2. ² O pedido é acessível por qualquer pessoa que tiver o UUID (sem proteção de rota — a confirmar)
3. ³ `createReview` não verifica se o `order_id` pertence ao `user_id` do solicitante

---

## RLS no Banco de Dados

| Tabela | Anônimo (select) | Usuário (próprios dados) | Service Role (admin) |
|--------|-----------------|--------------------------|----------------------|
| `profiles` | ❌ | ✅ (auth.uid() = id) | ✅ |
| `products` | ✅ | ✅ | ✅ |
| `categories` | ✅ | ✅ | ✅ |
| `orders` | ❌ | ✅ (próprio) | ✅ |
| `order_items` | ❌ | ✅ (via order) | ✅ |
| `coupons` | 🔴 sem política | 🔴 sem política | ✅ |
| `reviews` | 🔴 sem política | 🔴 sem política | ✅ |

> **Observação:** As operações admin (via `supabaseAdmin`) sempre usam service role key — corretamente bypass RLS. O risco está no acesso direto pelo client (`supabase`) às tabelas `coupons` e `reviews` sem políticas definidas.
