# Plano Final V1 - Go Live

Este documento consolida as tarefas restantes para finalizar a versão 1.0 do projeto, focando em estabilidade, internacionalização e correção de bugs críticos.

## 🚨 1. Correções Críticas (Bloqueadores)

- [x] **Aplicar Migração de Audit Logs (Cloud)**
  - O erro `function log_audit_event does not exist` foi resolvido.
  - A migração `20260108154600_create_audit_logs_and_functions.sql` foi aplicada com sucesso usando `supabase db push`.
  - Funções conflitantes foram removidas dinamicamente antes da criação.

## 🌍 2. Internacionalização (i18n)

- [x] **Traduzir Página de Relatórios de Quiz** (`/admin/quiz-report/[sessionId]`)
  - Status: Concluído. O arquivo `page.tsx` já usa `useTranslations` e as chaves existem em `pt.json`.
- [ ] **Varredura Final de Hardcoded Strings**
  - Verificar `/admin/settings` e componentes de modal/dialogs.

## 🔒 3. Sistema de Aprovação (Validar)

- [ ] **Validar Fluxo Completo**
  1. Novo usuário se cadastra.
  2. Tenta acessar `/quiz` -> Deve ser bloqueado (Pending Page).
  3. Admin aprova usuário em `/admin/users`.
  4. Usuário acessa `/quiz` -> Deve conseguir responder.
  5. Quiz loga atividade e gera relatório.

## ✅ 4. Polimento & Limpeza

- [ ] **Remover Arquivos Temporários**
  - Limpar arquivos antigos em `.agent/` que não são mais úteis.

## 📝 Instruções para o Usuário

1. Execute `npx supabase db push` para corrigir o erro do banco de dados imediatamente.
2. Confirme quando isso for feito para que possamos testar a submissão do quiz.
