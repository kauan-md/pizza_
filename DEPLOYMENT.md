# 🚀 Deployment - Pizza Lopez no Vercel

## Checklist Pré-Deployment

- [x] **Build local validado**: `bunx vite build` ✓ 109 modules transformed
- [x] **TypeScript sem erros**: `bunx tsc --noEmit` ✓ 
- [x] **Vite dev server funcionando**: `bunx vite dev` ✓ (porta 5173)
- [x] **Supabase configurado**: `.env.local` com credenciais ✓
- [x] **vercel.json pronto**: Rewrites para `/api/index.js` ✓
- [ ] **Variáveis de ambiente** configuradas no Vercel (próximo passo)
- [ ] **Deploy inicial** feito e testado
- [ ] **Verificação de API** no preview/production

---

## 📋 Variáveis de Ambiente Necessárias

Configure estas variáveis no **Vercel Dashboard** (Project Settings → Environment Variables):

### Supabase Client (públicas, expõem no navegador)
```
VITE_SUPABASE_URL=https://lygvmnlegydniwoqlvdn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5Z3ZtbmxlZ3lkbml3b3FsdmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNzM5MDAsImV4cCI6MjA5NTc0OTkwMH0.4HagzGVW1pgIlSwRyUDo2ZcoUngntk20oqA97ndtFFs
```

### Supabase Server (privada, apenas no servidor Vercel)
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5Z3ZtbmxlZ3lkbml3b3FsdmRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE3MzkwMCwiZXhwIjoyMDk1NzQ5OTAwfQ.vVb0dEoLPMWax7m6ef7ovY99-lXDSC_diugRVoOXdhg
```

---

## 🔧 Passo a Passo para Deploy

### 1️⃣ Conectar Repositório ao Vercel

```bash
# Opção A: Via CLI
bunx vercel link
# Siga os prompts para conectar o repo

# Opção B: Via Dashboard
# Acesse https://vercel.com/dashboard
# "Add New" → "Project" → Selecione seu repositório GitHub
```

### 2️⃣ Configurar Variáveis de Ambiente

No **Vercel Dashboard**:

1. Vá para seu projeto → **Settings** → **Environment Variables**
2. Clique **Add New**
3. Preencha cada variável (copie os valores acima):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ Importante**: 
- As variáveis com prefixo `VITE_` serão **expostas no bundle do cliente** (normal, são públicas)
- A variável `SUPABASE_SERVICE_ROLE_KEY` fica **privada no servidor**, nunca é enviada ao navegador

### 3️⃣ Deploy Inicial

```bash
# Via CLI
bunx vercel deploy --prod

# Ou via Git (automático)
# Push para main/branch configurada no Vercel
git push origin main
```

### 4️⃣ Verificar Build Logs

No **Vercel Dashboard**:
- Vá para **Deployments**
- Clique no deployment mais recente
- Veja os logs de build em **Logs** → **Build**
- Procure por:
  ```
  ✓ built in X.XXs
  ✓ 109 modules transformed
  ```

### 5️⃣ Testar em Preview/Production

**Preview URL** (antes de prod):
```
https://<seu-projeto>.vercel.app
```

**Testes essenciais**:
- [ ] Página inicial carrega (Hero, Menu visível)
- [ ] Console sem erros (F12 → Console)
- [ ] API Supabase responde (categories carregam)
- [ ] Login/Signup funcionam
- [ ] Carrinho persiste (localStorage)

---

## 🐛 Troubleshooting

### Build falha com "VITE_* not found"
**Solução**: Verifique se as variáveis estão no Vercel (Settings → Environment Variables). O Vercel injeta `.env` automaticamente durante build.

### API retorna 401 Unauthorized
**Solução**: 
1. Confirme que `VITE_SUPABASE_ANON_KEY` está correto (ambos clientes e servidor)
2. No **Supabase Dashboard**, verifique:
   - RLS policies na tabela `categories` (SELECT para role `anon`)
   - Se a chave anon não expirou

### Chunks maiores que 500 kB (warning)
**Solução** (opcional, não impede deploy):
- Isso é um aviso, não erro
- Se quiser otimizar, configure dynamic imports em `vite.config.ts`

---

## 📊 Arquitetura de Deploy

```
Local (.env.local)
    ↓
Push GitHub
    ↓
Vercel CI/CD
    ├─ Recupera variáveis de ambiente
    ├─ Roda: bunx vite build
    ├─ Output: dist/client + dist/server
    └─ Deploy: Serverless Functions (Node.js runtime)
    ↓
Vercel Edge Network + Supabase API
    ↓
Browser Client
```

---

## 🔒 Segurança

✅ **Correto**:
- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` → públicas (prefixo VITE_)
- `SUPABASE_SERVICE_ROLE_KEY` → privada (sem prefixo VITE_)

⚠️ **Nunca faça**:
- Committar `.env.local` no Git (já está em `.gitignore`)
- Expor `SUPABASE_SERVICE_ROLE_KEY` no navegador
- Usar service role key para criar clients no navegador

---

## 📞 Próximos Passos

1. **Deploy inicial**: Siga passos 1-3 acima
2. **Validar build**: Verifique logs em Vercel Dashboard
3. **Testar em preview**: Rode testes da seção 5
4. **Monitorar**: Ative Error Tracking no Vercel (Project Settings)
5. **Configurar domínio**: Adicione domínio customizado (Project Settings → Domains)

---

## 📝 Comandos Rápidos

```bash
# Build local antes de pushar
bunx vite build

# Preview local do build
bunx vite preview

# Validar tipos
bunx tsc --noEmit

# Deploy via CLI
bunx vercel deploy --prod

# Ver status de deployment
bunx vercel deploy --list
```

---

**Versão**: 1.0  
**Última atualização**: 2026-06-08  
**Status**: ✅ Pronto para Deploy
