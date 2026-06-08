# Cardápio

> Endpoint / contrato: `GET /` (página principal) + queries diretas ao Supabase
> Arquivos: `src/components/pizza/Menu.tsx`, `src/components/pizza/ProductCard.tsx`, `src/components/pizza/CategoryNav.tsx`, `src/data/menu.ts`

## Visão Geral
Exibe o cardápio dinâmico carregado do banco Supabase. Lista categorias e produtos disponíveis com filtragem por categoria, avaliações médias por produto e suporte a carrinho. Acesso público (sem autenticação).

## Responsabilidades
- Carregar categorias ordenadas por `display_order`
- Carregar produtos com `available = true` ordenados por `created_at`
- Calcular e exibir rating médio por produto (carregado client-side junto com produtos)
- Filtrar produtos por categoria ativa
- Converter contrato DB (`old_price`, `category_id`) para contrato UI (`oldPrice`, `category`)

## Regras de Negócio
- Apenas produtos com `available = true` são exibidos 🟢
- Categorias exibidas na ordem de `display_order` 🟢
- Rating médio calculado no cliente: `round(sum/count * 10) / 10` 🟢
- Mensagem de erro específica quando Supabase não configurado 🟡 (referência "Lovable" a remover)
- Categoria inicial padrão: `"ofertas"` 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Carregar categorias do banco | Must | Lista de categorias exibida na ordem correta |
| RF-02 | Carregar produtos disponíveis | Must | Apenas `available=true` exibidos |
| RF-03 | Filtrar por categoria | Must | Clicar em categoria exibe apenas seus produtos |
| RF-04 | Exibir rating médio por produto | Should | Badge com média e contagem visível no card |
| RF-05 | Skeleton loading durante carregamento | Should | Placeholders visíveis antes dos dados chegarem |
| RF-06 | Tratamento de erro de carregamento | Must | Mensagem de erro clara quando Supabase falha |
| RF-07 | Mapear produto DB → contrato UI | Must | `old_price` → `oldPrice`, `category_id` → `category` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência | Confiança |
|------|--------------------|-----------|-----------|
| Performance | Queries de categories + products + reviews em sequência (3 round-trips) | `Menu.tsx:useEffect` | 🟢 |
| Disponibilidade | Fallback de erro exibido sem crash da página | `Menu.tsx:catch` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado que o Supabase está configurado
Quando a página inicial carregar
Então categorias e produtos disponíveis devem ser exibidos

Dado que o usuário clica em uma categoria
Quando o filtro é aplicado
Então apenas produtos daquela categoria devem aparecer

Dado que um produto tem avaliações
Quando o card for exibido
Então deve mostrar a média arredondada para 1 decimal e o total de avaliações
```

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/components/pizza/Menu.tsx` | `Menu`, `mapProduct`, `load()` | 🟢 |
| `src/components/pizza/ProductCard.tsx` | `ProductCard` | 🟡 (não lido) |
| `src/components/pizza/CategoryNav.tsx` | `CategoryNav` | 🟡 (não lido) |
| `src/data/menu.ts` | `Product`, `CategoryDef`, `formatBRL` | 🟢 |
