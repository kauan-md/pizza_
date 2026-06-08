# Code Analysis — Pizza Lopez

> Gerado pelo Archaeologist em 2026-06-08
> doc_level: essencial | organização: endpoint

## Escala de confiança
- 🟢 CONFIRMADO — extraído diretamente do código
- 🟡 INFERIDO — baseado em padrões, pode estar errado
- 🔴 LACUNA — requer validação humana

---

## Módulo: auth

**Arquivos:** `src/context/auth.tsx`, `src/integrations/supabase/client.ts`, `src/integrations/supabase/client.server.ts`, `src/integrations/supabase/auth-attacher.ts`, `src/integrations/supabase/auth-middleware.ts`

### 1. Fluxo de controle

| Função | Parâmetros | Retorno | Confiança |
|--------|-----------|---------|-----------|
| `login(email, password)` | string, string | Promise\<void\> | 🟢 |
| `register(name, email, password)` | string, string, string | Promise\<void\> | 🟢 |
| `logout()` | — | void | 🟢 |
| `forgotPassword(email)` | string | Promise\<void\> | 🟢 |
| `updatePassword(password)` | string | Promise\<void\> | 🟢 |
| `mapSupabaseUser(supaUser)` | User (Supabase) | UserSession | 🟢 |
| `attachSupabaseAuth` (middleware client) | — | next({ headers: Bearer }) | 🟢 |
| `requireSupabaseAuth` (middleware server) | — | next({ context: { supabase, userId, claims } }) | 🟢 |

**Fluxo de inicialização do AuthProvider:**
1. Chama `supabase.auth.getSession()` no mount
2. Se sessão ativa → mapeia user e salva em `localStorage("pizza_user")`
3. Se Supabase indisponível → fallback para `localStorage`
4. Subscreve `onAuthStateChange` para manter estado em sync
5. Limpa `localStorage` no logout

**Fluxo de autenticação SSR (server functions):**
1. `attachSupabaseAuth` (client middleware) injeta `Authorization: Bearer <token>` em todos os RPCs de server functions
2. `requireSupabaseAuth` (server middleware) extrai o token, cria client Supabase com o JWT, valida via `getClaims()`, expõe `{ supabase, userId, claims }` no contexto

### 2. Algoritmos e lógica

- **`mapSupabaseUser`:** extrai `full_name` → `name` → `split('@')` como fallback para nome; `avatar_url` → `picture` como fallback para avatar 🟢
- **Fallback local:** `AuthProvider` tenta Supabase primeiro; se `getSupabase()` retornar `null`, carrega de `localStorage` — estratégia offline-first 🟢
- **Lazy init do cliente Supabase:** `client.ts` usa `Proxy` para instanciar o client Supabase apenas no primeiro acesso, evitando erro se as envs não estiverem disponíveis no SSR 🟢

### 3. Estruturas de dados

```typescript
interface UserSession {
  id: string;          // UUID do auth.users
  name: string;        // display name
  email: string;
  avatarUrl?: string;
}
```

### 4. Metadados e configurações

| Variável | Valor padrão no código | Confiança |
|---------|------------------------|-----------|
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `https://yonaaysrkrvfxhxbhaay.supabase.co` | 🟢 |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | anon key hardcoded | 🟢 ⚠️ exposto no client |
| `SUPABASE_SERVICE_ROLE_KEY` | sem fallback — obrigatório no server | 🟢 |

> ⚠️ **Acoplamento Lovable:** mensagens de erro nos clients ainda referenciam "Connect Supabase in Lovable Cloud" — a remover na migração.

---

## Módulo: cart

**Arquivos:** `src/context/cart.tsx`

### 1. Fluxo de controle

| Função | Comportamento | Confiança |
|--------|--------------|-----------|
| `addItem(product)` | Incrementa qty se já existe; senão insere com qty=1; dispara toast | 🟢 |
| `decrement(id)` | Decrementa qty; remove item se qty chegar a 0 | 🟢 |
| `removeItem(id)` | Remove item diretamente | 🟢 |
| `clear()` | Esvazia array e limpa `localStorage` | 🟢 |

**Persistência:** `useEffect` sincroniza `items` com `localStorage("pizza_cart")` a cada mudança. Na inicialização, `useState(loadCart)` carrega do storage.

### 2. Algoritmos e lógica

