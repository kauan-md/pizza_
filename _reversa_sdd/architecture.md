# Architecture — Pizza Lopez

> Gerado pelo Architect em 2026-06-08
> doc_level: essencial

## Escala de confiança
- 🟢 CONFIRMADO | 🟡 INFERIDO | 🔴 LACUNA

---

## 1. Visão Geral

**Pizza Lopez** é um e-commerce de delivery de pizza operando em Osasco/SP. É uma SPA com SSR construída em TanStack Start, hospedada na Vercel, com Supabase como BaaS exclusivo (autenticação, banco de dados PostgreSQL, Storage de imagens e Realtime).

| Atributo | Valor |
|----------|-------|
| Tipo | Web App (SPA + SSR) |
| Framework | TanStack Start 1.167 + TanStack Router (file-based) |
| Runtime | Nitro (preset Vercel) |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Deploy | Vercel |
| Linguagem | TypeScript |
| Gerenciador de pacotes | Bun |

---

## 2. C4 — Diagrama de Contexto (Nível 1)

```mermaid
C4Context
    title Sistema Pizza Lopez — Contexto

    Person(cliente, "Cliente", "Visitante ou usuário autenticado que navega o cardápio e faz pedidos")
    Person(admin, "Administrador", "Operador que gerencia pedidos, produtos, cupons e avaliações via /admin")

    System(pizzaApp, "Pizza Lopez", "Web app de delivery de pizza. Permite pedidos, checkout com cupom, acompanhamento e admin em tempo real.")

    System_Ext(supabase, "Supabase", "BaaS: PostgreSQL, Auth (email/password), Storage (imagens de produto), Realtime (notificações de novos pedidos)")
    System_Ext(vercel, "Vercel", "Plataforma de deploy e edge runtime (Nitro/serverless functions)")
    System_Ext(lovable, "Lovable.dev", "Plataforma de origem — acoplamento via @lovable.dev/vite-tanstack-config e error reporting SDK [a remover na migração]")

    Rel(cliente, pizzaApp, "Navega cardápio, faz pedidos, aplica cupons", "HTTPS / Browser")
    Rel(admin, pizzaApp, "Gerencia pedidos e cardápio em tempo real", "HTTPS / Browser")
    Rel(pizzaApp, supabase, "Auth, queries SQL, upload de imagens, subscribe Realtime", "HTTPS / WebSocket")
    Rel(pizzaApp, vercel, "Deploy, edge functions (Nitro), CDN", "CI/CD + HTTPS")
    Rel(pizzaApp, lovable, "Error reporting SDK [legado]", "window.__lovableEvents [a remover]")
```

---

## 3. Containers (resumo textual — essencial)

| Container | Tecnologia | Responsabilidade |
|-----------|-----------|-----------------|
| **Browser App** | React 19 + TanStack Router | UI, carrinho client-side, roteamento |
| **SSR Server** | Nitro + TanStack Start | Server functions (RPC), renderização SSR, middleware de auth |
| **Supabase DB** | PostgreSQL + RLS | Persistência de todos os dados |
| **Supabase Auth** | GoTrue | Autenticação JWT |
| **Supabase Storage** | S3-compatible | Imagens de produtos (bucket: `products`) |
| **Supabase Realtime** | WebSocket | Notificações de novos pedidos para admin |

---

## 4. ERD — Entidades e Relacionamentos

```mermaid
erDiagram
    profiles {
        uuid id PK
        text name
        text email
        text avatar_url
        text phone
        timestamptz created_at
        timestamptz updated_at
    }
    categories {
        text id PK
        text label
        int display_order
    }
    products {
        text id PK
        text name
        text description
        numeric price
        numeric old_price
        text category_id FK
        text tag
        text image
        bool available
        timestamptz created_at
    }
    orders {
        uuid id PK
        uuid user_id FK
        text status
        numeric total
        text payment_method
        text payment_status
        text delivery_address
        text notes
        uuid coupon_id FK
        numeric discount_applied
        timestamptz created_at
        timestamptz updated_at
    }
    order_items {
        uuid id PK
        uuid order_id FK
        text product_id
        text product_name
        numeric unit_price
        int quantity
        timestamptz created_at
    }
    coupons {
        uuid id PK
        text code
        text discount_type
        numeric discount_value
        numeric min_order_value
        int max_uses
        int used_count
        bool active
        timestamptz expires_at
        timestamptz created_at
    }
    reviews {
        uuid id PK
        text product_id FK
        uuid user_id FK
        uuid order_id FK
        text author_name
        int rating
        text comment
        timestamptz created_at
    }

    profiles ||--o{ orders : "faz"
    profiles ||--o{ reviews : "escreve"
    categories ||--o{ products : "agrupa"
    products ||--o{ reviews : "recebe"
    orders ||--o{ order_items : "contém"
    orders }o--o| coupons : "usa"
    orders }o--o| profiles : "pertence a"
    reviews }o--o| orders : "gerada a partir de"
```

