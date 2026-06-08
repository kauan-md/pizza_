# Avaliações

> Endpoints / contratos: `POST createReview`, `GET listProductReviews`, `GET listAllReviews`
> Arquivos: `src/lib/api/reviews.functions.ts`

## Visão Geral
Permite que clientes avaliem produtos após receber um pedido. Avaliações são exibidas no cardápio (rating médio por produto) e gerenciadas pelo admin.

## Responsabilidades
- Criar avaliação vinculada a produto e pedido
- Listar avaliações de um produto específico (cardápio público)
- Listar todas as avaliações (admin)

## Regras de Negócio
- Rating deve ser inteiro entre 1 e 5 (validado em Zod + constraint SQL) 🟢
- `author_name` obrigatório (mínimo 1 caractere) 🟢
- `comment` opcional 🟢
- **Sem verificação de ownership**: qualquer usuário autenticado pode criar review em qualquer `order_id` 🔴
- `user_id` em `reviews` é nullable — identificação por `author_name` 🟢
- Sem limite de reviews por produto/pedido 🔴

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Criar avaliação | Must | Review inserida com product_id, order_id, author_name, rating |
| RF-02 | Listar reviews de um produto | Must | Lista ordenada por `created_at DESC` |
| RF-03 | Listar todas as reviews (admin) | Should | Lista completa para moderação |
| RF-04 | Rating entre 1 e 5 | Must | Validação Zod + constraint SQL rejeitam fora do intervalo |

## Critérios de Aceitação

```gherkin
Dado um rating de 6
Quando createReview for chamado
Então deve retornar erro de validação Zod

Dado um product_id e order_id válidos
Quando createReview for chamado com rating=5
Então deve inserir e retornar { success: true }

Dado um product_id com reviews
Quando listProductReviews for chamado
Então deve retornar lista ordenada do mais recente ao mais antigo
```

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/lib/api/reviews.functions.ts` | `createReview`, `listProductReviews`, `listAllReviews` | 🟢 |
| `src/routes/pedido.$id.tsx` | Formulário de review inline | 🟢 |
| `src/components/pizza/Menu.tsx` | Exibição de rating médio por produto | 🟢 |