- **Cálculo de total:** `items.reduce((sum, i) => sum + i.price * i.quantity, 0)` — preço sem taxa de entrega 🟢
- **Cálculo de itemCount:** `items.reduce((sum, i) => sum + i.quantity, 0)` 🟢
- Cart é **inteiramente client-side** — sem persistência em banco de dados 🟢

### 3. Estruturas de dados

```typescript
interface CartItem extends Product {
  quantity: number;
}
// Product (de data/menu.ts):
interface Product {
  id: string; name: string; description: string;
  price: number; oldPrice?: number; category: string;
  tag?: string; image: string;
}
```

> 🔴 **LACUNA:** `Product` em `data/menu.ts` usa `oldPrice` (camelCase) mas `Product` em `lib/db/types.ts` usa `old_price` (snake_case). Há dois contratos distintos — um para dados estáticos do menu, outro para o banco. Verificar se há conversão em algum ponto.

---

## Módulo: menu

**Arquivos:** `src/data/menu.ts`, `src/components/pizza/Menu.tsx`, `src/components/pizza/ProductCard.tsx`, `src/components/pizza/CategoryNav.tsx`

### 1. Fluxo de controle

- `data/menu.ts` exporta apenas **tipos** (`Product`, `CategoryDef`) e `formatBRL` — **sem dados hardcoded** 🟢
- Dados de produtos e categorias vêm do banco via server functions do módulo `admin` (tabelas `products` e `categories`) 🟡
- `formatBRL(value)`: `value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })` 🟢

### 2. Algoritmos e lógica

- Filtragem por categoria: 🔴 LACUNA — lógica de filtragem está no componente `Menu.tsx` (não lido ainda — a confirmar no Detective)
- Ordenação de produtos: 🔴 LACUNA — a confirmar

### 3. Estruturas de dados

```typescript
interface CategoryDef { id: string; label: string; }
interface Product {
  id: string; name: string; description: string;
  price: number; oldPrice?: number; category: string;
  tag?: string; image: string;
}
```

---

## Módulo: orders

**Arquivos:** `src/lib/api/orders.functions.ts`, `src/routes/pedido.$id.tsx`

### 1. Fluxo de controle (server functions)

| Server Fn | Método | Validação | Comportamento | Confiança |
|-----------|--------|-----------|--------------|-----------|
| `createOrder` | POST | Zod schema | Insere `orders` + `order_items`; se `coupon_id` presente → chama RPC `increment_coupon_used_count`; se RPC falhar → reverte `coupon_id` no pedido | 🟢 |
| `getOrder` | GET | `{ id: string }` | Busca `orders` + `order_items` por id | 🟢 |

### 2. Algoritmos e lógica

**`createOrder` — transação parcial manual:**
```
1. INSERT orders
2. INSERT order_items (todos de uma vez)
3. Se coupon_id:
   a. RPC increment_coupon_used_count
   b. Se erro → UPDATE orders SET coupon_id=null, discount_applied=0
```
> 🔴 **LACUNA/RISCO:** Não é uma transação real — se o INSERT de `order_items` falhar após o INSERT de `orders`, o pedido existe sem itens. Supabase não tem rollback automático neste padrão.

### 3. Estruturas de dados (Zod schema de entrada)

```typescript
{
  items: Array<{ product_id, product_name, unit_price, quantity }>,
  total: number,
  delivery_address: string,          // obrigatório
  notes?: string,
  payment_method: "pix" | "money" | "card",
  user_id?: string (uuid),           // opcional — pedido anônimo permitido
  coupon_id?: string (uuid),
  discount_applied?: number,
}
```

---

## Módulo: admin

**Arquivos:** `src/lib/api/admin.functions.ts`, `src/routes/admin.tsx`

### 1. Fluxo de controle (server functions)

| Server Fn | Método | Auth | Comportamento | Confiança |
|-----------|--------|------|--------------|-----------|
| `listAllOrders` | GET | service role | Lista todos os pedidos com itens agrupados | 🟢 |
| `updateOrderStatus` | POST | service role | Atualiza `status` + `updated_at` | 🟢 |
| `listAllProducts` | GET | service role | Lista todos os produtos ordenados por `created_at` | 🟢 |
| `createProduct` | POST | service role | Insere produto | 🟢 |
| `updateProduct` | POST | service role | Atualiza todos os campos de produto | 🟢 |
| `toggleProductAvailability` | POST | service role | Atualiza apenas campo `available` | 🟢 |
| `listAllCoupons` | GET | service role | Lista todos os cupons | 🟢 |
| `createCoupon` | POST | service role | Insere cupom com `active=true` | 🟢 |
| `toggleCoupon` | POST | service role | Alterna campo `active` | 🟢 |
| `uploadImage` | POST | service role | Faz upload de imagem base64 para Storage bucket `products` | 🟢 |

