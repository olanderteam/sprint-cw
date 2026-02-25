# Deploy no Vercel - Correção do WebSocket

## ✅ Correção Implementada

O erro `WebSocket connection to 'ws://localhost:8081/' failed` foi corrigido no código.

### O que foi mudado:
- **Arquivo**: `vite.config.ts`
- **Mudança**: HMR agora é desabilitado em produção (`mode === 'production'`)
- **Resultado**: Nenhum código HMR será incluído no build de produção

## 🚀 Deploy no Vercel

### Opção 1: Deploy Automático (Recomendado)

Se você tem integração GitHub + Vercel configurada:

1. **O deploy já foi iniciado automaticamente** após o push para `main`
2. Acesse: https://vercel.com/dashboard
3. Verifique o status do deploy
4. Aguarde a conclusão (geralmente 2-3 minutos)

### Opção 2: Deploy Manual

Se não tem integração automática:

1. Acesse: https://vercel.com
2. Clique em "Add New Project"
3. Importe o repositório: `olanderteam/sprint-cw`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (raiz)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Adicione a variável de ambiente**:
   ```
   VITE_PROXY_URL=https://seu-app.up.railway.app
   ```
   (Substitua pela URL do seu backend no Railway)

6. Clique em "Deploy"

## ✅ Verificação Pós-Deploy

Após o deploy ser concluído:

1. **Abra a aplicação** no Vercel
2. **Abra o Console do Navegador** (F12 → Console)
3. **Verifique**:
   - ❌ NÃO deve aparecer: `WebSocket connection to 'ws://localhost:8081/' failed`
   - ✅ A aplicação deve funcionar normalmente
   - ✅ Não deve haver erros relacionados ao HMR

## 🐛 Troubleshooting

### Se ainda aparecer erro de WebSocket:

1. **Limpe o cache do Vercel**:
   - Vá em: Settings → General → Clear Cache
   - Faça um novo deploy

2. **Verifique o build**:
   - Vá em: Deployments → [último deploy] → Build Logs
   - Procure por: `vite v5.x.x building for production...`
   - Confirme que o build foi feito em modo produção

3. **Verifique variáveis de ambiente**:
   - Vá em: Settings → Environment Variables
   - Confirme que `VITE_PROXY_URL` está configurada
   - Deve apontar para o Railway: `https://seu-app.up.railway.app`

### Se a aplicação não carregar dados:

1. **Verifique o backend no Railway**:
   - Acesse: https://railway.app
   - Confirme que o backend está rodando
   - Teste: `https://seu-app.up.railway.app/api/jira-data`
   - Deve retornar JSON com dados do Jira

2. **Verifique a URL no Vercel**:
   - Settings → Environment Variables
   - `VITE_PROXY_URL` deve ser exatamente a URL do Railway
   - SEM `/api/jira-data` no final

## 📊 Resultado Esperado

Após o deploy bem-sucedido:

- ✅ Console limpo, sem erros de WebSocket
- ✅ Dashboard carrega dados do Jira normalmente
- ✅ Filtros funcionam corretamente
- ✅ Gráficos e tabelas são exibidos
- ✅ Performance normal

## 💡 Dicas

- O Vercel faz deploy automático a cada push para `main`
- Você pode ver o preview de cada deploy antes de promover para produção
- Use o botão "Redeploy" se precisar forçar um novo build
- Logs de build e runtime estão disponíveis no dashboard do Vercel

---

**Status**: ✅ Correção implementada e pronta para produção
**Commit**: `d9c9190` - fix: disable HMR in production builds
**Branch**: `main`
