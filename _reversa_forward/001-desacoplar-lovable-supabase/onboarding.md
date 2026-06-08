# Onboarding — 001-desacoplar-lovable-supabase

## Pré-requisitos

- Node/Bun compatível com o projeto
- Projeto Supabase acessível
- Projeto Vercel configurado
- Variáveis de ambiente obrigatórias definidas (sem fallback hardcoded)

## Passo a passo para validar a feature

1. Instalar dependências e gerar build local.
2. Confirmar que o projeto não importa `@lovable.dev/vite-tanstack-config`.
3. Subir app com envs válidas e validar inicialização sem mensagens Lovable.
4. Validar fluxo cliente:
   - login
   - cardápio
   - checkout
   - pedido
   - perfil
5. Validar segurança admin:
   - usuário comum não acessa operações administrativas
   - usuário admin acessa painel e operações
6. Validar reviews:
   - review em pedido próprio: permitido
   - review em pedido de terceiro: bloqueado
7. Executar checklist automatizado em CI com cobertura completa de rotas.
8. Validar deploy em Vercel após gate verde.

## Resultado esperado

- Build e deploy funcionam sem dependência Lovable.
- Fluxos funcionais preservados.
- Correções críticas de segurança ativas.
- CI aprovado como critério de cutover.
