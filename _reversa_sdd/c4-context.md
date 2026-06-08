# C4 — Contexto (Nível 1) — Pizza Lopez

> Gerado pelo Architect em 2026-06-08

```mermaid
C4Context
    title Sistema Pizza Lopez — Contexto

    Person(cliente, "Cliente", "Visitante ou usuário autenticado. Navega cardápio, adiciona ao carrinho e finaliza pedidos.")
    Person(admin, "Administrador", "Opera o painel /admin para gerenciar pedidos, produtos, cupons e avaliações em tempo real.")

    System(pizzaApp, "Pizza Lopez Web App", "SPA + SSR em TanStack Start. Delivery de pizza com checkout, cupons, admin e notificações em tempo real.")

    System_Ext(supabase, "Supabase", "BaaS completo: PostgreSQL (dados), GoTrue Auth (autenticação JWT), Storage (imagens), Realtime (WebSocket).")
    System_Ext(vercel, "Vercel", "Plataforma de deploy. Hospeda o SSR via Nitro serverless functions e serve estáticos via CDN.")
    System_Ext(lovable, "Lovable.dev [legado]", "Plataforma de origem do projeto. Acoplamento via SDK de error reporting e config Vite customizada. A ser removido.")

    Rel(cliente, pizzaApp, "Faz pedidos, aplica cupons, acompanha entrega", "HTTPS")
    Rel(admin, pizzaApp, "Gerencia pedidos e cardápio", "HTTPS")
    Rel(pizzaApp, supabase, "Auth, queries, storage, realtime", "HTTPS + WSS")
    Rel(pizzaApp, vercel, "Deploy e edge runtime", "CI/CD + HTTPS")
    Rel(pizzaApp, lovable, "Error reporting [a remover]", "window.__lovableEvents")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## Sistemas externos — detalhamento

| Sistema | Tipo | Protocolo | Criticidade |
|---------|------|-----------|-------------|
| **Supabase** | BaaS | HTTPS REST + WSS | 🔴 Crítico — sem Supabase, nada funciona |
| **Vercel** | PaaS | HTTPS + edge | 🟡 Alto — deploy e SSR |
| **Lovable.dev** | SDK legado | `window.__lovableEvents` | 🟢 Baixo — apenas error reporting, removível |
| **Gateway de Pagamento** | — | — | 🔴 **NÃO INTEGRADO** — lacuna no sistema |
