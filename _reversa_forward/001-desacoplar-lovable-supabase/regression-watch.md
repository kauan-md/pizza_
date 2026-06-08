# Regression Watch

> Feature: `001-desacoplar-lovable-supabase`
> Data: `2026-06-08`

## Watch items
- [ ] `/admin` deve redirecionar usuários não admins e não deve renderizar o painel administrativo sem autorização.
- [ ] `createReview` deve validar ownership: apenas o usuário dono do pedido pode criar a review correspondente.
- [ ] `src/lib/supabase.ts` deve falhar imediatamente com erro se `SUPABASE_URL` ou `SUPABASE_KEY` estiverem ausentes.
- [ ] `vite.config.ts` não deve depender de `@lovable.dev/vite-tanstack-config` ou de APIs Lovable de build.
- [ ] `package.json` não deve listar `@lovable.dev/vite-tanstack-config` como dependência direta.

## Histórico de re-extrações

### 2026-06-08
- Criado watch list inicial após implementação do desacoplamento Lovable → Supabase.
