# Checkout

> Endpoints / contratos: `POST validateCoupon`, `POST createOrder`, rota `/checkout`
> Arquivos: `src/routes/checkout.tsx`, `src/lib/api/coupons.functions.ts`, `src/lib/api/orders.functions.ts`

## Visão Geral
Fluxo de finalização de pedido. O usuário informa endereço de entrega, método de pagamento, aplica cupom opcional e confirma o pedido. Integra validação de cupom e criação do pedido via server functions.

## Responsabilidades
- Validar cupom via server function antes da confirmação
- Calcular grand total: `subtotal + DELIVERY_FEE - desconto`
- Criar pedido no banco (orders + order_items + incremento de cupom)
- Limpar carrinho após pedido criado com sucesso
- Redirecionar para `/pedido/:id` após confirmação

## Regras de Negócio
- Carrinho deve ter pelo menos 1 item para acessar o checkout 🟢
- `DELIVERY_FEE = 6.99` (constante hardcoded) 🟢 / 🔴 deve vir de configuração
- Cupom validado em: ativo + não expirado + max_uses não atingido + min_order_value respeitado 🟢
- Desconto percentual: `round(orderTotal × val/100 × 100) / 100`, capped em `orderTotal` 🟢
- Desconto fixo: `min(discount_value, orderTotal)` 🟢
- `grandTotal = total + DELIVERY_FEE - discount` (nunca negativo) 🟢
- Pedido anônimo permitido (`user_id` é opcional) 🟢
- Se cupom falhar no `createOrder`, pedido é criado sem desconto (não cancela o pedido) 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Redirecionar se carrinho vazio | Must | UI de "carrinho vazio" com botão de volta ao cardápio |
| RF-02 | Informar endereço de entrega | Must | Campo obrigatório — `delivery_address.length >= 1` |
| RF-03 | Escolher método de pagamento | Must | Um dos: pix, dinheiro, cartão |
| RF-04 | Aplicar cupom | Should | Código validado server-side antes de exibir desconto |
| RF-05 | Exibir resumo com totais | Must | Subtotal, taxa, desconto e grand total visíveis |
| RF-06 | Confirmar pedido | Must | `createOrder` chamado; carrinho limpo; redirect para `/pedido/:id` |
| RF-07 | Tratar erro de cupom inválido | Should | Mensagem de erro específica (expirado, limite, valor mínimo) |
| RF-08 | Loading state durante submissão | Should | Botão desabilitado e indicador visual enquanto `submitting=true` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência | Confiança |
|------|--------------------|-----------|-----------|
| Segurança | `createOrder` usa `getSupabaseServer()` (sem RLS bypass — usa anon key no server) | `orders.functions.ts` | 🟡 a confirmar |
| Transação | Pedido pode ser criado sem itens se INSERT de `order_items` falhar | `orders.functions.ts` | 🔴 risco |

## Critérios de Aceitação

```gherkin
Dado que o carrinho tem itens e o endereço foi preenchido
Quando o usuário confirmar o pedido
Então createOrder deve ser chamado, carrinho limpo e redirect para /pedido/:id

Dado que o cupom está expirado
Quando validateCoupon for chamado
Então deve retornar erro "Este cupom expirou."

Dado que o valor do pedido está abaixo do mínimo do cupom
Quando validateCoupon for chamado
Então deve retornar erro com o valor mínimo formatado em BRL
```

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/routes/checkout.tsx` | `Checkout`, `handleApplyCoupon`, `handleSubmit` | 🟢 |
| `src/lib/api/coupons.functions.ts` | `validateCoupon` | 🟢 |
| `src/lib/api/orders.functions.ts` | `createOrder` | 🟢 |
