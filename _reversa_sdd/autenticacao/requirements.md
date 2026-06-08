# Autenticação

> Endpoint / contrato: `AuthContext` + Supabase Auth
> Arquivos: `src/context/auth.tsx`, `src/integrations/supabase/client.ts`, `src/integrations/supabase/auth-attacher.ts`, `src/integrations/supabase/auth-middleware.ts`

## Visão Geral
Gerencia o ciclo de vida da sessão do usuário via Supabase Auth (email/password). Expõe um React Context com estado global de autenticação e persiste sessão em `localStorage` como fallback offline. Também define o middleware SSR que injeta o JWT em server functions.

## Responsabilidades
- Login, registro, logout, recuperação e redefinição de senha
- Sincronização de estado de autenticação via `onAuthStateChange`
- Fallback para `localStorage` quando Supabase indisponível
- Injeção de token Bearer em todas as chamadas de server functions (client middleware)
- Validação do JWT e extração de claims no servidor (server middleware)

## Regras de Negócio
- `user_id` em `UserSession` é o UUID do `auth.users` do Supabase 🟢
- Se `getSupabase()` retornar `null`, o sistema carrega usuário de `localStorage("pizza_user")` 🟢
- Ao autenticar, o perfil do usuário é persistido em `localStorage("pizza_user")` como cache 🟢
- Ao fazer logout, `localStorage("pizza_user")` é removido 🟢
- Nome do usuário: fallback `full_name` → `name` → prefixo do email 🟢
- Qualquer rota autenticada injeta `Authorization: Bearer <token>` via `attachSupabaseAuth` 🟢
- Server functions validam o token via `requireSupabaseAuth` antes de executar 🟢
- Reset de senha redireciona para `${window.location.origin}/reset-password` 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Login com email e senha | Must | Sessão ativa após `signInWithPassword` sem erro |
| RF-02 | Registro com nome, email e senha | Must | Usuário criado no Supabase Auth; perfil inserido via trigger |
| RF-03 | Logout | Must | Sessão encerrada no Supabase e `localStorage` limpo |
| RF-04 | Recuperação de senha por email | Must | Email de reset enviado com redirect para `/reset-password` |
| RF-05 | Redefinição de senha | Must | `updateUser({ password })` executado com sucesso |
| RF-06 | Persistência de sessão entre recargas | Must | `getSession()` restaura usuário no mount |
| RF-07 | Fallback para localStorage | Should | Sem Supabase configurado, usuário carregado do storage local |
| RF-08 | Middleware SSR — injetar Bearer token | Must | Todas as server functions recebem `Authorization` header |
| RF-09 | Middleware SSR — validar JWT | Must | Server function recebe `{ supabase, userId, claims }` no contexto |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência | Confiança |
|------|--------------------|-----------|-----------|
| Segurança | anon key exposta no código — deve ir para `.env` | `client.ts:8` | 🟢 |
| Segurança | Middleware SSR valida JWT antes de qualquer operação server-side | `auth-middleware.ts` | 🟢 |
| Disponibilidade | Fallback localStorage evita bloqueio de UI quando Supabase indisponível | `auth.tsx:fallbackToLocalStorage` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado que o usuário preencheu email e senha válidos
Quando chamar login()
Então a sessão deve ser ativa e user != null no AuthContext

Dado que o usuário fez logout
Quando verificar localStorage
Então "pizza_user" não deve existir

Dado que o Supabase não está configurado (env vars ausentes)
Quando a aplicação inicializar
Então o usuário deve ser carregado de localStorage se disponível

Dado um request a uma server function sem header Authorization
Quando requireSupabaseAuth processar
Então deve lançar "Unauthorized: No authorization header provided"
```

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/context/auth.tsx` | `AuthProvider`, `login`, `register`, `logout`, `forgotPassword`, `updatePassword` | 🟢 |
| `src/integrations/supabase/client.ts` | `createSupabaseClient`, `supabase` (Proxy lazy) | 🟢 |
| `src/integrations/supabase/client.server.ts` | `createSupabaseAdminClient`, `supabaseAdmin` | 🟢 |
| `src/integrations/supabase/auth-attacher.ts` | `attachSupabaseAuth` (middleware client) | 🟢 |
| `src/integrations/supabase/auth-middleware.ts` | `requireSupabaseAuth` (middleware server) | 🟢 |
| `src/lib/supabase.ts` | `getSupabase()` (client lazy singleton) | 🟢 |
