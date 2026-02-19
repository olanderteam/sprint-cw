# Sprint Compass Dashboard

Dashboard de acompanhamento de sprints para múltiplos squads integrado com Jira.

## 🚀 Features

- ✅ Visualização de múltiplos squads em tempo real
- ✅ Integração com Jira API
- ✅ Filtros avançados (Sprint, Responsável, Prioridade, Status, Tipo de Issue)
- ✅ Métricas de velocity, burndown, e cycle time
- ✅ Alertas de blockers e riscos
- ✅ Gráficos interativos com Recharts
- ✅ Interface moderna com Tailwind CSS e shadcn/ui

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no Jira com API Token
- Conta no Vercel (para deploy)

## 🛠️ Instalação Local

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd sprint-compass
```

### 2. Instale as dependências

#### Frontend
```bash
npm install
```

#### Backend (Proxy Server)
```bash
cd proxy-server
npm install
cd ..
```

### 3. Configure as variáveis de ambiente

#### Backend - `proxy-server/.env`
```env
JIRA_DOMAIN=your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
PROJECT_KEYS=PROJECT1,PROJECT2  # Opcional
PORT=3001
```

**Como obter o Jira API Token:**
1. Acesse https://id.atlassian.com/manage-profile/security/api-tokens
2. Clique em "Create API token"
3. Copie o token gerado

### 4. Execute o projeto

#### Opção A: Usando o script automático (Windows)
```bash
start-dev.bat
```

#### Opção B: Manualmente (2 terminais)

Terminal 1 - Backend:
```bash
cd proxy-server
npm run build
npm start
```

Terminal 2 - Frontend:
```bash
npm run dev
```

Acesse: http://localhost:8080

## 🚀 Deploy no Vercel

### 1. Prepare o repositório
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy do Frontend no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Importe seu repositório
3. Configure as variáveis de ambiente:
   - `VITE_PROXY_URL` = URL do seu proxy server (veja próximo passo)
4. Deploy!

### 3. Deploy do Proxy Server

**IMPORTANTE:** O proxy server NÃO deve ser deployado no Vercel devido a limitações de timeout.

**Opções recomendadas:**

#### Opção A: Railway (Recomendado)
1. Acesse [railway.app](https://railway.app)
2. Crie novo projeto
3. Conecte seu repositório
4. Configure Root Directory: `proxy-server`
5. Adicione variáveis de ambiente (JIRA_DOMAIN, JIRA_EMAIL, JIRA_API_TOKEN)
6. Deploy!
7. Copie a URL gerada e configure no Vercel como `VITE_PROXY_URL`

#### Opção B: Render
1. Acesse [render.com](https://render.com)
2. New → Web Service
3. Conecte seu repositório
4. Root Directory: `proxy-server`
5. Build Command: `npm install && npm run build`
6. Start Command: `npm start`
7. Adicione variáveis de ambiente
8. Deploy!

#### Opção C: Heroku
```bash
# Na pasta proxy-server
heroku create seu-app-name
heroku config:set JIRA_DOMAIN=your-domain.atlassian.net
heroku config:set JIRA_EMAIL=your-email@example.com
heroku config:set JIRA_API_TOKEN=your-token
git subtree push --prefix proxy-server heroku main
```

### 4. Configure VITE_PROXY_URL no Vercel

Após deploy do proxy, volte ao Vercel:
1. Settings → Environment Variables
2. Adicione: `VITE_PROXY_URL` = `https://seu-proxy.railway.app` (ou URL do seu serviço)
3. Redeploy o frontend

## 📁 Estrutura do Projeto

```
sprint-compass/
├── src/                      # Frontend React + TypeScript
│   ├── components/          # Componentes React
│   │   ├── dashboard/      # Componentes do dashboard
│   │   ├── charts/         # Gráficos
│   │   └── ui/             # Componentes shadcn/ui
│   ├── hooks/              # React hooks customizados
│   ├── pages/              # Páginas da aplicação
│   ├── types/              # TypeScript types
│   └── config/             # Configurações
├── proxy-server/            # Backend Node.js + Express
│   ├── src/
│   │   ├── index.ts        # Servidor Express
│   │   ├── jira-client.ts  # Cliente Jira API
│   │   ├── data-aggregator.ts  # Agregação de dados
│   │   └── cache.ts        # Sistema de cache
│   └── dist/               # Build do backend
├── public/                  # Assets estáticos
└── vercel.json             # Configuração Vercel (apenas frontend)
```

## 🔧 Tecnologias

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts
- React Query
- React Router

### Backend
- Node.js
- Express
- TypeScript
- Axios
- CORS

## 📊 Funcionalidades

### Dashboard Principal
- Visão geral de todos os squads
- Métricas de completion, velocity, e health
- Alertas de blockers e riscos
- Filtros avançados

### Filtros Avançados
- Sprint: Todas as sprints (ativas, fechadas, futuras)
- Responsável: Todos os membros do Jira
- Prioridade: High, Medium, Low
- Status: To Do, In Progress, In Review, Done
- Tipo de Issue: Bug, Story, Task, Epic, etc.
- Squad: Filtrar por squad específico

### Gráficos
- Burndown Chart
- Velocity Chart
- Created vs Completed
- Cycle Time by Type
- Priority Evolution
- Work Item Age

## 🐛 Troubleshooting

### Erro: "Failed to fetch Jira data"
- Verifique as credenciais do Jira no `.env`
- Confirme que o API Token está correto
- Verifique se o domínio está correto (sem https://)

### Erro: "504 Gateway Timeout"
- O proxy está demorando muito
- Solução: Deploy o proxy em serviço dedicado (Railway/Render)

### Filtros não mostram todos os dados
- Limpe o cache do navegador (Ctrl+Shift+R)
- Reinicie o servidor proxy
- Verifique os logs do servidor

## 📝 Desenvolvimento

### Adicionar novo filtro
1. Adicione o campo em `FilterValues` (`src/components/dashboard/AdvancedFilters.tsx`)
2. Adicione a lógica de filtro em `Index.tsx`
3. Adicione a seção no componente `AdvancedFilters`

### Adicionar novo gráfico
1. Crie o componente em `src/components/charts/`
2. Adicione os dados necessários no backend (`data-aggregator.ts`)
3. Importe e use no `Index.tsx`

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Autores

- Desenvolvido para acompanhamento de sprints de múltiplos squads

## 🙏 Agradecimentos

- shadcn/ui pelos componentes
- Recharts pelos gráficos
- Jira API pela integração
