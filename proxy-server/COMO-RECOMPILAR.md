# 🔧 Como Recompilar o Servidor Proxy

## ⚠️ IMPORTANTE

**`npm install` NÃO recompila o código TypeScript!**

Você precisa executar o **BUILD** para que as mudanças no código funcionem.

---

## 📋 Passo a Passo

### 1️⃣ Pare o Servidor

Se o servidor estiver rodando, pressione `Ctrl+C` no terminal.

### 2️⃣ Recompile o Código

Abra o terminal na pasta `proxy-server` e execute:

```bash
npm run build
```

Você deve ver algo como:
```
> jira-proxy-server@1.0.0 build
> tsc
```

### 3️⃣ Inicie o Servidor

```bash
npm start
```

Você deve ver:
```
[Server] Starting Jira Proxy Server...
[Server] Server running on http://localhost:3001
```

### 4️⃣ Limpe o Cache do Navegador

No navegador, pressione `Ctrl+Shift+R` para fazer um hard refresh.

---

## ✅ Como Verificar se Funcionou

Após recompilar, você deve ver nos logs do servidor:

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

**Se `taskDist` mostrar valores diferentes de zero, funcionou!** ✅

---

## 🐛 Problemas Comuns

### Erro: "tsc: command not found"

Execute:
```bash
npm install
npm run build
```

### Erro: "Cannot find module"

Delete a pasta `node_modules` e reinstale:
```bash
rmdir /s /q node_modules
npm install
npm run build
```

### Servidor não inicia

Verifique se a porta 3001 está livre:
```bash
netstat -ano | findstr :3001
```

Se estiver em uso, mate o processo ou mude a porta no arquivo `.env`.

---

## 🔄 Quando Recompilar?

Você precisa recompilar sempre que:
- Modificar arquivos `.ts` na pasta `src/`
- Atualizar o código do servidor
- Fazer pull de mudanças do repositório

---

## 💡 Dica Rápida

Para desenvolvimento, use:
```bash
npm run dev
```

Isso recompila automaticamente quando você salva arquivos!
