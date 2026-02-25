# ⚠️ ATENÇÃO: Este Método NÃO Funciona Mais

## Por que não funciona?

O Vercel tem limite de **10 segundos** para Serverless Functions (plano grátis). Nosso backend precisa buscar dados de múltiplos boards do Jira, o que leva **15-30+ segundos**.

**Resultado:** Erro 500 e timeout constante.

## ✅ Solução: Use Railway + Vercel

Siga o guia completo: **`DEPLOY-PROXY-RAILWAY.md`**

### Resumo da Arquitetura:

```
┌─────────────────┐
│   Frontend      │  ← Vercel (GRÁTIS)
│   (React/Vite)  │
└────────┬────────┘
         │
         │ VITE_PROXY_URL
         │
         ▼
┌─────────────────┐
│   Backend       │  ← Railway ($5 crédito grátis/mês)
│   (Node/Express)│
└────────┬────────┘
         │
         │ JIRA_API_TOKEN
         │
         ▼
┌─────────────────┐
│   Jira API      │
└─────────────────┘
```

## 🚀 Passos Rápidos

### 1. Deploy Backend no Railway

Siga: **`DEPLOY-PROXY-RAILWAY.md`** (seção 1-7)

Você vai:
1. Criar conta no Railway
2. Importar repositório `olanderteam/sprint-cw`
3. Configurar Root Directory: `proxy-server`
4. Adicionar variáveis: `JIRA_DOMAIN`, `JIRA_EMAIL`, `JIRA_API_TOKEN`
5. Obter URL do Railway (ex: `https://seu-app.up.railway.app`)

### 2. Deploy Frontend no Vercel

1. Acesse: https://vercel.com
2. Importe: `olanderteom/sprint-cw`
3. Configure:
   - Framework: Vite
   - Root Directory: `.` (raiz)
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Adicione APENAS esta variável:**
   ```
   VITE_PROXY_URL=https://seu-app.up.railway.app
   ```
   (Substitua pela URL do Railway)

5. Deploy!

## ❌ NÃO adicione no Vercel:

- ~~JIRA_DOMAIN~~
- ~~JIRA_EMAIL~~
- ~~JIRA_API_TOKEN~~

Essas variáveis vão no Railway, não no Vercel!

## 🐛 Erros Comuns

### Erro: "Environment Variable JIRA_DOMAIN references Secret jira_domain, which does not exist"

**Causa:** Você adicionou variáveis do Jira no Vercel.

**Solução:**
1. Vá em Vercel → Settings → Environment Variables
2. **DELETE** todas as variáveis do Jira (JIRA_DOMAIN, JIRA_EMAIL, JIRA_API_TOKEN)
3. Mantenha APENAS: `VITE_PROXY_URL`
4. Redeploy

### Erro: 500 Internal Server Error

**Causa:** Backend não está rodando ou URL incorreta.

**Solução:**
1. Verifique se o Railway está rodando
2. Teste: `https://seu-app.up.railway.app/api/jira-data`
3. Deve retornar JSON com dados do Jira
4. Se não funcionar, verifique logs no Railway

### Erro: Failed to fetch

**Causa:** `VITE_PROXY_URL` incorreta ou não configurada.

**Solução:**
1. Verifique a variável no Vercel
2. Deve ser: `https://seu-app.up.railway.app` (SEM `/api/jira-data` no final)
3. Redeploy após corrigir

## 💰 Custos

- **Vercel:** GRÁTIS
- **Railway:** $5 crédito grátis/mês (suficiente para uso normal)

**Total:** $0-5/mês

## 📚 Guia Completo

Para instruções detalhadas, siga: **`DEPLOY-PROXY-RAILWAY.md`**

---

**TL;DR:** Não use este guia. Use `DEPLOY-PROXY-RAILWAY.md` para deploy correto.
