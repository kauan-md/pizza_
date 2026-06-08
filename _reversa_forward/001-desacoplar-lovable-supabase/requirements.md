# Requirements: Desacoplamento do Lovable e Consolidação em Supabase + Vercel

> Identificador: `001-desacoplar-lovable-supabase`
> Data: `2026-06-08`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Esta feature remove os acoplamentos residuais com Lovable no projeto Pizza Lopez e consolida a operação em Supabase + Vercel como stack única de runtime, build e observabilidade. O objetivo é eliminar dependências de build e telemetria externas ao target arquitetural já definido, reduzir risco de lock-in e aumentar previsibilidade de deploy. A entrega deve preservar os fluxos já existentes de autenticação, checkout, admin e perfil, sem regressão funcional.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#8. Arquitetura alvo após migração (objetivo declarado)` | Define explicitamente remover `@lovable.dev/vite-tanstack-config`, manter Supabase + Vercel e substituir por `vite.config.ts` manual. | 🟢 |
| `_reversa_sdd/inventory.md#9. Acoplamentos com Lovable (goal: desacoplar)` | Lista os pontos de acoplamento: `vite.config.ts`, `src/lib/lovable-error-reporting.ts` e dependência em `package.json`. | 🟢 |
| `_reversa_sdd/code-analysis.md#Módulo: auth` | Identifica mensagens "Connect Supabase in Lovable Cloud" em clientes Supabase e fallback de chave anon hardcoded. | 🟢 |
| `_reversa_sdd/domain.md#2. Regras de Negócio` | Confirma riscos críticos existentes (admin sem RBAC e lacunas de segurança) que devem ser preservados como escopo explícito para evitar migração superficial. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Dono do produto | Publicar sem dependência de Lovable | Executa deploy na Vercel com envs de Supabase configuradas e pipeline estável |
| Desenvolvedor full-stack | Evoluir código com toolchain previsível | Altera build/config sem depender de pacote externo encapsulado |
| Operador administrativo | Manter painel funcionando durante migração | Acessa `/admin`, atualiza pedidos/produtos sem regressão |
| Cliente final | Não perceber ruptura de experiência | Continua autenticando, comprando e acompanhando pedido normalmente |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** O sistema deve operar sem dependências de execução ou build específicas da plataforma Lovable. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#8. Arquitetura alvo após migração (objetivo declarado)`
   - Tipo: alterada
2. **RN-02:** O deploy oficial deve permanecer na Vercel, com Supabase como backend único de auth, dados, storage e realtime. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#1. Visão Geral`
   - Tipo: alterada
3. **RN-03:** Mensagens de erro, variáveis e documentação operacional não podem referenciar "Lovable Cloud". 🟢
   - Origem no legado: `_reversa_sdd/code-analysis.md#Módulo: auth`
   - Tipo: nova
4. **RN-04:** Não pode haver regressão nos fluxos críticos existentes (login, checkout, admin, pedido, perfil) após o desacoplamento. 🟡
   - Origem no legado: `_reversa_sdd/inventory.md#10. Módulos identificados`
   - Tipo: nova
