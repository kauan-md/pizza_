# Pedido (Confirmação)

> Endpoint / contrato: `GET /pedido/$id`, `GET getOrder`, `POST createReview`
> Arquivos: `src/routes/pedido.$id.tsx`, `src/lib/api/orders.functions.ts`, `src/lib/api/reviews.functions.ts`

## Visão Geral
Página de confirmação e acompanhamento de pedido. Exibe detalhes do pedido (itens, status, endereço, pagamento) e permite ao cliente avaliar cada produto do pedido.

## Responsabilidades
- Carregar pedido e seus itens via `getOrder(id)`
- Exibir status atual do pedido com label traduzido
- Permitir submissão de avaliação (rating + comentário) por produto
- Exibir informações de pagamento e entrega

## Regras de Negócio
- Pedido acessível por qualquer pessoa com o UUID — sem verificação de propriedade 🔴
- Status exibido com labels em PT-BR: pending→"Aguardando confirmação", preparing→"Preparando", delivering→"Saiu para entrega", delivered→"Entregue", cancelled→"Cancelado" 🟢
- `payment_status` exibido mas nunca muda de "Aguardando pagamento" (integração não implementada) 🔴
- Review vinculada ao `order_id` e `product_id` — `author_name` informado manualmente 🟢
- Sem verificação se o cliente realmente pertence ao pedido 🔴

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Carregar pedido por UUID | Must | Dados do pedido exibidos corretamente |
| RF-02 | Exibir itens do pedido | Must | Lista de produtos com qtd, preço unitário e subtotal |
| RF-03 | Exibir status com label traduzido | Must | Status legível em PT-BR |
| RF-04 | Exibir totais (subtotal, taxa, desconto, total) | Must | Valores formatados em BRL |
| RF-05 | Submeter avaliação por produto | Should | Review criada no banco com rating 1-5 e comentário opcional |
| RF-06 | Loading skeleton durante carregamento | Should | Placeholder visível antes dos dados |
| RF-07 | Tratamento de erro (pedido não encontrado) | Must | UI de erro sem crash |

## Critérios de Aceitação

```gherkin
Dado que existe um pedido com o ID fornecido
Quando a página /pedido/:id carregar
Então os itens, status e totais devem ser exibidos

Dado que o status do pedido é "delivering"
Quando a página exibir o status
Então deve aparecer "Saiu para entrega"

Dado que o usuário preencheu rating e nome
Quando submeter a avaliação de um produto
Então createReview deve ser chamado e toast de sucesso exibido
```

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/routes/pedido.$id.tsx` | `OrderConfirmation`, fluxo de review | 🟢 |
| `src/lib/api/orders.functions.ts` | `getOrder` | 🟢 |
| `src/lib/api/reviews.functions.ts` | `createReview` | 🟢 |
