# Roadmap: Desacoplamento do Lovable e Consolidação em Supabase + Vercel

> Identificador: `001-desacoplar-lovable-supabase`
> Data: `2026-06-08`
> Requirements: `_reversa_forward/001-desacoplar-lovable-supabase/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A abordagem é remover os pontos de acoplamento do Lovable por camadas, preservando runtime e contratos existentes. Primeiro, substituímos o build wrapper `@lovable.dev/vite-tanstack-config` por configuração explícita em `vite.config.ts` com plugins oficiais já presentes na base. Em paralelo, removemos `lovable-error-reporting` do fluxo crítico e padronizamos mensagens de configuração Supabase para linguagem neutra. Em seguida, eliminamos fallback hardcoded de credenciais e validamos execução estrita por variáveis de ambiente. Como o escopo aprovado inclui segurança crítica, a mesma feature incorpora RBAC para `/admin` e ownership check de reviews. A conclusão da migração será condicionada a checklist automatizado em CI com cobertura completa de rotas.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| n/a | `.reversa/principles.md` não encontrado no projeto; sem princípio formal a validar neste estágio. | respeita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Substituir `@lovable.dev/vite-tanstack-config` por `vite.config.ts` explícito com plugins oficiais | Remove lock-in de build e mantém compatibilidade Vercel/Nitro | Manter wrapper Lovable; migrar para outro framework | 🟢 |
| D-02 | Remover `window.__lovableEvents` do caminho crítico e adotar logger interno estruturado | Decisão de clarificação 2b; reduz dependência externa e mantém observabilidade mínima | Sentry nesta etapa; sem observabilidade | 🟢 |
| D-03 | Proibir fallback hardcoded de URL/chave Supabase em todos os ambientes | Decisão de clarificação 4a; melhora segurança e governança de segredos | Permitir fallback em dev; manter fallback temporário | 🟢 |
| D-04 | Incluir RBAC de admin e ownership de reviews nesta mesma feature | Decisão de clarificação 1a; resolve risco crítico sem postergar | Criar feature separada; incluir só um dos itens | 🟢 |
| D-05 | Definir pronto de migração por checklist automatizado em CI com cobertura completa de rotas | Decisões de clarificação 3b + 5d; reduz subjetividade do cutover | Smoke manual apenas; canário sem gate de CI | 🟢 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| n/a | Não há `[DÚVIDA]` em aberto após `/reversa-clarify`. | baixo |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Build/Tooling (`vite.config.ts`) | `_reversa_sdd/architecture.md#8. Arquitetura alvo após migração (objetivo declarado)` | contrato-alterado | Sai wrapper Lovable, entra composição explícita de plugins Vite/TanStack/Nitro. |
| Error reporting client (`lovable-error-reporting.ts`) | `_reversa_sdd/inventory.md#9. Acoplamentos com Lovable (goal: desacoplar)` | componente-extinto | Remoção do SDK Lovable e substituição por logger interno no app shell. |
| Auth config (`integrations/supabase/*.ts`) | `_reversa_sdd/code-analysis.md#Módulo: auth` | regra-alterada | Mensagens neutras e ausência de fallback hardcoded para credenciais. |
| Admin authorization (`routes/admin.tsx` + server functions admin) | `_reversa_sdd/domain.md#RN-10: Admin sem controle de acesso real` | regra-alterada | Introdução de RBAC para restringir acesso ao painel e operações administrativas. |
| Reviews ownership (`reviews.functions.ts`) | `_reversa_sdd/domain.md#RN-11: Avaliação vinculada ao pedido mas sem verificação de propriedade` | regra-alterada | Inclusão de validação de pertencimento de pedido antes de criar review. |
| CI quality gate | `_reversa_sdd/architecture.md#6. Dívidas Técnicas` | componente-novo | Pipeline automatizado de regressão com cobertura de todas as rotas. |

## 6. Delta no modelo de dados

- Resumo das mudanças: adicionar representação de papel de usuário (RBAC), atualizar políticas/validações para ownership de reviews e revisar políticas RLS relacionadas a áreas administrativas.
- Detalhe completo em: `_reversa_forward/001-desacoplar-lovable-supabase/data-delta.md`

## 7. Delta de contratos externos

n/a — a feature não introduz novo contrato externo HTTP/fila/gRPC/GraphQL. As mudanças são de configuração interna, segurança e governança de deploy.

## 8. Plano de migração

1. Remover dependências/integrações Lovable do build e runtime sem tocar contratos funcionais do app.
2. Implementar configuração explícita Vite/Nitro para Vercel e validar build local/CI.
3. Eliminar fallback hardcoded de credenciais e padronizar env requirements.
4. Implementar RBAC no admin e ownership check em reviews.
5. Executar checklist automatizado de regressão com cobertura completa de rotas.
6. Publicar em Vercel após gate verde da pipeline.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Regressão de build SSR após remover wrapper Lovable | alto | médio | Construir matriz de smoke de build/dev/prod e validar preset Vercel antes de merge |
| Quebra de autenticação por endurecimento de envs | alto | médio | Mensagens claras de env faltante + documentação onboarding atualizada |
| Bloqueio indevido de admin por RBAC mal configurado | alto | médio | Seeder de usuário admin + teste de autorização positivo/negativo em CI |
| Falso positivo de regressão por cobertura total de rotas | médio | médio | Baseline versionado de rotas e normalização de critérios de aceite por rota |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)
- [ ] Checklist automatizado em CI aprovado com cobertura completa de rotas

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-08 | Versão inicial gerada por `/reversa-plan` | reversa |
