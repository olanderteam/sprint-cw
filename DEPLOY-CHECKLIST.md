# Checklist para Deploy no Vercel

## ✅ Arquivos Prontos

### Frontend
- ✅ `vercel.json` - Configuração do Vercel (builds e rotas)
- ✅ `src/config/api.ts` - Configuração de API (dev/prod)
- ✅ `package.json` - Script de build configurado
- ✅ Componente SprintGoalPanel removido

### Backend (Proxy Server)
- ✅ `proxy-server/src/index.ts` - Servidor Express
- ✅ `proxy-server/tsconfig.json` - Configuração TypeScript
- ✅ Código compilado em `proxy-server/dist/`

## 🔧 Configurações Necessárias no Vercel

### 1. Variáveis de Ambiente
Você precisa configurar estas variáveis no painel do Vercel:

```
JIRA_DOMAIN=your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
PROJECT_KEYS=PROJECT1,PROJECT2  (opcional)
```

**Como configurar:**
1. Acesse seu projeto no Vercel
2. Vá em Settings → Environment Variables
3. Adicione cada variável acima

### 2. Build Settings
O Vercel deve detectar automaticamente, mas confirme:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## ⚠️ Problemas Conhecidos

### 1. Proxy Server no Vercel
O `vercel.json` está configurado para rodar o proxy server como Serverless Function.

**IMPORTANTE:** Serverless functions no Vercel têm limitações:
- Timeout máximo: 10 segundos (Hobby plan) ou 60 segundos (Pro plan)
- Não mantém estado entre requisições
- Cache não persiste entre invocações

**Solução Recomendada:**
Se o carregamento dos dados do Jira demorar mais que 10 segundos, você tem 2 opções:

#### Opção A: Hospedar o proxy separadamente
1. Deploy o proxy server em outro serviço (Heroku, Railway, Render, etc.)
2. Configure a variável `VITE_PROXY_URL` no Vercel apontando para o proxy externo

#### Opção B: Upgrade para Vercel Pro
- Aumenta timeout para 60 segundos
- Mais adequado para operações longas

### 2. CORS
O proxy server já está configurado com CORS habilitado para aceitar requisições do frontend.

### 3. Cache
O cache em memória do proxy não funcionará bem em Serverless Functions. Considere:
- Usar Vercel KV (Redis) para cache persistente
- Ou aceitar que cada requisição será "fria"

## 📋 Passos para Deploy

### 1. Preparar o Repositório
```bash
# Certifique-se de que tudo está commitado
git add .
git commit -m "Preparar para deploy no Vercel"
git push origin main
```

### 2. Conectar ao Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente (veja seção acima)
5. Clique em "Deploy"

### 3. Após o Deploy
1. Teste a URL fornecida pelo Vercel
2. Verifique se os dados do Jira estão carregando
3. Teste os filtros (sprints, responsáveis, tipos de issue)

## 🐛 Troubleshooting

### Erro: "504 Gateway Timeout"
- O proxy está demorando mais de 10 segundos
- Solução: Hospedar proxy separadamente ou upgrade para Pro

### Erro: "Failed to fetch Jira data"
- Verifique as variáveis de ambiente no Vercel
- Confirme que o JIRA_API_TOKEN está correto
- Verifique os logs no Vercel Dashboard

### Filtros não mostram todos os dados
- Certifique-se de que o servidor proxy foi reiniciado após as últimas mudanças
- Verifique os logs do servidor para confirmar que está coletando dados de todos os boards

## 📊 Monitoramento

Após o deploy, monitore:
- Tempo de resposta da API (`/api/jira-data`)
- Erros no console do navegador
- Logs do Vercel (Functions → Logs)

## 🔄 Atualizações Futuras

Para atualizar o dashboard:
```bash
# Faça suas mudanças
git add .
git commit -m "Descrição das mudanças"
git push origin main
```

O Vercel fará deploy automático a cada push para `main`.

## ✨ Melhorias Recomendadas

1. **Cache Persistente:** Implementar Vercel KV para cache
2. **Proxy Externo:** Hospedar proxy em serviço dedicado
3. **Monitoramento:** Adicionar Sentry ou similar para tracking de erros
4. **Performance:** Implementar loading incremental dos dados
5. **Autenticação:** Adicionar login se necessário

## 📝 Notas Finais

- O dashboard está funcional e pronto para deploy básico
- Para produção com muitos usuários, considere as melhorias acima
- Teste bem em staging antes de usar em produção
