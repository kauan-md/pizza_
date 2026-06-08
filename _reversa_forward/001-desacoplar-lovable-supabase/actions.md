# Actions: Desacoplamento do Lovable e Consolidação em Supabase + Vercel

> Identificador: `001-desacoplar-lovable-supabase`
> Data: `2026-06-08`
> Roadmap: `_reversa_forward/001-desacoplar-lovable-supabase/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 10 |
| Paralelizáveis (`[//]`) | 5 |
| Maior cadeia de dependência | 4 |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Remover `@lovable.dev/vite-tanstack-config` de `package.json` e do lockfile de dependências | - | `[//]` | `package.json` | 🟢 | `[X]` |
| T002 | Criar `vite.config.ts` explícito com `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-tsconfig-paths`, `@tanstack/router-plugin` e presets Nitro/Vercel | T001 | - | `vite.config.ts` | 🟢 | `[X]` |
| T003 | Eliminar referências de runtime ao Lovable, incluindo `src/lib/lovable-error-reporting.ts` e `window.__lovableEvents` | - | `[//]` | `src/lib/lovable-error-reporting.ts` | 🟢 | `[X]` |
| T004 | Hardenizar o carregamento de Supabase removendo fallback hardcoded de URL/chave e adicionando falha rápida em envs ausentes | - | `[//]` | `src/integrations/supabase/client.ts` | 🟢 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Adicionar teste de integração que garanta RBAC em `/admin` e bloqueie acesso de usuário não-admin | T007 | `[//]` | `src/routes/admin.tsx` | 🟢 | `[ ]` |
| T006 | Adicionar teste de integração que valide ownership ao criar review para um pedido | T008 | `[//]` | `src/lib/api/reviews.functions.ts` | 🟢 | `[ ]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T007 | Implementar RBAC server-side para o painel e operações administrativas no admin | T002 | - | `src/routes/admin.tsx` | 🟢 | `[X]` |
| T008 | Implementar validação de ownership na criação de reviews para garantir que o pedido pertence ao usuário autenticado | T004 | - | `src/lib/api/reviews.functions.ts` | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T009 | Documentar checklist de regressão e critérios de cobertura de rotas para validação de CI/cutover | T005, T006 | - | `_reversa_forward/001-desacoplar-lovable-supabase/onboarding.md` | 🟢 | `[ ]` |
| T010 | Validar build local e inicialização com o novo `vite.config.ts` e envs de Supabase obrigatórias | T002, T004 | `[//]` | `vite.config.ts` | 🟢 | `[ ]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T011 | Atualizar `onboarding.md` com os requisitos finais de env e cutover para a migração | T009 | - | `_reversa_forward/001-desacoplar-lovable-supabase/onboarding.md` | 🟢 | `[ ]` |
| T012 | Revisar a documentação interna de deploy/Vercel para garantir que não há menções ao Lovable e que os envs são definidos corretamente | T009 | - | `vercel.json` | 🟡 | `[ ]` |

## Notas de execução

<!--
Reservado para /reversa-coding registrar avisos ou observações que surgirem durante a execução.
-->

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-08 | Versão inicial gerada por `/reversa-to-do` | reversa |
