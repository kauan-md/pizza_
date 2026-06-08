# Tasks — Autenticação

> Para uso no ciclo forward (`/reversa-forward`).

## Para migração (desacoplar Lovable)

- [ ] **T-AUTH-01** Remover mensagens "Connect Supabase in Lovable Cloud" de `client.ts`, `client.server.ts` e `auth-middleware.ts`
- [ ] **T-AUTH-02** Mover anon key de fallback hardcoded para `.env` / variáveis de ambiente Vercel
- [ ] **T-AUTH-03** Validar que `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `VITE_SUPABASE_PUBLISHABLE_KEY` estão configuradas no Vercel Dashboard

## Para melhorias identificadas

- [ ] **T-AUTH-04** Implementar RBAC: adicionar campo `role` em `profiles` (`user` | `admin`) e proteger rota `/admin` no middleware
- [ ] **T-AUTH-05** Adicionar proteção de rota client-side em `AdminPage` verificando `role` além de `user`
