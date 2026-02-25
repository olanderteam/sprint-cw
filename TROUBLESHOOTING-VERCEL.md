# Troubleshooting e Melhorias - Vercel

## 🔧 Correção do WebSocket (Atualizada)

### Problema Original
Erro no console: `refresh.js:27 WebSocket connection to 'ws://localhost:8081/' failed`

### Causa Raiz
O plugin `@vitejs/plugin-react-swc` injeta código React Fast Refresh (HMR) automaticamente, mesmo em builds de produção, a menos que seja explicitamente desabilitado.

### Solução Implementada (Commit: 8a9e3aa)

**Arquivo**: `vite.config.ts`

```typescript
plugins: [
  react({
    // Disable Fast Refresh in production builds
    fastRefresh: !isProduction,
  })
]
```

Esta configuração garante que:
- ✅ Fast Refresh está DESABILITADO em produção
- ✅ Fast Refresh está HABILITADO em desenvolvimento
- ✅ Nenhum código HMR é injetado no bundle de produção

---

## 🚀 Deploy no Vercel - Passos Críticos

### 1. Limpar Cache do Vercel (IMPORTANTE!)

O Vercel pode estar usando um build antigo em cache. Para forçar um rebuild completo:

**Opção A: Via Dashboard**
1. Acesse: https://vercel.com/dashboard
2. Vá em: Settings → General
3. Clique em: "Clear Cache"
4. Faça um novo deploy

**Opção B: Via CLI**
```bash
vercel --force
```

**Opção C: Redeploy**
1. Vá em: Deployments
2. Clique nos 3 pontos do último deploy
3. Selecione: "Redeploy"
4. Marque: "Use existing Build Cache" = OFF

### 2. Verificar Variáveis de Ambiente

Acesse: Settings → Environment Variables

**Variável OBRIGATÓRIA**:
```
VITE_PROXY_URL=https://seu-app.up.railway.app
```

**IMPORTANTE**:
- ✅ Deve ser a URL completa do Railway
- ❌ NÃO adicione `/api/jira-data` no final
- ✅ Deve começar com `https://`
- ✅ Deve estar configurada para "Production"

### 3. Verificar Build Settings

Settings → General → Build & Development Settings:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

---

## 🔍 Verificação Pós-Deploy

Após o deploy ser concluído:

### 1. Verificar Console do Navegador

1. Abra a aplicação no Vercel
2. Pressione F12 → Console
3. Recarregue a página (Ctrl+F5 para forçar)

**Esperado**:
- ❌ NÃO deve aparecer: `WebSocket connection to 'ws://localhost:8081/' failed`
- ✅ Console limpo ou apenas logs normais da aplicação

### 2. Verificar Network Tab

1. F12 → Network
2. Recarregue a página
3. Procure por requisições para `/api/jira-data`

**Esperado**:
- ✅ Status 200 OK
- ✅ Response com dados JSON do Jira
- ❌ NÃO deve ter erro 504 (timeout)
- ❌ NÃO deve ter erro 500 (server error)

### 3. Verificar Funcionalidade

- ✅ Dashboard carrega dados
- ✅ Filtros funcionam
- ✅ Gráficos são exibidos
- ✅ Tabela de tarefas aparece

---

## 🐛 Problemas Comuns e Soluções

### Problema 1: Erro de WebSocket ainda aparece

**Possíveis causas**:
1. Cache do navegador
2. Cache do Vercel
3. Build antigo

**Soluções**:
```bash
# 1. Limpar cache do navegador
Ctrl+Shift+Delete → Limpar cache

# 2. Forçar reload sem cache
Ctrl+F5 ou Ctrl+Shift+R

# 3. Limpar cache do Vercel (ver seção acima)

# 4. Verificar se o commit mais recente foi deployado
# No Vercel Dashboard → Deployments → Ver commit hash
```

### Problema 2: Dados não carregam (Failed to fetch)

**Causa**: Backend no Railway não está respondendo ou URL incorreta

**Soluções**:
```bash
# 1. Testar backend diretamente
curl https://seu-app.up.railway.app/api/jira-data

# 2. Verificar logs do Railway
# Railway Dashboard → Logs

# 3. Verificar variável VITE_PROXY_URL no Vercel
# Settings → Environment Variables

# 4. Verificar se Railway está rodando
# Railway Dashboard → Status deve estar "Active"
```

### Problema 3: Erro 504 (Gateway Timeout)

**Causa**: Backend demora mais de 60 segundos para responder

**Soluções**:
1. Verificar logs do Railway para erros
2. Verificar se credenciais do Jira estão corretas
3. Verificar se há muitos boards configurados (pode demorar)
4. Considerar otimizar o backend (cache, paralelização)

### Problema 4: Erro 500 (Internal Server Error)

**Causa**: Erro no backend (Railway)

**Soluções**:
```bash
# 1. Ver logs do Railway
Railway Dashboard → Logs → Procurar por erros

# 2. Verificar variáveis de ambiente no Railway
JIRA_DOMAIN=seu-dominio.atlassian.net
JIRA_EMAIL=seu-email@example.com
JIRA_API_TOKEN=seu-token

# 3. Testar credenciais do Jira
curl -u email:token https://seu-dominio.atlassian.net/rest/api/3/myself
```

---

## 📊 Outras Melhorias Recomendadas

### 1. Otimização de Performance

**Problema**: Bundle muito grande (773 KB)

**Soluções**:
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        'chart-vendor': ['recharts'],
      }
    }
  }
}
```

### 2. Adicionar Loading States

**Problema**: Usuário não sabe se dados estão carregando

**Solução**: Já implementado em `src/pages/Index.tsx` com Loader2

### 3. Adicionar Error Boundaries

**Problema**: Erros podem quebrar toda a aplicação

**Solução**:
```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Algo deu errado. Recarregue a página.</div>;
    }
    return this.props.children;
  }
}
```

### 4. Adicionar Service Worker para Cache

**Problema**: Dados do Jira são buscados toda vez

**Solução**: Implementar PWA com Workbox

### 5. Adicionar Analytics

**Problema**: Não há visibilidade de uso

**Solução**: Adicionar Google Analytics ou Plausible

---

## 📝 Checklist de Deploy

Antes de cada deploy:

- [ ] Código commitado e pushed para `main`
- [ ] Testes passando localmente (`npm test`)
- [ ] Build local funciona (`npm run build`)
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Backend no Railway está rodando
- [ ] Cache do Vercel limpo (se necessário)

Após deploy:

- [ ] Console do navegador sem erros
- [ ] Dados carregam corretamente
- [ ] Filtros funcionam
- [ ] Gráficos são exibidos
- [ ] Performance aceitável (< 3s para carregar)

---

## 🆘 Suporte

Se o problema persistir:

1. **Verificar logs do Vercel**:
   - Deployments → [último deploy] → Build Logs
   - Deployments → [último deploy] → Function Logs

2. **Verificar logs do Railway**:
   - Railway Dashboard → Logs

3. **Testar localmente**:
   ```bash
   npm run build
   npm run preview
   # Abrir http://localhost:4173
   # Verificar console do navegador
   ```

4. **Criar issue no GitHub** com:
   - Screenshot do erro
   - Logs do Vercel
   - Logs do Railway
   - Passos para reproduzir

---

**Última atualização**: Commit 8a9e3aa
**Status**: ✅ Correção implementada e testada
