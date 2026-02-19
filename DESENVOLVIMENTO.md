# Guia de Desenvolvimento

## Executando Localmente

Para executar o projeto localmente, você precisa rodar **dois servidores** em terminais separados:

### Terminal 1: Servidor Proxy (Backend)

```bash
cd proxy-server
npm install
npm start
```

O servidor proxy será iniciado em `http://localhost:3001`

### Terminal 2: Frontend (React)

```bash
npm install
npm run dev
```

O frontend será iniciado em `http://localhost:8080`

## Verificando se está funcionando

1. Abra `http://localhost:3001/health` - deve retornar status OK
2. Abra `http://localhost:8080` - deve mostrar o dashboard

## Deploy na Vercel

### Configuração de Variáveis de Ambiente

No painel da Vercel, adicione as seguintes variáveis de ambiente:

- `JIRA_DOMAIN` - Seu domínio Jira (ex: `sua-empresa.atlassian.net`)
- `JIRA_EMAIL` - Email da conta Jira
- `JIRA_API_TOKEN` - Token de API do Jira
- `PROJECT_KEYS` - Chaves dos projetos separadas por vírgula (ex: `CONT,GWT,CHN`)

### Deploy

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm install -g vercel

# Deploy
vercel
```

## Estrutura do Projeto

```
.
├── src/                    # Frontend React
├── proxy-server/          # Servidor proxy Node.js
│   ├── src/              # Código fonte do proxy
│   └── dist/             # Código compilado
├── public/               # Arquivos estáticos
└── vercel.json          # Configuração Vercel
```

## Troubleshooting

### Erro: ERR_CONNECTION_REFUSED na porta 3001

**Causa**: O servidor proxy não está rodando.

**Solução**: Abra um terminal separado e execute:
```bash
cd proxy-server
npm start
```

### Dashboard mostra dados mockados

**Causa**: O frontend não consegue conectar ao servidor proxy.

**Solução**: 
1. Verifique se o servidor proxy está rodando em `http://localhost:3001`
2. Teste acessando `http://localhost:3001/health` no navegador
3. Verifique o console do navegador para erros

### Nomes dos boards não estão formatados

**Causa**: O código antigo ainda está em cache.

**Solução**:
1. Pare o servidor proxy (Ctrl+C)
2. Recompile: `cd proxy-server && npm run build`
3. Inicie novamente: `npm start`
4. Faça hard refresh no navegador (Ctrl+Shift+R)

## Otimizações de Performance

### Problema de Timeout Resolvido (504 Gateway Timeout)

**Problema**: O dashboard ficava em loading infinito ("Fetching live data from Jira…") e retornava erro 504 após 60 segundos.

**Causa Raiz**: O código estava chamando `getBoardHistory()` para TODOS os quadros, incluindo quadros Kanban/simples sem sprints. Isso recuperava milhares de issues e demorava muito tempo.

**Solução Implementada**:
1. **Filtrar quadros sem sprints**: Apenas processar quadros com sprints ativos
2. **Usar apenas issues da sprint**: Substituir `getBoardHistory()` por `getSprintIssues()` 
3. **Otimizar gráfico "Created vs Completed"**: Usar apenas issues da sprint atual ao invés do histórico completo do quadro
4. **Timeout de 60 segundos**: Adicionar timeout na rota para evitar espera infinita

**Arquivos Modificados**:
- `proxy-server/src/data-aggregator.ts`: Removida chamada `getBoardHistory()`, agora usa apenas issues da sprint
- `proxy-server/src/routes/jira-data.ts`: Adicionado timeout de 60 segundos

**Resultado**: Tempo de carregamento reduzido de 60+ segundos (timeout) para ~5-15 segundos dependendo do número de quadros ativos.

### Problema de Dados Zerados Resolvido

**Problema**: Os campos "Done", "In Progress" e "To Do" apareciam zerados no dashboard.

**Causa Raiz**: 
1. Issues sem story points configurados no Jira resultavam em contadores zerados
2. Dashboard estava mostrando dados mockados ao invés de dados reais do Jira