**Fluxo `listAllOrders`:**
1. Busca todos orders ordenados por `created_at DESC`
2. Busca todos os `order_items` dos IDs encontrados (batch query)
3. Agrupa itens em `Map<order_id, items[]>`
4. Retorna pedidos com `items` embutidos

**Fluxo `uploadImage`:**
1. Remove prefixo `data:image/...;base64,`
2. Converte para `Uint8Array` via `atob`
3. Gera path único: `${Date.now()}-${random}.{ext}`
4. Upload para bucket `products` com `upsert: false`
5. Retorna `publicUrl`

> 🔴 **LACUNA:** `admin.tsx` não foi lido — proteção de rota (guard de autenticação admin) a confirmar. Provável que seja client-side via `useAuth()`.

### 2. Algoritmos

- `uploadImage`: conversão base64 → binário no servidor (evita limitação de tamanho em multipart do cliente) 🟢

### 3. Status do pedido (estado de máquina)

```
pending → preparing → delivering → delivered
                                  ↗
pending → cancelled
```
🟢 Confirmado via constraint SQL `check (status in ('pending','preparing','delivering','delivered','cancelled'))`

---

## Módulo: checkout

**Arquivos:** `src/routes/checkout.tsx`, `src/lib/api/coupons.functions.ts`

### 1. Fluxo de controle

**`validateCoupon` (server function POST):**
1. Busca cupom por `code` (case-insensitive via `.toUpperCase()` no schema Zod)
2. Valida: existe → ativo → não expirado → não esgotado → valor mínimo
3. Calcula desconto:
   - `percentage`: `orderTotal * (discount_value/100)`, capped em `orderTotal`
   - `fixed`: `min(discount_value, orderTotal)`
4. Retorna `{ coupon_id, code, discount_type, discount_value, discount }`

**Checkout UI (`routes/checkout.tsx`):**
1. Valida carrinho não vazio (redirect se vazio)
2. Permite aplicar cupom (chama `validateCoupon`)
3. Calcula `grandTotal = total + DELIVERY_FEE - discount`
4. Chama `createOrder` com todos os dados
5. Limpa carrinho e navega para `/pedido/:id`

### 2. Algoritmos

- **Desconto percentual:** `Math.round(orderTotal * (discount_value/100) * 100) / 100` — arredondamento para 2 casas decimais 🟢
- **Taxa de entrega:** constante `DELIVERY_FEE = 6.99` hardcoded no componente 🟢 🔴 (deve vir de configuração)

### 3. Estruturas de dados

```typescript
// Resposta de validateCoupon:
{
  coupon_id: string; code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number; discount: number;
}
```

---

## Módulo: reviews

**Arquivos:** `src/lib/api/reviews.functions.ts`

### 1. Fluxo de controle

| Server Fn | Método | Comportamento | Confiança |
|-----------|--------|--------------|-----------|
| `createReview` | POST | Insere review vinculada a `product_id` + `order_id` + `author_name` | 🟢 |
| `listProductReviews` | GET | Lista reviews por `product_id`, ordenado por `created_at DESC` | 🟢 |
| `listAllReviews` | GET | Lista todas as reviews (admin) | 🟢 |

> 🔴 **LACUNA:** Nenhuma verificação se o `order_id` pertence ao usuário que está fazendo a review. Risco de review fraudulenta.

### 2. Estruturas de dados

```typescript
// Input createReview:
{
  product_id: string; order_id: string (uuid);
  author_name: string; rating: 1|2|3|4|5; comment?: string;
}
```

---

## Módulo: database

**Arquivos:** `src/lib/db/schema.sql`, `src/lib/db/types.ts`, `supabase/migrations/*.sql`

### 1. Tabelas e relacionamentos

