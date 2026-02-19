# Jira Proxy Server

Servidor proxy Node.js/Express que substitui a edge function do Supabase, permitindo que o dashboard React busque dados do Jira sem restrições de CORS.

## Pré-requisitos

- Node.js 18+ instalado
- Credenciais do Jira (domain, email, API token)
- npm ou yarn

## Configuração Inicial

### 1. Instalar Dependências

Execute os seguintes comandos no diretório `proxy-server/`:

```bash
# Instalar dependências de produção
npm install express cors dotenv axios

# Instalar dependências de desenvolvimento
npm install --save-dev typescript @types/node @types/express @types/cors ts-node nodemon @types/jest jest ts-jest
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure suas credenciais do Jira:

```env
PORT=3001
JIRA_DOMAIN=your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token
CACHE_TTL=120
NODE_ENV=development
```

### 3. Como Obter Credenciais do Jira

1. **JIRA_DOMAIN**: O domínio da sua instância Jira (ex: `mycompany.atlassian.net`)
2. **JIRA_EMAIL**: Seu email de login no Jira
3. **JIRA_API_TOKEN**: 
   - Acesse https://id.atlassian.com/manage-profile/security/api-tokens
   - Clique em "Create API token"
   - Dê um nome ao token e copie o valor gerado

## Comandos Disponíveis

### Desenvolvimento

```bash
npm run dev
```

Inicia o servidor em modo de desenvolvimento com hot-reload usando nodemon.

### Produção

```bash
# Compilar TypeScript para JavaScript
npm run build

# Iniciar servidor em produção
npm start
```

### Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch
```

## Estrutura do Projeto

```
proxy-server/
├── src/
│   ├── index.ts           # Entry point e configuração do Express
│   ├── config.ts          # Carregamento e validação de configurações
│   ├── jira-client.ts     # Cliente para comunicação com Jira API
│   ├── cache.ts           # Implementação do cache em memória
│   ├── types.ts           # Tipos TypeScript compartilhados
│   ├── routes/
│   │   └── jira-data.ts   # Endpoint principal para buscar dados
│   └── __tests__/         # Testes unitários e de propriedade
├── .env.example           # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Endpoints da API

### GET /api/jira-data

Busca dados agregados de todos os boards do Jira.

**Response (Success)**:
```json
{
  "sprint": { ... },
  "squads": [ ... ],
  "alerts": [ ... ],
  ...
}
```

**Response (Error)**:
```json
{
  "error": "Mensagem de erro descritiva",
  "statusCode": 401
}
```

### POST /api/cache/invalidate

Invalida o cache manualmente.

## Troubleshooting

### Erro: "Authentication failed"
- Verifique se suas credenciais no `.env` estão corretas
- Certifique-se de que o API token é válido
- Verifique se o email corresponde à conta com acesso ao Jira

### Erro: "Jira API is currently unavailable"
- Verifique sua conexão com a internet
- Verifique se o JIRA_DOMAIN está correto
- Tente acessar o Jira diretamente no navegador

### Erro: "Configuration error"
- Certifique-se de que o arquivo `.env` existe
- Verifique se todas as variáveis obrigatórias estão definidas
- Verifique se não há espaços extras nas variáveis

## Deploy em Produção

### Opção 1: Servidor VPS/Cloud (Recomendado)

1. Faça deploy em DigitalOcean, AWS EC2, Google Cloud, etc.
2. Configure as variáveis de ambiente no servidor
3. Use PM2 para gerenciamento de processo:

```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name jira-proxy
```

4. Configure HTTPS com Let's Encrypt:

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
```

### Opção 2: Docker Container

Crie um `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

Build e execute:

```bash
docker build -t jira-proxy .
docker run -p 3001:3001 --env-file .env jira-proxy
```

### Opção 3: Serverless (Vercel, Netlify)

Adapte o código para formato serverless conforme documentação da plataforma escolhida.

## Segurança

- ⚠️ **NUNCA** commite o arquivo `.env` com credenciais reais
- Use HTTPS em produção
- Configure CORS restritivo em produção (limitar origins permitidas)
- Implemente rate limiting se necessário
- Monitore logs para detectar acessos suspeitos

## Monitoramento

Métricas recomendadas para monitorar:
- Taxa de requisições por minuto
- Latência média de resposta
- Taxa de erro (por tipo)
- Taxa de cache hit/miss
- Uso de memória

Ferramentas sugeridas:
- Logs: Winston ou Pino
- Monitoring: Prometheus + Grafana
- Error tracking: Sentry
- Uptime: UptimeRobot ou Pingdom

## Suporte

Para problemas ou dúvidas, consulte a documentação do Jira API:
https://developer.atlassian.com/cloud/jira/platform/rest/v3/