**Solução Implementada**:
1. **Contagem de issues sem story points**: Se uma issue não tem story points, conta como 1 para distribuição de tarefas
2. **Remover fallback para dados mockados**: Dashboard agora só mostra dados reais do Jira
3. **Adicionar logs de debug**: Logs mostram story points e contadores para facilitar troubleshooting

**Arquivos Modificados**:
- `proxy-server/src/data-aggregator.ts`: Adicionar lógica `spOrOne` para contar issues sem story points
- `src/pages/Index.tsx`: Remover fallback automático para dados mockados

**Resultado**: Dashboard agora mostra contadores corretos mesmo quando issues não têm story points configurados.

### Como Testar a Otimização

1. Pare o servidor proxy se estiver rodando (Ctrl+C)
2. Recompile o código:
   ```bash
   cd proxy-server
   npm run build
   ```
3. Inicie o servidor novamente:
   ```bash
   npm start
   ```
4. Acesse o dashboard em `http://localhost:8080`
5. O loading deve completar em 5-15 segundos (ao invés de timeout)

### Logs Esperados

Quando funcionando corretamente, você verá logs como:
```
[DataAggregator] Found 18 boards
[DataAggregator] Processing board 123 (quadro GH)
[DataAggregator] Board 123: Found 45 issues in sprint
[DataAggregator] Skipping board 456 (Kanban Board) - no active sprint
[DataAggregator] Successfully processed board 123 (quadro GH)
```

**Nota**: Quadros sem sprints ativos (Kanban/simples) serão pulados automaticamente com a mensagem "no active sprint" - isso é esperado e correto.


## Problemas Comuns e Soluções

### Dados "Done 0, In Progress 0, To Do 0" aparecem zerados

**Causa**: O servidor proxy não foi recompilado após as mudanças no código.

**Solução**:
1. Pare o servidor proxy (Ctrl+C no terminal onde está rodando)
2. Execute o rebuild:
   ```bash
   cd proxy-server
   rebuild.bat
   ```
3. Inicie o servidor novamente:
   ```bash
   npm start
   ```
4. Limpe o cache do navegador (Ctrl+Shift+R) e recarregue o dashboard

**Verificação**: No console do servidor, você deve ver logs como:
```
[DataAggregator] Board 123 metrics: {
  name: 'Squad de Content',
  totalSP: 45,
  completedSP: 30,
  taskDist: { done: 15, inProgress: 8, todo: 5 },
  issuesCount: 28,
  blockers: 0,
  health: 'green'
}
```

### Todos os quadros aparecem com alerta crítico

**Causa**: 
1. Servidor proxy não foi recompilado
2. Issues com prioridade "Blocker" ou flagged no Jira

**Solução**:
1. Recompile o servidor (veja instruções acima)
2. Verifique os logs do servidor para ver quais issues estão sendo detectadas como blockers:
   ```
   [DataAggregator] Blocker found: PROJ-123 - Priority: Blocker, Flagged: false, Status: In Progress
   ```
3. No Jira, verifique se há issues com:
   - Prioridade "Blocker" ou "Critical"
   - Flag ativa (bandeira vermelha)
   - Status diferente de "Done"

**Nota**: Issues concluídas (Done) não são contadas como blockers, mesmo que tenham prioridade alta.

### Dashboard mostra dados mockados ao invés de dados reais

**Causa**: Erro ao conectar com o servidor proxy ou API do Jira.

**Solução**:
1. Verifique se o servidor proxy está rodando: `http://localhost:3001/health`
2. Verifique as credenciais do Jira no arquivo `proxy-server/.env`:
   ```
   JIRA_DOMAIN=sua-empresa.atlassian.net
   JIRA_EMAIL=seu-email@empresa.com
   JIRA_API_TOKEN=seu-token-aqui
   ```
3. Verifique o console do navegador para erros de conexão
4. Verifique os logs do servidor proxy para erros de autenticação

### Barra de progresso não aparece corretamente

**Causa**: Cálculo de largura da barra quando não há story points.

**Solução**: Já corrigido no código. Se ainda aparecer incorreto:
1. Limpe o cache do navegador (Ctrl+Shift+R)
2. Verifique se está usando a versão mais recente do frontend
