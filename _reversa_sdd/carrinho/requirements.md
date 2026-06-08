# Carrinho

> Endpoint / contrato: `CartContext` (client-side apenas)
> Arquivos: `src/context/cart.tsx`, `src/components/pizza/CartBar.tsx`, `src/components/pizza/CartSheet.tsx`, `src/components/pizza/AddToCartModal.tsx`

## Visão Geral
Estado client-side do carrinho de compras, persistido em `localStorage`. Sem persistência em banco de dados — efêmero por sessão de browser. Expõe contexto React para adicionar, remover e limpar itens.

## Responsabilidades
- Manter lista de itens com quantidades
- Persistir carrinho em `localStorage("pizza_cart")`
- Calcular total e contagem de itens
- Notificar o usuário ao adicionar item (toast Sonner)

## Regras de Negócio
- `addItem`: se produto já existe no carrinho, incrementa `quantity` em 1; caso contrário insere com `quantity=1` 🟢
- `decrement`: reduz `quantity` em 1; remove o item se `quantity` chegar a 0 🟢
- `clear()`: esvazia array e remove `localStorage("pizza_cart")` 🟢
- `total = Σ(item.price × item.quantity)` — sem taxa de entrega 🟢
- `itemCount = Σ(item.quantity)` 🟢
- Carrinho não é vinculado ao usuário autenticado — anônimo e autenticado têm o mesmo carrinho 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Adicionar produto ao carrinho | Must | Item aparece na lista; quantidade incrementada se duplicado |
| RF-02 | Remover produto diretamente | Must | Item removido da lista |
| RF-03 | Decrementar quantidade | Must | Quantity -1; item removido ao chegar em 0 |
| RF-04 | Limpar carrinho | Must | Lista vazia; localStorage limpo |
| RF-05 | Persistir entre recargas de página | Should | Carrinho restaurado do localStorage no mount |
| RF-06 | Exibir toast ao adicionar | Should | Toast com nome do produto aparece |
| RF-07 | Calcular total em tempo real | Must | Total atualizado a cada mudança |

## Critérios de Aceitação

```gherkin
Dado que o carrinho está vazio
Quando addItem(produto) for chamado
Então o item deve aparecer com quantity=1

Dado que o produto já está no carrinho
Quando addItem(produto) for chamado novamente
Então quantity deve ser incrementado em 1

Dado que um item tem quantity=1
Quando decrement(id) for chamado
Então o item deve ser removido do carrinho

Dado que há itens no carrinho
Quando a página for recarregada
Então os itens devem ser restaurados do localStorage
```

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/context/cart.tsx` | `CartProvider`, `addItem`, `decrement`, `removeItem`, `clear` | 🟢 |
| `src/components/pizza/CartBar.tsx` | `CartBar` | 🟡 (não lido) |
| `src/components/pizza/CartSheet.tsx` | `CartSheet` | 🟡 (não lido) |
| `src/components/pizza/AddToCartModal.tsx` | `AddToCartModal` | 🟡 (não lido) |
