# Design — Autenticação

## Arquitetura

Dupla camada de autenticação:

1. **Client-side** (`AuthContext`): estado React global, persiste em `localStorage`, escuta `onAuthStateChange`
2. **Server-side** (`requireSupabaseAuth`): middleware TanStack Start que valida JWT e expõe contexto autenticado para server functions

```
Browser                         Server (Nitro)              Supabase
  │                                  │                          │
  ├─ AuthProvider.mount()             │                          │
  │   └─ getSession() ──────────────────────────────────────────► GoTrue
  │       ◄─────────────────────────────────────────────────── session
  │                                  │                          │
  ├─ login(email, pwd) ──────────────────────────────────────── signInWithPassword
  │   ◄──────────────────────────────────────────────────────── JWT + user
  │                                  │                          │
  ├─ serverFn() (qualquer)           │                          │
  │   attachSupabaseAuth (client)     │                          │
  │   └─ getSession().access_token    │                          │
  │   ──── headers: Bearer <token> ──►│                          │
  │                                  ├─ requireSupabaseAuth      │
  │                                  │   └─ getClaims(token) ────►
  │                                  │   ◄──────────────────── claims
  │                                  └─ handler({ context })     │
```

## Estruturas de dados

```typescript
interface UserSession {
  id: string;       // UUID do auth.users
  name: string;     // display name (com fallback)
  email: string;
  avatarUrl?: string;
}

// Contexto SSR exposto por requireSupabaseAuth:
interface AuthContext {
  supabase: SupabaseClient;  // client com JWT do usuário
  userId: string;            // claims.sub
  claims: JWTPayload;
}
```

## Decisões de design

| Decisão | Rationale | Confiança |
|---------|-----------|-----------|
| Proxy lazy para cliente Supabase | Evita erro de inicialização no SSR quando envs ausentes | 🟢 |
| `getSupabase()` retorna `null` em vez de throw | Permite fallback localStorage sem quebrar a UI | 🟢 |
| `getClaims()` no middleware server | Valida JWT sem round-trip adicional ao banco | 🟢 |
| Client Supabase admin com `persistSession: false` | Service role nunca deve persistir sessão — segurança | 🟢 |

## Acoplamentos Lovable a remover

| Arquivo | Acoplamento | Substituição |
|---------|-------------|-------------|
| `client.ts:19` | Mensagem "Connect Supabase in Lovable Cloud" | Mensagem genérica de configuração |
| `client.server.ts:18` | Idem | Idem |
| `auth-middleware.ts:16` | Idem | Idem |
