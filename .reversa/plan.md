# Plano de Exploração — pizza-lopez

> Criado pelo Reversa em 2026-06-08
> Marque cada tarefa com ✅ quando concluída.
> Você pode editar este plano antes de iniciar: adicione, remova ou reordene tarefas conforme necessário.

---

## Fase 1: Reconhecimento 🔍

- [✅] **Scout** — Mapeamento de estrutura de pastas e tecnologias
- [✅] **Scout** — Análise de dependências e gerenciadores de pacotes
- [✅] **Scout** — Identificação de entry points, CI/CD e configurações

## Decisão de organização das specs 🗂️

> Entre o Scout e o Arqueólogo, o Reversa pergunta como você quer organizar as specs (por módulo, caso de uso, endpoint, híbrida, por features ou customizada). A escolha fica persistida em `.reversa/config.toml` na seção `[specs]` e não será reperguntada em execuções futuras.

## Fase 2: Escavação 🏗️

> O Reversa preenche esta seção com os módulos reais após o Scout concluir o reconhecimento.

- [✅] **Arqueólogo** — Análise do módulo `auth` (integrations/supabase)
- [✅] **Arqueólogo** — Análise do módulo `cart` (context/cart)
- [✅] **Arqueólogo** — Análise do módulo `menu` (data/menu + components/pizza)
- [✅] **Arqueólogo** — Análise do módulo `orders` (lib/api/orders.functions)
- [✅] **Arqueólogo** — Análise do módulo `admin` (routes/admin + lib/api/admin.functions)
- [✅] **Arqueólogo** — Análise do módulo `checkout` (routes/checkout + lib/api/coupons.functions)
- [✅] **Arqueólogo** — Análise do módulo `reviews` (lib/api/reviews.functions)
- [✅] **Arqueólogo** — Análise do módulo `database` (lib/db/schema.sql + lib/db/types)

## Fase 3: Interpretação 🧠

- [✅] **Detetive** — Regras de negócio implícitas e máquinas de estado
- [✅] **Detetive** — Matriz de permissões (RBAC/ACL)
- [✅] **Arquiteto** — Diagramas C4 (Contexto, Containers, Componentes)
- [✅] **Arquiteto** — ERD completo e integrações externas
- [✅] **Arquiteto** — Spec Impact Matrix

## Fase 4: Geração 📝

- [✅] **Redator** — Specs SDD por componente
- [✅] **Redator** — User Stories
- [✅] **Redator** — Code/Spec Matrix

## Fase 5: Revisão ✅

- [✅] **Revisor** — Revisão cruzada de specs
- [✅] **Revisor** — Resolução de lacunas com o usuário
- [✅] **Revisor** — Relatório de confiança final

---

## Agentes Independentes

- [ ] **Data Master** — Análise completa do banco de dados (`lib/db/schema.sql`, migrations)
- [ ] **Design System** — Extração de tokens de design (Tailwind/shadcn/ui)

---

## Próximo passo

Após o Time de Descoberta concluir e o `_reversa_sdd/` estar populado, você pode disparar:

- `/reversa-migrate`: Time de Migração
- `/reversa-forward`: pipeline de evolução de features
- `/reversa-reconstructor`: reimplementação bottom-up a partir das specs