---

## 5. Integrações Externas

| Integração | Protocolo | Uso | Confiança |
|-----------|-----------|-----|-----------|
| Supabase Auth | HTTPS REST + JWT | Login, registro, refresh token, reset de senha | 🟢 |
| Supabase PostgreSQL | HTTPS REST (PostgREST) | CRUD de todas as entidades | 🟢 |
| Supabase Storage | HTTPS REST | Upload e leitura de imagens de produtos | 🟢 |
| Supabase Realtime | WebSocket | Canal `admin-orders` — INSERT em `orders` | 🟢 |
| Vercel | Deploy + Edge | Hosting, serverless functions via Nitro | 🟢 |
| Lovable SDK | `window.__lovableEvents` | Error reporting (a remover) | 🟢 |
| **Gateway de pagamento** | — | **🔴 NÃO IMPLEMENTADO** — `payment_status` existe mas nunca é atualizado | 🔴 |

---

## 6. Dívidas Técnicas

| # | Dívida | Severidade | Módulo |
|---|--------|-----------|--------|
| 1 | Rota `/admin` sem RBAC — qualquer usuário autenticado tem acesso total | 🔴 Crítica | admin |
| 2 | `payment_status` nunca é atualizado — integração de pagamento ausente | 🔴 Crítica | orders |
| 3 | `createOrder` sem transação real — pedido pode ficar sem itens | 🔴 Crítica | orders |
| 4 | Reviews sem verificação de ownership | 🔴 Alta | reviews |
| 5 | RLS ausente para tabelas `coupons` e `reviews` | 🔴 Alta | database |
| 6 | Dois contratos `Product` incompatíveis (camelCase vs snake_case) | 🟡 Média | menu/cart |
| 7 | `DELIVERY_FEE = 6.99` hardcoded no componente | 🟡 Média | checkout |
| 8 | Acoplamento `@lovable.dev/vite-tanstack-config` — encapsula toda config Vite | 🟡 Média | build |
| 9 | Anon key do Supabase hardcoded no código-fonte | 🟡 Média | auth |
| 10 | Ausência total de testes (unitários, integração, E2E) | 🟡 Média | global |
| 11 | Notificação de mudança de status do pedido ao cliente não implementada | 🟡 Média | orders |
| 12 | Feature "meio a meio" mencionada no commit mas sem evidência no código atual | 🔴 Lacuna | menu |

---

## 7. Fluxo de Dados Principal

```
Cliente (Browser)
  │
  ├── GET /               → Renderiza menu (SSR)
  ├── addToCart()         → localStorage (client-side only)
  ├── POST validateCoupon → Server Fn → Supabase (coupons)
  ├── POST createOrder    → Server Fn → Supabase (orders + order_items + coupon RPC)
  └── GET /pedido/:id     → Server Fn → Supabase (orders + order_items)

Admin (Browser)
  ├── GET /admin          → React (sem SSR de dados — carrega client-side)
  ├── Supabase Realtime   ← WebSocket ← INSERT em orders (tempo real)
  ├── GET listAllOrders   → Server Fn (service role) → Supabase
  ├── POST updateStatus   → Server Fn (service role) → Supabase
  └── POST uploadImage    → Server Fn (service role) → Supabase Storage
```

---

## 8. Arquitetura alvo após migração (objetivo declarado)

**Remover:** dependência `@lovable.dev/vite-tanstack-config`  
**Manter:** Supabase + Vercel (já é o target)  
**Adicionar:** `vite.config.ts` manual com plugins explícitos

**Impacto da migração:**

| Componente | Mudança | Complexidade |
|-----------|---------|-------------|
| `vite.config.ts` | Substituir `@lovable.dev/vite-tanstack-config` por plugins explícitos | Média |
| `lovable-error-reporting.ts` | Remover ou substituir por Sentry/logger próprio | Baixa |
| Mensagens de erro nos clients Supabase | Trocar referências a "Lovable Cloud" | Baixa |
| `.env` | Mover anon key para variável de ambiente (Vercel Dashboard) | Baixa |
| `/admin` | Implementar RBAC (campo `role` em profiles + middleware) | Alta |
| `orders` | Implementar transação real (Supabase RPC ou pg function) | Alta |
