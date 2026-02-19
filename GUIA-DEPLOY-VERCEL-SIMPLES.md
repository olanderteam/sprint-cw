# Deploy Simples no Vercel (Tudo em Um Lugar)

## ✅ Otimizações Feitas

O código foi otimizado para funcionar no Vercel (plano grátis):
- ✅ Cache mais agressivo (30 minutos)
- ✅ Processa apenas 3 boards para metadata (ao invés de 5)
- ✅ Timeout configurado para 60 segundos

## 🚀 Passo a Passo

### 1. Acesse o Vercel

1. Vá para: https://vercel.com
2. Faça login com GitHub
3. Clique em "Add New Project"

### 2. Importe o Repositório

1. Procure por: `olanderteam/sprint-cw`
2. Clique em "Import"

### 3. Configure o Projeto

O Vercel vai detectar automaticamente que é um projeto Vite. Confirme:

- **Framework Preset:** Vite
- **Root Directory:** `.` (deixe em branco ou ponto)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 4. Adicione as Variáveis de Ambiente

⚠️ **CRÍTICO:** Clique em "Environment Variables" e adicione:

```
JIRA_DOMAIN=your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
```

**Como obter o Jira API Token:**
1. Acesse: https://id.atlassian.com/manage-profile/security/api-tokens
2. Clique em "Create API token"
3. Dê um nome: "Sprint Compass"
4. Copie o token

**Adicione cada variável:**
- Name: `JIRA_DOMAIN`
- Value: `your-domain.atlassian.net` (sem https://)
- Environments: Marque **Production**, **Preview**, **Development**

Repita para `JIRA_EMAIL` e `JIRA_API_TOKEN`.

### 5. Deploy!

1. Clique em "Deploy"
2. Aguarde 2-3 minutos
3. Acesse a URL fornecida

## ⚠️ Possíveis Problemas

### Problema 1: Timeout (504 Gateway Timeout)

Se você tiver **muitos boards** no Jira (mais de 10), pode dar timeout.

**Solução A - Limitar Boards:**
Adicione mais uma variável de ambiente no Vercel:

```
PROJECT_KEYS=PROJ1,PROJ2,PROJ3
```

Substitua por suas chaves de projeto do Jira (ex: `SPRINT,DASH,TEAM`).

**Solução B - Usar Railway:**
Se ainda der timeout, siga o guia: `DEPLOY-PROXY-RAILWAY.md`

### Problema 2: Dados não carregam

1. Verifique as variáveis de ambiente no Vercel
2. Vá em "Settings" → "Environment Variables"
3. Confirme que estão corretas
4. Faça "Redeploy" (Deployments → três pontos → Redeploy)

### Problema 3: Filtros não mostram todos os dados

Na primeira requisição, pode demorar mais. Aguarde 30-60 segundos.
Depois, os dados ficam em cache por 30 minutos.

## 📊 Monitoramento

Após o deploy, monitore:

1. **Functions → Logs** no Vercel
2. Veja se há erros de timeout
3. Tempo de resposta da API

## 🔄 Atualizações

Quando você fizer mudanças:

```bash
git add .
git commit -m "Descrição"
git push origin main
```

O Vercel faz deploy automático!

## ✅ Checklist

- [ ] Projeto importado no Vercel
- [ ] Variáveis de ambiente configuradas (JIRA_DOMAIN, JIRA_EMAIL, JIRA_API_TOKEN)
- [ ] Deploy realizado
- [ ] Dashboard acessível
- [ ] Dados do Jira carregando
- [ ] Filtros funcionando

## 🎉 Pronto!

Seu dashboard está no ar!

**URLs:**
- Dashboard: `https://seu-projeto.vercel.app`
- Repositório: https://github.com/olanderteam/sprint-cw

## 💡 Dica

Se der timeout frequentemente, considere:
1. Adicionar `PROJECT_KEYS` para limitar boards
2. Ou usar Railway para o backend (veja `DEPLOY-PROXY-RAILWAY.md`)

---

**Dúvidas?** Verifique os logs no Vercel: Functions → Logs
