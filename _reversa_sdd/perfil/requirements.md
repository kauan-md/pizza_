# Perfil

> Endpoint / contrato: `GET /perfil` + queries diretas ao Supabase
> Arquivos: `src/routes/perfil.tsx`

## Visão Geral
Área do usuário autenticado. Exibe informações da conta e histórico de pedidos do usuário filtrado por `user_id`.

## Responsabilidades
- Redirecionar não-autenticados para `/`
- Exibir dados do perfil do usuário autenticado
- Carregar e exibir histórico de pedidos do usuário com itens
- Disponibilizar logout

## Regras de Negócio
- Rota exige autenticação — redireciona para `/` se `!user` 🟢
- Pedidos filtrados por `user_id = user.id` (RLS + filtro explícito) 🟢
- Pedidos carregados via client Supabase com JWT do usuário (respeita RLS) 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Redirecionar não autenticado | Must | `navigate("/")` quando `!user` |
| RF-02 | Exibir nome e email do usuário | Must | Dados do `UserSession` exibidos |
| RF-03 | Listar pedidos do usuário | Must | Pedidos ordenados por `created_at DESC` com itens |
| RF-04 | Link para detalhes do pedido | Should | Link `/pedido/:id` para cada pedido |
| RF-05 | Logout | Must | `logout()` chamado ao clicar no botão |

## Critérios de Aceitação

```gherkin
Dado que o usuário não está autenticado
Quando acessar /perfil
Então deve ser redirecionado para /

Dado que o usuário está autenticado e tem pedidos
Quando acessar /perfil
Então deve ver seu histórico de pedidos com status e totais
```

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/routes/perfil.tsx` | `Profile`, `loadOrders` | 🟢 |
