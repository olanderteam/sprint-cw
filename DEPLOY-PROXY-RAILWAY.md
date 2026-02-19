# Deploy do Proxy Server no Railway

## 🚂 Por que Railway?

- ✅ Fácil de configurar
- ✅ Deploy automático do GitHub
- ✅ $5 de crédito grátis por mês
- ✅ Sem timeout de 10 segundos (diferente do Vercel)
- ✅ Suporta Node.js nativamente

## 📋 Passo a Passo

### 1. Criar conta no Railway

1. Acesse: https://railway.app
2. Clique em "Start a New Project"
3. Faça login com GitHub

### 2. Criar novo projeto

1. Clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Escolha o repositório: `olanderteam/sprint-cw`
4. Clique em "Deploy Now"

### 3. Configurar o Root Directory

⚠️ **IMPORTANTE:** O Railway vai tentar fazer deploy da raiz do projeto, mas precisamos apenas do `proxy-server`.

1. Clique no serviço criado
2. Vá em "Settings"
3. Em "Root Directory", digite: `proxy-server`
4. Clique em "Save"

### 4. Configurar Build e Start Commands

1. Ainda em "Settings"
2. Em "Build Command", adicione:
   ```
   npm install && npm run build
   ```
3. Em "Start Command", adicione:
   ```
   npm start
   ```
4. Clique em "Save"

### 5. Adicionar Variáveis de Ambiente

1. Vá na aba "Variables"
2. Adicione as seguintes variáveis:

```
JIRA_DOMAIN=your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
PORT=3001
```

**Como obter o Jira API Token:**
1. Acesse: https://id.atlassian.com/manage-profile/security/api-tokens
2. Clique em "Create API token"
3. Dê um nome (ex: "Sprint Compass")
4. Copie o token gerado

3. Clique em "Add" para cada variável

### 6. Fazer Deploy

1. Após adicionar as variáveis, o Railway vai fazer redeploy automaticamente
2. Aguarde o deploy terminar (pode levar 2-3 minutos)
3. Verifique os logs para confirmar que está funcionando

### 7. Obter a URL do Proxy

1. Na página do serviço, vá em "Settings"
2. Em "Networking", clique em "Generate Domain"
3. O Railway vai gerar uma URL tipo: `https://seu-app.up.railway.app`
4. **COPIE ESSA URL** - você vai precisar dela no Vercel!

### 8. Testar o Proxy

Abra no navegador:
```
https://seu-app.up.railway.app/api/jira-data
```

Você deve ver os dados do Jira em JSON. Se der erro, verifique:
- As variáveis de ambiente estão corretas?
- O Jira API Token está válido?
- Os logs mostram algum erro?

## 🔧 Configurar no Vercel

Agora que o proxy está rodando, vamos configurar o frontend no Vercel:

### 1. Deploy do Frontend no Vercel

1. Acesse: https://vercel.com
2. Clique em "Add New Project"
3. Importe o repositório: `olanderteam/sprint-cw`
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `.` (raiz do projeto)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 2. Adicionar Variável de Ambiente no Vercel

⚠️ **CRÍTICO:** Adicione esta variável:

```
VITE_PROXY_URL=https://seu-app.up.railway.app
```

**Substitua** `seu-app.up.railway.app` pela URL que você copiou do Railway!

1. No Vercel, vá em "Settings" → "Environment Variables"
2. Adicione:
   - **Name:** `VITE_PROXY_URL`
   - **Value:** `https://seu-app.up.railway.app` (sua URL do Railway)
   - **Environment:** Production, Preview, Development (marque todos)
3. Clique em "Save"

### 3. Fazer Deploy

1. Clique em "Deploy"
2. Aguarde o deploy terminar
3. Acesse a URL fornecida pelo Vercel
4. O dashboard deve carregar os dados do Jira! 🎉

## 🐛 Troubleshooting

### Erro: "Failed to fetch Jira data"

**Verifique no Railway:**
1. Logs do serviço (aba "Deployments" → clique no deploy → "View Logs")
2. Variáveis de ambiente estão corretas?
3. O serviço está rodando? (deve mostrar "Active")

**Verifique no Vercel:**
1. A variável `VITE_PROXY_URL` está configurada?
2. A URL está correta (sem barra no final)?
3. Faça redeploy após adicionar a variável

### Erro: "CORS"

O proxy já está configurado com CORS. Se ainda der erro:
1. Verifique se a URL no `VITE_PROXY_URL` está correta
2. Tente acessar diretamente: `https://seu-proxy.railway.app/api/jira-data`

### Proxy muito lento

1. Verifique quantos boards estão sendo processados
2. Considere adicionar `PROJECT_KEYS` para limitar os boards
3. Verifique os logs do Railway para ver o tempo de resposta

## 💰 Custos

### Railway
- **Plano Hobby:** $5 de crédito grátis por mês
- **Uso estimado:** ~$3-5/mês (dependendo do tráfego)
- Se ultrapassar, upgrade para Developer ($10/mês)

### Vercel
- **Plano Hobby:** Grátis
- Suficiente para o frontend

**Total estimado:** $0-5/mês (dentro do free tier do Railway)

## 🔄 Atualizações Futuras

Quando você fizer mudanças no código:

1. **Commit e push:**
   ```bash
   git add .
   git commit -m "Descrição das mudanças"
   git push origin main
   ```

2. **Railway:** Deploy automático
3. **Vercel:** Deploy automático

Ambos fazem deploy automático quando você faz push para `main`!

## ✅ Checklist Final

- [ ] Proxy deployado no Railway
- [ ] URL do proxy copiada
- [ ] Variáveis de ambiente configuradas no Railway
- [ ] Proxy testado e funcionando
- [ ] Frontend deployado no Vercel
- [ ] `VITE_PROXY_URL` configurada no Vercel
- [ ] Dashboard acessível e carregando dados do Jira
- [ ] Filtros funcionando corretamente

## 🎉 Pronto!

Seu dashboard está no ar! Acesse a URL do Vercel e aproveite.

**URLs importantes:**
- Frontend (Vercel): `https://seu-projeto.vercel.app`
- Backend (Railway): `https://seu-app.up.railway.app`
- Repositório: https://github.com/olanderteam/sprint-cw
