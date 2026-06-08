# Inventário — Pizza Lopez

> Gerado pelo Scout em 2026-06-08

## 1. Estrutura de pastas

```
Pizza_Lopez/
├── bunfig.toml
├── components.json
├── eslint.config.js
├── package.json
├── tsconfig.json
├── vercel.json
├── vite.config.ts
├── src/
│   ├── router.tsx
│   ├── routeTree.gen.ts
│   ├── server.ts
│   ├── start.ts
│   ├── styles.css
│   ├── components/
│   │   ├── pizza/           ← componentes de domínio (8 arquivos)
│   │   └── ui/              ← shadcn/ui (30+ componentes)
│   ├── context/
│   │   ├── auth.tsx
│   │   ├── cart.tsx
│   │   └── theme.tsx
│   ├── data/
│   │   └── menu.ts          ← dados estáticos de menu
│   ├── hooks/
│   │   └── use-mobile.tsx
│   ├── integrations/
│   │   └── supabase/
│   │       ├── auth-attacher.ts
│   │       ├── auth-middleware.ts
│   │       ├── client.server.ts
│   │       ├── client.ts
│   │       └── types.ts
│   ├── lib/
│   │   ├── config.server.ts
│   │   ├── error-capture.ts
│   │   ├── error-page.ts
│   │   ├── lovable-error-reporting.ts   ← acoplamento Lovable
│   │   ├── notification.ts
│   │   ├── supabase.ts
│   │   ├── utils.ts
│   │   ├── api/
│   │   │   ├── admin.functions.ts
│   │   │   ├── coupons.functions.ts
│   │   │   ├── example.functions.ts
│   │   │   ├── orders.functions.ts
│   │   │   └── reviews.functions.ts
│   │   └── db/
│   │       ├── schema.sql
│   │       └── types.ts
│   └── routes/
│       ├── __root.tsx
│       ├── admin.tsx
│       ├── checkout.tsx
│       ├── index.tsx
│       ├── pedido.$id.tsx
│       ├── perfil.tsx
│       ├── reset-password.tsx
│       └── sobre.tsx
└── supabase/
    ├── config.toml
    └── migrations/
        └── 20260604050244_*.sql
```

## 2. Tecnologias e Linguagens

| Linguagem | Extensões | Arquivos |
|-----------|-----------|----------|
| TypeScript | `.ts`, `.tsx` | 94 |
| SQL | `.sql` | 2 |
| CSS | `.css` | 1 |

**Total de arquivos de código:** ~97

## 3. Frameworks e Bibliotecas

| Lib / Framework | Versão | Papel |
|-----------------|--------|-------|
| React | ^19.2.0 | UI |
| TanStack Start | ^1.167.50 | SSR / full-stack framework |
| TanStack Router | ^1.168.25 | Roteamento file-based |
| TanStack Query | ^5.83.0 | Cache de dados |
| Vite | ^7.3.1 | Bundler |
| Tailwind CSS | ^4.2.1 | Estilização |
| shadcn/ui + Radix UI | múltiplos | Componentes acessíveis |
| @supabase/supabase-js | ^2.107.0 | BaaS — auth, DB, realtime |
| Zod | ^3.24.2 | Validação de schema |
| React Hook Form | ^7.71.2 | Formulários |
| Recharts | ^2.15.4 | Gráficos (admin) |
| Sonner | ^2.0.7 | Notificações toast |
| **@lovable.dev/vite-tanstack-config** | ^2.1.1 | **⚠️ Acoplamento Lovable** |
| nitro (cloudflare preset) | 3.0.x-beta | SSR runtime |

**Gerenciador de pacotes:** Bun (`bunfig.toml` presente)

## 4. Pontos de Entrada

| Arquivo | Tipo |
|---------|------|
| `src/start.ts` | App entry — TanStack Start bootstrap |
| `src/server.ts` | Server entry — SSR error wrapper |
| `src/router.tsx` | Router entry — defineRouter() |
| `src/routes/__root.tsx` | Root route — providers globais |

## 5. Configurações

| Arquivo | Finalidade |
|---------|-----------|
| `vite.config.ts` | Build — usa `@lovable.dev/vite-tanstack-config`, preset Vercel |
| `tsconfig.json` | TypeScript |
| `components.json` | shadcn/ui CLI |
| `vercel.json` | Deploy Vercel |
| `bunfig.toml` | Bun config |
| `supabase/config.toml` | Supabase local |

## 6. CI/CD e Deploy

- **Deploy alvo:** Vercel (`vite.config.ts` → `nitro: { preset: "vercel" }`)
- **CI/CD detectado:** nenhum arquivo `.github/workflows/` ou similar
- **Docker:** ausente

## 7. Banco de dados

| Arquivo | Tipo |
|---------|------|
| `src/lib/db/schema.sql` | DDL completo — tabelas, triggers, RLS, políticas |
| `src/lib/db/types.ts` | Types TypeScript derivados do schema |
| `supabase/migrations/20260604050244_*.sql` | Migration de produção |
| `supabase/config.toml` | Configuração do CLI Supabase |

**Tabelas identificadas (superficialmente):** `profiles`, `categories` + (mais no schema completo)

## 8. Testes

- Frameworks de teste: **nenhum detectado** (nenhum arquivo `*.test.*` / `*.spec.*`)
- Jest, Vitest ou Playwright: ausentes no `package.json`

## 9. Acoplamentos com Lovable (goal: desacoplar)

| Arquivo | Acoplamento |
|---------|-------------|
| `vite.config.ts` | Importa `@lovable.dev/vite-tanstack-config` — encapsula plugins críticos (tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro, componentTagger) |
| `src/lib/lovable-error-reporting.ts` | Usa `window.__lovableEvents?.captureException` — SDK de erros da Lovable |
| `src/lib/error-page.ts` | Provavelmente referencia error reporting da Lovable (a confirmar no Archaeologist) |
| `package.json` devDependencies | `@lovable.dev/vite-tanstack-config: ^2.1.1` |

## 10. Módulos identificados

1. **auth** — autenticação via Supabase Auth (integrations/supabase + context/auth)
2. **cart** — carrinho de compras client-side (context/cart)
3. **menu** — cardápio de produtos (data/menu + components/pizza)
4. **orders** — pedidos (lib/api/orders.functions + routes/pedido.$id)
5. **admin** — painel administrativo (routes/admin + lib/api/admin.functions)
6. **checkout** — fluxo de pagamento/cupons (routes/checkout + lib/api/coupons.functions)
7. **reviews** — avaliações (lib/api/reviews.functions)
8. **database** — schema SQL e tipos (lib/db/)
