# Dependências — Pizza Lopez

> Gerado pelo Scout em 2026-06-08

## Produção

| Dependência | Versão | Categoria |
|-------------|--------|-----------|
| react | ^19.2.0 | UI |
| react-dom | ^19.2.0 | UI |
| @tanstack/react-start | ^1.167.50 | Framework SSR |
| @tanstack/react-router | ^1.168.25 | Roteamento |
| @tanstack/react-query | ^5.83.0 | Data fetching |
| @supabase/supabase-js | ^2.107.0 | BaaS |
| tailwindcss | ^4.2.1 | CSS |
| @tailwindcss/vite | ^4.2.1 | CSS build |
| zod | ^3.24.2 | Validação |
| react-hook-form | ^7.71.2 | Formulários |
| @hookform/resolvers | ^5.2.2 | Integração zod/RHF |
| recharts | ^2.15.4 | Gráficos |
| sonner | ^2.0.7 | Toasts |
| lucide-react | ^0.575.0 | Ícones |
| date-fns | ^4.1.0 | Datas |
| clsx | ^2.1.1 | CSS util |
| tailwind-merge | ^3.5.0 | CSS util |
| class-variance-authority | ^0.7.1 | Variantes CSS |
| vite-tsconfig-paths | ^6.0.2 | Path aliases |
| cmdk | ^1.1.1 | Command menu |
| vaul | ^1.1.2 | Drawer |
| embla-carousel-react | ^8.6.0 | Carousel |
| input-otp | ^1.4.2 | OTP input |
| react-day-picker | ^9.14.0 | Date picker |
| react-resizable-panels | ^4.6.5 | Painéis |
| @radix-ui/* (múltiplos) | ^1.x / ^2.x | Componentes acessíveis |

## Desenvolvimento

| Dependência | Versão | Categoria |
|-------------|--------|-----------|
| **@lovable.dev/vite-tanstack-config** | **^2.1.1** | **⚠️ Lovable — a remover** |
| vite | ^7.3.1 | Bundler |
| nitro | 3.0.260429-beta | SSR runtime |
| typescript | ^5.8.3 | Tipagem |
| @types/react | ^19.2.0 | Types |
| @types/react-dom | ^19.2.0 | Types |
| @types/node | ^22.16.5 | Types |
| eslint | ^9.32.0 | Linting |
| eslint-config-prettier | ^10.1.1 | Linting |
| eslint-plugin-prettier | ^5.2.6 | Linting |
| eslint-plugin-react-hooks | ^5.2.0 | Linting |
| eslint-plugin-react-refresh | ^0.4.20 | Linting |
| typescript-eslint | ^8.56.1 | Linting |
| prettier | ^3.7.3 | Formatação |
| globals | ^15.15.0 | ESLint config |
| @vitejs/plugin-react | ^5.0.4 | Vite plugin |
| @tanstack/router-plugin | ^1.167.28 | Vite plugin |

## Gerenciador de pacotes

- **Bun** (`bunfig.toml` presente)

## Acoplamentos críticos a remover (goal: desacoplar do Lovable)

| Item | Ação necessária |
|------|----------------|
| `@lovable.dev/vite-tanstack-config` | Substituir por `vite.config.ts` manual com plugins explícitos: `@tanstack/router-plugin`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-tsconfig-paths`, `nitro` |
| `window.__lovableEvents` em `lovable-error-reporting.ts` | Substituir por solução própria (Sentry, LogRocket, ou logger simples) ou remover |
| Preset nitro `vercel` | Já configurado — **manter** (é o target desejado) |
