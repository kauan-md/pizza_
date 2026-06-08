# Tasks — Admin

## Para migração (desacoplar Lovable)

- Sem acoplamento direto com Lovable nesta unit.

## Para melhorias críticas identificadas

- [ ] **T-ADM-01** **[CRÍTICO — SEGURANÇA]** Adicionar campo `role text default 'user' check (role in ('user','admin'))` em `profiles`
- [ ] **T-ADM-02** **[CRÍTICO — SEGURANÇA]** Criar middleware de autorização admin: verificar `claims.role = 'admin'` em `requireSupabaseAuth` ou criar `requireAdminAuth`
- [ ] **T-ADM-03** **[CRÍTICO — SEGURANÇA]** Proteger todas as server functions de `admin.functions.ts` com `requireAdminAuth`
- [ ] **T-ADM-04** Adicionar guard client-side em `AdminPage` verificando `role` além de autenticação
- [ ] **T-ADM-05** Adicionar migration SQL para o campo `role` e criar primeiro usuário admin
