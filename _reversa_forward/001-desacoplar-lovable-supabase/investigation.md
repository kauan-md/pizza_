# Investigation — 001-desacoplar-lovable-supabase

## Objetivo da investigação

Definir estratégia técnica para retirar acoplamentos Lovable preservando runtime em Supabase + Vercel e incorporando correções críticas de segurança aprovadas no clarify.

## Evidências usadas

- `_reversa_sdd/architecture.md#8. Arquitetura alvo após migração (objetivo declarado)`
- `_reversa_sdd/inventory.md#9. Acoplamentos com Lovable (goal: desacoplar)`
- `_reversa_sdd/code-analysis.md#Módulo: auth`
- `_reversa_sdd/domain.md#RN-10: Admin sem controle de acesso real`
- `_reversa_sdd/domain.md#RN-11: Avaliação vinculada ao pedido mas sem verificação de propriedade`
- `_reversa_sdd/dependencies.md#Acoplamentos críticos a remover (goal: desacoplar do Lovable)`

## Alternativas avaliadas

### A1) Migração mínima (só remover pacote Lovable)
- Prós: entrega rápida
- Contras: deixa risco crítico de RBAC/ownership aberto; não atende escopo aprovado
- Veredito: descartada

### A2) Migração completa em uma feature (build + observabilidade + segurança crítica)
- Prós: resolve lock-in e riscos críticos no mesmo ciclo; reduz dívida técnica acumulada
- Contras: aumento de escopo e esforço de validação
- Veredito: escolhida

### A3) Trocar stack de framework (ex.: Next.js) junto com desacoplamento
- Prós: potencial padronização de ecossistema
- Contras: fora de escopo, alto risco de regressão
- Veredito: descartada

## Padrões aplicáveis

- Configuração explícita e auditável de build toolchain
- Fail fast para variáveis de ambiente obrigatórias
- RBAC server-side com verificação positiva e negativa
- Ownership check em operações sensíveis
- CI como gate de cutover

## Pontos de atenção para implementação

1. Garantir equivalência funcional dos plugins atualmente encapsulados pelo wrapper Lovable.
2. Definir logger interno com formato estruturado consistente (nível, contexto, erro, request-id).
3. Evitar migração parcial de segurança (RBAC sem ownership ou vice-versa).
4. Garantir que a validação de rotas em CI seja determinística e reproduzível.