5. **RN-05:** Esta feature inclui as correções críticas de segurança ligadas ao desacoplamento (RBAC de admin e ownership de reviews), sem postergar esses itens para outra feature. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#2. Regras de Negócio`
  - Tipo: alterada

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Substituir `@lovable.dev/vite-tanstack-config` por configuração Vite explícita equivalente para build SSR com TanStack Start + Nitro (preset Vercel). | Must | Build local e build de produção finalizam sem importar pacote `@lovable.dev/*`. | 🟢 |
| RF-02 | Remover `src/lib/lovable-error-reporting.ts` do fluxo ativo ou substituir por provedor neutro configurável. | Must | Nenhum caminho crítico de erro depende de `window.__lovableEvents`. | 🟢 |
| RF-03 | Atualizar clientes Supabase para mensagens neutras de configuração (sem menção a Lovable). | Must | Busca por string `Lovable` no runtime path retorna zero ocorrências relevantes. | 🟢 |
| RF-04 | Externalizar credenciais Supabase (URL/chave publishable) para ambiente de execução, proibindo fallback hardcoded em qualquer ambiente. | Must | Nenhum fallback hardcoded permanece no código; execução depende de envs válidas e falha com erro claro quando ausentes. | 🟢 |
| RF-05 | Preservar rotas e contratos existentes sem alteração breaking, com validação de regressão em cobertura completa de todas as rotas. | Must | Checklist automatizado em CI valida todas as rotas da aplicação sem regressão funcional. | 🟢 |
| RF-06 | Documentar checklist de deploy Vercel + Supabase pós-migração. | Should | Checklist mínimo cobre envs obrigatórias, build, e verificação de health inicial. | 🟡 |
| RF-07 | Implementar nesta mesma feature as correções críticas de segurança: RBAC de admin e verificação de ownership em reviews. | Must | RBAC e ownership check entram no plano técnico e nas ações da própria feature. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Confiabilidade de build | Pipeline de build deve ser reprodutível local e Vercel sem wrappers proprietários. | `_reversa_sdd/inventory.md#5. Configurações` e `_reversa_sdd/architecture.md#8. Arquitetura alvo após migração (objetivo declarado)` | 🟢 |
| Segurança de configuração | Segredos e chaves não podem ficar hardcoded no repositório. | `_reversa_sdd/code-analysis.md#Módulo: auth` | 🟢 |
| Compatibilidade operacional | Migração não deve interromper operações; validação de regressão deve cobrir todas as rotas em CI. | `_reversa_sdd/architecture.md#7. Fluxo de Dados Principal` | 🟢 |
| Observabilidade | Adotar logger interno estruturado como estratégia pós-Lovable nesta etapa, sem provedor externo. | `_reversa_sdd/inventory.md#9. Acoplamentos com Lovable (goal: desacoplar)` | 🟢 |
| Governança de escopo | Escopo de segurança e critérios de cutover devem ficar explícitos no requirements e no plano técnico. | `_reversa_sdd/confidence-report.md#Lacunas críticas (🔴 — bloqueiam reimplementação segura)` | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Build sem dependência Lovable
  Dado que a feature foi aplicada
  Quando executar o build de produção
  Então o projeto deve compilar para Vercel sem importar `@lovable.dev/vite-tanstack-config`

Cenário: Execução com Supabase por variáveis de ambiente
  Dado que as variáveis obrigatórias do Supabase estão definidas
  Quando iniciar a aplicação
  Então autenticação e chamadas de dados devem funcionar sem fallback hardcoded

Cenário: Mensagens neutras de configuração
  Dado que uma variável obrigatória está ausente
  Quando o sistema gerar erro de configuração
  Então a mensagem não deve conter referência a "Lovable Cloud"

Cenário: Regressão funcional não permitida
  Dado que o baseline funcional está estável
  Quando a migração for concluída
  Então login, checkout, pedido, perfil e admin devem continuar operacionais

Cenário: Ausência de segredo em código-fonte
  Dado o código da branch da feature
  Quando buscar por chaves de Supabase hardcoded
  Então não deve haver credenciais de produção embutidas no código

Cenário: Cutover orientado por CI
  Dado que a implementação de desacoplamento foi concluída
  Quando a pipeline de CI executar o checklist automatizado de validação
  Então a migração só pode ser considerada concluída se o checklist passar integralmente
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (troca de config Vite) | Must | É o núcleo do desacoplamento de build |
| RF-02 (remoção do SDK Lovable) | Must | Elimina lock-in operacional de runtime |
| RF-03 (mensagens neutras) | Must | Evita acoplamento semântico/documental |
| RF-04 (envs sem hardcode) | Must | Segurança e governança de segredos |
| RF-05 (sem regressão funcional) | Must | Protege operação de negócio em produção |
| RF-06 (checklist de deploy) | Should | Reduz erro operacional no cutover |
| RF-07 (RBAC + ownership na mesma feature) | Must | Remove riscos críticos sem adiar correções essenciais |

## 9. Esclarecimentos

### Sessão 2026-06-08

- **Q:** Escopo de segurança nesta feature de desacoplamento?
  **R:** Incluir RBAC de admin e ownership de reviews nesta mesma feature.

- **Q:** Observabilidade pós-Lovable?
  **R:** Adotar logger interno estruturado (sem serviço externo).

- **Q:** Critério de cutover para considerar a migração concluída?
  **R:** Apenas checklist automatizado em CI.

- **Q:** Política para credenciais Supabase?
  **R:** Proibir qualquer fallback hardcoded em todos os ambientes.

- **Q:** Definição de “sem regressão” para RF-05?
  **R:** Cobertura completa de todas as rotas.

## 10. Lacunas

- Nenhuma lacuna aberta após a sessão de esclarecimentos de 2026-06-08.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-08 | Versão inicial gerada por `/reversa-requirements` | reversa |
