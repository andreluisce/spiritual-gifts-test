# Corrigir Função get_quiz_report

## Problema Encontrado

A função `get_quiz_report` estava usando colunas incorretas:
- ❌ `question_order` (não existe na tabela `question_pool`)
- ❌ `question_text` (deveria ser `text`)

## Solução

A migração foi corrigida em: `supabase/migrations/20260106175000_create_quiz_report_function.sql`

Mudanças:
- ✅ Usar `a.question_id` para ordenação
- ✅ Usar `qp.text` em vez de `question_text`

## Como Aplicar

### Opção 1: Supabase Dashboard (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/vttkurdzstlkybojigry/sql/new

2. Copie todo o conteúdo do arquivo:
   ```
   supabase/migrations/20260106175000_create_quiz_report_function.sql
   ```

3. Cole no editor SQL e clique em **"Run"**

4. Você verá a mensagem: "Success. No rows returned"

### Opção 2: Teste via Node.js

Após aplicar a migração, você pode testar com:

```bash
node test-rpc.js
```

Você deverá ver:
```
✅ RPC call successful!
📊 Report data: {...}
```

## Próximos Passos

Depois de aplicar a migração, a rota funcionará:
```
http://localhost:3000/pt/admin/quiz-report/aae16add-62a0-43a0-8fc5-9c1f711ad63a
```

## Debug

Se ainda houver erro, execute:
```bash
node check-schema.js
```

Para verificar a estrutura das tabelas.
