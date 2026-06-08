# Tasks — Cardápio

## Para migração (desacoplar Lovable)

- [ ] **T-CARD-01** Remover mensagem "Configure ... no Lovable" de `Menu.tsx` — substituir por mensagem genérica

## Para melhorias identificadas

- [ ] **T-CARD-02** Consolidar os 3 round-trips (categories + products + reviews) em uma server function única para reduzir latência
- [ ] **T-CARD-03** Adicionar cache TanStack Query para evitar re-fetch a cada montagem do componente