| Tabela | PK | FKs | RLS | Confiança |
|--------|-----|-----|-----|-----------|
| `profiles` | `id` (uuid) | → `auth.users(id)` ON DELETE CASCADE | ✅ | 🟢 |
| `categories` | `id` (text) | — | ✅ | 🟢 |
| `products` | `id` (text) | → `categories(id)` | ✅ | 🟢 |
| `orders` | `id` (uuid) | → `profiles(id)` SET NULL, → `coupons(id)` SET NULL | ✅ | 🟢 |
| `order_items` | `id` (uuid) | → `orders(id)` ON DELETE CASCADE | ✅ | 🟢 |
| `coupons` | `id` (uuid) | — | ✅ | 🟢 |
| `reviews` | `id` (uuid) | → `products(id)` CASCADE, → `profiles(id)` SET NULL, → `orders(id)` SET NULL | ✅ | 🟢 |

### 2. Políticas RLS

| Tabela | Operação | Regra | Confiança |
|--------|---------|-------|-----------|
| `profiles` | SELECT | `auth.uid() = id` | 🟢 |
| `products` | SELECT | público (true) | 🟢 |
| `categories` | SELECT | público (true) | 🟢 |
| `orders` | SELECT | `auth.uid() = user_id` | 🟢 |
| `orders` | INSERT | `auth.uid() = user_id` | 🟢 |
| `order_items` | SELECT | via subquery em `orders` | 🟢 |
| `order_items` | INSERT | via subquery em `orders` | 🟢 |

> 🔴 **LACUNA:** Sem política de SELECT/INSERT/UPDATE para `coupons`, `reviews` — admin usa service role que bypassa RLS, mas acesso direto pelo cliente não está definido.

### 3. Triggers e funções SQL

| Função | Tipo | Comportamento | Confiança |
|--------|------|--------------|-----------|
| `handle_new_user()` | TRIGGER (AFTER INSERT on auth.users) | Insere `profiles` automaticamente com `full_name` → `name` → `split('@')` fallback | 🟢 |
| `increment_coupon_used_count(p_coupon_id)` | RPC (security definer) | `UPDATE coupons SET used_count = used_count + 1` | 🟢 |

### 4. Resumo de campos por tabela

**`profiles`:** id, name, email, avatar_url, phone, created_at, updated_at

**`categories`:** id (text PK), label, display_order (int)

**`products`:** id (text PK), name, description, price (numeric 10,2), old_price, category_id, tag, image, available (bool, default true), created_at

**`orders`:** id (uuid), user_id (nullable), status (enum), total, payment_method, payment_status (enum), delivery_address, notes, coupon_id (nullable), discount_applied (default 0), created_at, updated_at

**`order_items`:** id, order_id, product_id (text), product_name, unit_price, quantity (int, default 1), created_at

**`coupons`:** id, code (unique), discount_type (enum), discount_value, min_order_value, max_uses, used_count (default 0), active (bool), expires_at, created_at

**`reviews`:** id, product_id, user_id (nullable), order_id (nullable), author_name, rating (1-5 check), comment, created_at

---

## Resumo de acoplamentos Lovable (goal da migração)

| Arquivo | Acoplamento | Ação |
|---------|-------------|------|
| `vite.config.ts` | `@lovable.dev/vite-tanstack-config` | Substituir por config manual |
| `src/lib/lovable-error-reporting.ts` | `window.__lovableEvents` | Remover ou substituir |
| `src/integrations/supabase/client.ts` | Mensagem de erro "Connect Supabase in Lovable Cloud" | Trocar mensagem |
| `src/integrations/supabase/client.server.ts` | Mensagem de erro "Connect Supabase in Lovable Cloud" | Trocar mensagem |
| `src/integrations/supabase/auth-middleware.ts` | Mensagem de erro "Connect Supabase in Lovable Cloud" | Trocar mensagem |
| `VITE_SUPABASE_PUBLISHABLE_KEY` hardcoded | anon key no código | Mover para `.env` |

## Lacunas prioritárias

| # | Lacuna | Severidade |
|---|--------|-----------|
| 1 | Ausência de transação real em `createOrder` — pedido pode existir sem itens | 🔴 Alta |
| 2 | Sem verificação de ownership em `createReview` | 🔴 Alta |
| 3 | Sem RLS para `coupons` e `reviews` no acesso cliente | 🔴 Alta |
| 4 | Taxa de entrega `DELIVERY_FEE = 6.99` hardcoded | 🟡 Média |
| 5 | Proteção de rota `/admin` a confirmar | 🟡 Média |
| 6 | Dois contratos `Product` incompatíveis (`data/menu.ts` vs `lib/db/types.ts`) | 🟡 Média |
