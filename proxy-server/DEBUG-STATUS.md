# 🔍 Debug de Status do Jira

## Problema: Done e In Progress aparecem zerados

Isso acontece quando os status do Jira não estão sendo mapeados corretamente.

## Como Verificar

### 1. Veja os Logs do Servidor

Após recompilar e iniciar o servidor, procure por:

```
[DataAggregator] Board 123 unique statuses: [ 'To Do', 'Backlog', 'A Fazer' ]
```

Isso mostra todos os status que existem nas issues da sprint.

### 2. Veja o Mapeamento

O servidor mapeia status do Jira para categorias simplificadas:

**Done** (Concluído):
- done, closed, resolved
- concluído, concluida, finalizado, completo

**In Progress** (Em Andamento):
- progress, dev, coding, development
- desenvolvimento, andamento, fazendo, doing, working

**In Review** (Em Revisão):
- review, qa, test, testing
- revisão, revisao, homologação, homologacao

**To Do** (A Fazer):
- Qualquer outro status não mapeado acima

## Solução

### Se os status estão em português ou têm nomes customizados:

1. Veja os logs para identificar os nomes exatos dos status
2. Adicione-os ao mapeamento em `proxy-server/src/data-aggregator.ts`

Exemplo: Se você usa "Fazendo" para In Progress:

```typescript
if (
  lower.includes('progress') || 
  lower.includes('fazendo') ||  // <-- Adicione aqui
  lower.includes('andamento')
) {
  return 'In Progress';
}
```

3. Recompile: `npm run build`
4. Reinicie: `npm start`

## Exemplo de Log Completo

```
[DataAggregator] Board 123: Found 28 issues in sprint
[DataAggregator] Sample issue PROJ-123: {
  storyPoints: 5,
  rawStatus: 'Em Desenvolvimento',
  mappedStatus: 'In Progress',
  priority: 'Medium'
}
[DataAggregator] Board 123 unique statuses: [
  'A Fazer',
  'Em Desenvolvimento', 
  'Em Revisão',
  'Concluído'
]
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

## Status Comuns no Jira Brasil

- **A Fazer** → To Do
- **Fazendo** / **Em Desenvolvimento** → In Progress
- **Em Revisão** / **Code Review** → In Review
- **Concluído** / **Feito** → Done
- **Backlog** → To Do
- **Bloqueado** → (mantém status original, mas conta como blocker)

## Verificação Rápida

Se TODAS as issues estão como "To Do", provavelmente:
1. As issues realmente não foram iniciadas no Jira, OU
2. Os nomes dos status não estão sendo reconhecidos

Verifique no Jira se as issues têm status diferentes de "To Do" ou "Backlog".
