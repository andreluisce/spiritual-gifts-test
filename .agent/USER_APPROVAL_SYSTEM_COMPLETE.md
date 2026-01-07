# 🔐 Sistema de Aprovação de Usuários - Documentação Final

## 📊 Status: IMPLEMENTADO ✅

Data de Conclusão: 2026-01-07
Versão: 1.0.0

---

## 🎯 Objetivo
Permitir que qualquer pessoa crie uma conta (Sign Up/Sign In) via Google, mas restringir o acesso ao teste de dons espirituais até que um Manager ou Admin aprove a conta.

---

## 🏗️ Arquitetura Implementada

### **1. Database Layer** ✅
**Migration:** `20260107140000_user_approval_system.sql`
- **Profiles Table:** Adicionado `approved` (boolean), `approved_by` (uuid), `approved_at` (timestamptz), `rejection_reason` (text).
- **User Approvals Table:** Nova tabela `user_approvals` para histórico de auditoria.
- **RPC Functions:**
  - `is_user_approved()`: Verifica status do usuário atual.
  - `approve_user(target_id)`: Aprova um usuário.
  - `reject_user(target_id, reason)`: Rejeita um usuário e remove aprovação.
  - `get_pending_users()`: Lista usuários pendentes para o painel admin.
- **RLS Policies:**
  - `quiz_sessions`: Bloqueado INSERT se não aprovado.
  - `user_approvals`: Visível apenas para managers/admins.

### **2. Frontend & Auth** ✅
- **AuthContext:**
  - Adicionado estado `isApproved` e `approvedLoading`.
  - Atualizado `checkAdminStatus` para buscar aprovação via RPC.
  - Managers e Admins são sempre aprovados automaticamente na lógica do client side.
- **Hooks:**
  - `usePendingUsers`: Busca lista de pendentes.
  - `useApproveUsers`: Ações de aprovar/rejeitar.

### **3. UI Components** ✅
- **ApprovalGuard (`src/components/ApprovalGuard.tsx`):**
  - Componente wrapper que verifica se o usuário está aprovado.
  - Redireciona para `/pending-approval` se falhar.
- **Pending Page (`/pending-approval`):**
  - Tela amigável informando que a conta está em análise.
  - Botão para atualizar status ou sair.
- **Admin Approvals Page (`/admin/approvals`):**
  - Lista de cards com usuários pendentes.
  - Botões de Aprovar ✅ e Rejeitar ❌.
  - Modal de rejeição com campo para motivo obrigatório.
- **Quiz Layout (`/quiz/layout.tsx`):**
  - Protegido com `ApprovalGuard`. Bloqueia acesso a qualquer rota do quiz se não aprovado.

---

## 📋 Fluxo de Uso

### **Novo Usuário:**
1. Usuário acessa `/login` e entra com Google.
2. Conta é criada com `approved = FALSE`.
3. Usuário tenta acessar `/dashboard` (permitido) ou `/quiz` (restrito).
4. Ao acessar `/quiz` -> Redirecionado para `/pending-approval`.
5. Tela mostra "Aguardando Aprovação".

### **Manager/Admin:**
1. Recebe notificação (futuro) ou verifica `/admin/approvals`.
2. Vê lista de usuários pendentes.
3. Clica em **Approve**:
   - Usuário ganha acesso imediato.
   - Registro criado em `user_approvals`.
4. Clica em **Reject**:
   - Preenche motivo.
   - Usuário permanece bloqueado (ou tem acesso revogado se já tinha).
   - Motivo registrado.

---

## 🧪 Testes Realizados

### **1. Teste de Fluxo de Aprovação**
- [x] Usuário cria conta -> Cai na tela de pendência.
- [x] Admin aprova -> Usuário atualiza página e entra no Quiz.

### **2. Teste de Rejeição**
- [x] Admin rejeita com motivo -> Usuário continua na tela de pendência (ou volta para ela).

### **3. Teste de Proteção**
- [x] Tentar acessar `/quiz` direto pela URL -> Redirecionado.
- [x] Tentar acessar `/quiz/results/uuid` direto -> Redirecionado.

---

## 🚀 Melhorias Futuras

1. **Notificações por Email:** Enviar email para admins quando houver novo usuário e para usuário quando aprovado.
2. **Dashboard do Usuário:** Mostrar status de aprovação no dashboard principal.
3. **Auto-Aprovação:** Configurar regras para aprovação automática baseada em domínio de email (ex: `@minhaigreja.com`).

---
**Desenvolvido por:** Antigravity AI
