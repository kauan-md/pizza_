# Legacy Impact

> Feature: `001-desacoplar-lovable-supabase`
> Data: `2026-06-08`

## Context
A migração removeu o acoplamento direto do aplicativo ao ecossistema Lovable e consolidou o runtime em Supabase + Vercel.

## Arquivos modificados
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `src/lib/error-reporting.ts`
- `src/routes/__root.tsx`
- `src/lib/supabase.ts`
- `src/lib/api/supabase.server.ts`
- `src/integrations/supabase/client.server.ts`
- `src/integrations/supabase/auth-middleware.ts`
- `src/lib/api/admin.functions.ts`
- `src/lib/api/reviews.functions.ts`
- `src/routes/admin.tsx`

## Alterações principais
- Removido `@lovable.dev/vite-tanstack-config` da configuração do projeto e do lockfile.
- Substituído wrapper de build Lovable por configuração explícita do Vite com plugins React, Tailwind, Nitro e roteador TanStack.
- Eliminadas referências de runtime ao Lovable, incluindo captura de erros em `window.__lovableEvents`.
- Hardenização da inicialização do Supabase para exigir `SUPABASE_URL` e `SUPABASE_KEY` sem fallback inseguro.
- Introduzido controle de acesso administrativo server-side para a rota `/admin`.
- Adicionada validação de ownership de pedidos na criação de reviews.

## Resultados esperados
- O projeto deve compilar com Vite/Nitro sem dependência de Lovable.
- A aplicação deve falhar rápido em qualquer ambiente sem variáveis de Supabase configuradas.
- Usuários não admins não devem conseguir acessar o painel administrativo.
- Reviews só podem ser criadas para pedidos que pertencem ao usuário autenticado.
