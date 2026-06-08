# Domain — Pizza Lopez

> Gerado pelo Detective em 2026-06-08
> doc_level: essencial

## Escala de confiança
- 🟢 CONFIRMADO — extraído diretamente do código
- 🟡 INFERIDO — baseado em padrões, pode estar errado
- 🔴 LACUNA — requer validação humana

---

## 1. Glossário de Domínio

| Termo | Definição | Confiança |
|-------|-----------|-----------|
| **Pedido** (`Order`) | Unidade transacional central — agrupa itens, endereço, método de pagamento e status de entrega | 🟢 |
| **Item de Pedido** (`OrderItem`) | Snapshot imutável de um produto no momento do pedido (guarda `product_name` e `unit_price` diretamente, não por FK) | 🟢 |
| **Produto** (`Product`) | Item do cardápio gerenciado pelo admin. Pode ser desativado (`available=false`) sem ser excluído | 🟢 |
| **Categoria** (`Category`) | Agrupador de produtos com ordem de exibição explícita (`display_order`) | 🟢 |
| **Cupom** (`Coupon`) | Código promocional com desconto percentual ou fixo, com regras de validade | 🟢 |
| **Perfil** (`Profile`) | Extensão do usuário Supabase Auth — criado automaticamente via trigger | 🟢 |
| **Review** | Avaliação de produto vinculada a um pedido; rating de 1 a 5 | 🟢 |
| **Carrinho** | Estado client-side efêmero — persiste em `localStorage`, não no banco | 🟢 |
| **Taxa de Entrega** | Valor fixo de R$ 6,99 somado ao total antes do desconto | 🟢 |
| **Desconto** | Redução aplicada pelo cupom sobre `(subtotal + taxa de entrega)` | 🟢 |
| **Grand Total** | `subtotal + DELIVERY_FEE - discount_coupon` | 🟢 |
| **Admin** | Papel implícito — qualquer usuário autenticado pode acessar `/admin` | 🔴 |

---

## 2. Regras de Negócio

### RN-01: Pedido anônimo permitido
- `user_id` em `orders` é nullable
- Um pedido pode ser criado sem usuário autenticado
- 🟢 Confirmado via schema SQL e Zod schema do `createOrder`

### RN-02: Snapshot de produto no pedido
- `order_items` armazena `product_name` e `unit_price` diretamente
- Alterações futuras no produto não afetam pedidos históricos
- 🟢 Confirmado via schema SQL e server function `createOrder`

### RN-03: Taxa de entrega fixa
- `DELIVERY_FEE = 6.99` definida como constante hardcoded em `routes/checkout.tsx`
- Valor fixo em BRL, sem variação por zona, peso ou distância
- 🟢 Confirmado / 🔴 Lacuna: origem do valor não justificada, deve vir de configuração

### RN-04: Validação de cupom em cadeia
Cupom válido se **todas** as condições forem atendidas (ordem de verificação):
1. Código existe na tabela
2. `active = true`
3. `expires_at` nulo ou no futuro
4. `max_uses` nulo ou `used_count < max_uses`
5. `min_order_value` nulo ou `orderTotal >= min_order_value`
- 🟢 Confirmado via `coupons.functions.ts`

### RN-05: Cálculo de desconto
- **Percentual:** `round(orderTotal × (discount_value / 100) × 100) / 100`, capped em `orderTotal`
- **Fixo:** `min(discount_value, orderTotal)`
- Desconto nunca pode exceder o valor do pedido
- 🟢 Confirmado via `coupons.functions.ts`

### RN-06: Incremento atômico de uso de cupom
- Ao confirmar pedido com cupom, a RPC `increment_coupon_used_count` é chamada no servidor
- Se a RPC falhar → o `coupon_id` e `discount_applied` são revertidos no pedido (o pedido continua, mas sem desconto)
- 🟢 Confirmado via `orders.functions.ts`

### RN-07: Produto desativável sem exclusão
- Campo `available boolean default true` em `products`
- Admin pode alternar via `toggleProductAvailability`
- Produtos desativados presumivelmente não aparecem no cardápio público
- 🟢/🟡 (lógica de ocultação no front a confirmar)

### RN-08: Notificação em tempo real de novos pedidos
- Admin escuta channel Supabase Realtime `admin-orders` com evento `INSERT` na tabela `orders`
- Ao receber novo pedido: toca som via Web Audio API + exibe toast + recarrega lista
- Contador de novos pedidos persiste em `localStorage("admin_new_orders")`
- 🟢 Confirmado via `routes/admin.tsx`

### RN-09: Perfil automático no registro
- Trigger `on_auth_user_created` insere automaticamente em `profiles` ao criar usuário no Supabase Auth
- Nome: `full_name` → `name` → prefixo do email
- 🟢 Confirmado via `schema.sql`

### RN-10: Admin sem controle de acesso real
- A rota `/admin` verifica apenas `if (!user) navigate({ to: "/" })`
- Qualquer usuário autenticado pode acessar o painel admin
- Não há campo `role` em `profiles`, nem middleware de autorização admin
- 🟢 Confirmado / 🔴 **RISCO CRÍTICO DE SEGURANÇA**

### RN-11: Avaliação vinculada ao pedido mas sem verificação de propriedade
- `createReview` aceita qualquer `order_id` — não verifica se o order pertence ao autor
- Qualquer usuário autenticado pode criar review em nome de qualquer pedido
- 🟢 Confirmado / 🔴 **RISCO**

### RN-12: Dois contratos de produto incompatíveis
- `data/menu.ts` → `Product` com `oldPrice` (camelCase) e `category: string`
- `lib/db/types.ts` → `Product` com `old_price` (snake_case) e `category_id: string`
- O primeiro é o contrato de frontend/carrinho; o segundo é o contrato do banco
- 🟢 Confirmado / 🟡 Conversão implícita deve existir em algum componente

---

## 3. Regras de Negócio — Arqueologia Git

Apenas 1 commit encontrado: `"Migração para o repositório do Lovable"` — sem histórico de decisões técnicas anteriores. Todas as ADRs são inferidas do código.

**ADR retroativa implícita — Decisões detectadas:**

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Usar Supabase como BaaS único (auth + DB + storage + realtime) | Toda a integração, sem outro backend | 🟢 |
| TanStack Start como framework SSR em vez de Next.js | `package.json`, `vite.config.ts` | 🟢 |
| Carrinho client-side (sem persistência no banco) | `context/cart.tsx` usando apenas `localStorage` | 🟢 |
| Deploy na Vercel (não Lovable Cloud) | `nitro: { preset: "vercel" }` em `vite.config.ts` | 🟢 |
| Admin sem RBAC — acesso por "security through obscurity" | Ausência de qualquer campo `role` ou middleware de autorização | 🟢 |
| Snapshot de produto no pedido (denormalização intencional) | `order_items` com `product_name` + `unit_price` embutidos | 🟢 |
