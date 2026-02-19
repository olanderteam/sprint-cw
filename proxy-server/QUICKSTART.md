# Quick Start Guide

## Para começar rapidamente:

### Windows:
```bash
cd proxy-server
setup.bat
```

### Linux/Mac:
```bash
cd proxy-server
chmod +x setup.sh
./setup.sh
```

### Ou manualmente:
```bash
cd proxy-server

# Instalar dependências
npm install express cors dotenv axios
npm install --save-dev typescript @types/node @types/express @types/cors ts-node nodemon @types/jest jest ts-jest

# Configurar ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais do Jira

# Iniciar servidor de desenvolvimento
npm run dev
```

## Próximos Passos

Após a configuração inicial:

1. ✅ Task 1 completa - Estrutura do projeto configurada
2. ⏭️ Task 2 - Implementar módulo de configuração (src/config.ts)
3. ⏭️ Task 3 - Implementar cliente Jira (src/jira-client.ts)
4. ⏭️ Task 4 - Implementar módulo de cache (src/cache.ts)

Consulte o README.md para documentação completa.
