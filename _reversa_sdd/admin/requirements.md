# Admin

> Endpoints / contratos: `GET listAllOrders`, `POST updateOrderStatus`, `GET listAllProducts`, `POST createProduct`, `POST updateProduct`, `POST toggleProductAvailability`, `POST uploadImage`, `GET listAllCoupons`, `POST createCoupon`, `POST toggleCoupon`
> Arquivos: `src/routes/admin.tsx`, `src/lib/api/admin.functions.ts`

## Visão Geral
Painel administrativo com 4 abas: Pedidos, Produtos, Cupons e Avaliações. Todas as operações usam `supabaseAdmin` (service role — bypassa RLS). Novos pedidos são notificados em tempo real via Supabase Realtime.

## Responsabilidades
- Listar e atualizar status de todos os pedidos com notificação em tempo real
- CRUD de produtos (criar, editar, ativar/desativar, upload de imagem)
- CRUD de cupons (criar, ativar/desativar)
- Visualizar todas as avaliações

## Regras de Negócio
- **RISCO CRÍTICO:** Qualquer usuário autenticado acessa `/admin` — sem verificação de papel 🔴
- Novos pedidos disparam som (Web Audio API) + toast + recarga da lista 🟢
- Transições de status do pedido conforme `nextStatuses`: pending→[preparing, cancelled], preparing→[delivering, cancelled], delivering→[delivered], delivered→[], cancelled→[] 🟢
- Todas as operações admin usam service role (bypassa RLS) 🟢
- Upload de imagem: base64 → Uint8Array → Supabase Storage (bucket `products`) 🟢
- Path de imagem gerado: `${Date.now()}-${random}.{ext}` 🟢
- Produto desativado (`available=false`) não aparece no cardápio público 🟢 [reclassificado — `Menu.tsx` confirma `.eq("available", true)`]

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Listar todos os pedidos com itens | Must | Lista ordenada por `created_at DESC` com itens agrupados |
| RF-02 | Atualizar status de pedido | Must | Status alterado conforme transições permitidas |
| RF-03 | Notificação em tempo real de novo pedido | Must | Som + toast + recarga automática ao INSERT em `orders` |
| RF-04 | Listar, criar e editar produtos | Must | CRUD completo de produtos com validação Zod |
| RF-05 | Ativar/desativar produto | Must | `available` alternado sem afetar pedidos históricos |
| RF-06 | Upload de imagem de produto | Must | Imagem armazenada no bucket `products`; URL pública retornada |
| RF-07 | Listar, criar e ativar/desativar cupons | Must | CRUD de cupons com `active` alternável |
| RF-08 | Visualizar todas as avaliações | Should | Lista de reviews com product_id, rating e comentário |
| RF-09 | Redirecionar não-autenticados para `/` | Must | `if (!user) navigate({ to: "/" })` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência | Confiança |
|------|--------------------|-----------|-----------|
| Segurança | **CRÍTICO**: sem RBAC — qualquer conta autenticada é admin | `admin.tsx:useAuth` | 🔴 |
| Segurança | Service role key apenas no servidor — nunca exposta ao cliente | `client.server.ts` | 🟢 |
| Performance | `listAllOrders` faz batch query de `order_items` (evita N+1) | `admin.functions.ts` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado que há um novo pedido inserido no banco
Quando o admin está na página /admin
Então deve tocar som, exibir toast e recarregar a lista automaticamente

Dado que o pedido está em status "preparing"
Quando o admin tentar avançar o status
Então as opções disponíveis devem ser "delivering" e "cancelled" apenas

Dado um usuário não autenticado
Quando acessar /admin
Então deve ser redirecionado para /
```

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/routes/admin.tsx` | `AdminPage`, `OrdersTab`, `nextStatuses`, canal Realtime | 🟢 |
| `src/lib/api/admin.functions.ts` | `listAllOrders`, `updateOrderStatus`, `listAllProducts`, `createProduct`, `updateProduct`, `toggleProductAvailability`, `uploadImage`, `listAllCoupons`, `createCoupon`, `toggleCoupon` | 🟢 |
| `src/lib/notification.ts` | `playNotificationSound`, `incrementNewOrderCount`, `clearNewOrderCount` | 🟢 |
