# Data Delta — 001-desacoplar-lovable-supabase

## Escopo do delta de dados

Mudanças de dados necessárias para sustentar RBAC no admin e ownership check de reviews dentro da mesma feature.

## Modelo atual (baseline)

- `profiles` sem campo de papel administrativo.
- `reviews` permite inserção sem validação forte de pertencimento do pedido.
- RLS incompleta em partes sensíveis já apontadas em `_reversa_sdd/architecture.md#6. Dívidas Técnicas`.

## Mudanças propostas

### 1) RBAC

- **Tabela afetada:** `profiles`
- **Mudança:** adicionar campo `role` com domínio controlado
- **Proposta conceitual:**
  - `role text not null default 'user'`
  - constraint `check (role in ('user','admin'))`
- **Impacto:** habilita autorização explícita no backend e no frontend admin.

### 2) Ownership de reviews

- **Tabelas afetadas:** `reviews`, `orders` (consulta de validação)
- **Mudança:** operação de criação de review passa a validar que `order_id` pertence ao usuário autenticado.
- **Impacto:** impede criação de review para pedido de terceiros.

### 3) Políticas e segurança

- Revisar políticas RLS relacionadas a leitura/escrita de reviews e operações administrativas.
- Garantir separação entre operações com service role e operações com contexto de usuário.

## Migrações necessárias

1. Migration de schema para `profiles.role`.
2. Backfill opcional para primeiro admin (seed controlado).
3. Ajustes de policy/function para ownership enforcement.

## Riscos de dados

- Usuários existentes sem role explícita: mitigado por default `user`.
- Falha em promover admin inicial: mitigado por script operacional de onboarding.
- Rejeição indevida de review legítima: mitigado por teste de integração com casos positivo/negativo.

## Critérios de validação de dados

- Existe ao menos um usuário com `role='admin'` no ambiente alvo.
- Usuário `user` não consegue executar operação admin.
- Usuário autenticado só cria review para pedido próprio.
