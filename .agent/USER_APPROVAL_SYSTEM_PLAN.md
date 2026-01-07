# 🔐 Sistema de Aprovação de Usuários - Plano de Implementação

## 🎯 Objetivo

Permitir que qualquer pessoa faça login com Google, mas **apenas usuários aprovados** podem:
- Fazer o teste de dons espirituais
- Ver resultados
- Acessar outras funcionalidades

## 📋 Requisitos

### **Fluxo do Usuário:**
1. ✅ Usuário faz Sign Up/Sign In com Google (sem restrições)
2. ⏳ Usuário vê tela "Aguardando Aprovação"
3. 👤 Manager/Admin aprova o usuário
4. ✅ Usuário recebe acesso completo

### **Fluxo do Manager/Admin:**
1. 📋 Ver lista de usuários pendentes de aprovação
2. ✅ Aprovar usuário (um clique)
3. ❌ Rejeitar usuário (opcional)
4. 📧 Notificar usuário (opcional)

---

## 🏗️ Arquitetura

### **1. Database Schema**

#### **Adicionar campo `approved` na tabela profiles:**
```sql
ALTER TABLE profiles
ADD COLUMN approved BOOLEAN DEFAULT FALSE,
ADD COLUMN approved_by UUID REFERENCES auth.users(id),
ADD COLUMN approved_at TIMESTAMPTZ;
```

#### **Criar tabela de histórico de aprovações:**
```sql
CREATE TABLE user_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES auth.users(id),
  action TEXT CHECK (action IN ('approved', 'rejected')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **RPC Functions:**
```sql
-- Aprovar usuário
CREATE FUNCTION approve_user(p_user_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS JSONB;

-- Rejeitar usuário
CREATE FUNCTION reject_user(p_user_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS JSONB;

-- Listar usuários pendentes
CREATE FUNCTION get_pending_users()
RETURNS TABLE (...);
```

---

### **2. Frontend - Tela de Aguardando Aprovação**

#### **Componente: PendingApprovalPage**
```tsx
// src/app/[locale]/pending-approval/page.tsx
export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>Aguardando Aprovação</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Sua conta foi criada com sucesso!</p>
          <p>Um administrador precisa aprovar seu acesso antes que você possa fazer o teste.</p>
          <p>Você receberá um email quando for aprovado.</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### **Middleware de Aprovação:**
```tsx
// Verificar em todas as rotas protegidas
const { user, approved } = useAuth()

if (user && !approved) {
  router.push('/pending-approval')
}
```

---

### **3. Admin Interface - Gerenciar Aprovações**

#### **Página: /admin/approvals**
```tsx
// src/app/[locale]/admin/approvals/page.tsx
export default function ApprovalsPage() {
  const { pendingUsers } = usePendingUsers()

  return (
    <div>
      <h1>Usuários Pendentes de Aprovação</h1>
      {pendingUsers.map(user => (
        <UserApprovalCard
          user={user}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ))}
    </div>
  )
}
```

---

### **4. AuthContext Updates**

```typescript
interface AuthContextType {
  // Existing
  user: User | null
  isAdmin: boolean
  isManager: boolean

  // NEW
  approved: boolean
  approvedLoading: boolean
}
```

---

## 📝 Implementação Passo a Passo

### **Fase 1: Database (30 min)**
1. ✅ Criar migration para campo `approved`
2. ✅ Criar tabela `user_approvals`
3. ✅ Criar RPC functions
4. ✅ Atualizar RLS policies
5. ✅ Aplicar migrations

### **Fase 2: Backend Hooks (30 min)**
1. ✅ Criar `usePendingUsers` hook
2. ✅ Criar `useApproveUser` hook
3. ✅ Atualizar AuthContext

### **Fase 3: Frontend - Pending Page (30 min)**
1. ✅ Criar página `/pending-approval`
2. ✅ Adicionar middleware de verificação
3. ✅ Atualizar rotas protegidas

### **Fase 4: Admin Interface (1 hora)**
1. ✅ Criar página `/admin/approvals`
2. ✅ Adicionar link na navegação admin
3. ✅ Criar componente de aprovação
4. ✅ Adicionar notificações

### **Fase 5: Testing (30 min)**
1. ✅ Testar fluxo de novo usuário
2. ✅ Testar aprovação
3. ✅ Testar rejeição

---

## 🔒 Segurança

### **RLS Policies:**
- ✅ Apenas managers/admins podem ver usuários pendentes
- ✅ Apenas managers/admins podem aprovar/rejeitar
- ✅ Usuários não aprovados não podem acessar quiz
- ✅ Usuários não aprovados não podem ver resultados

### **Frontend Guards:**
- ✅ Verificar `approved` em todas as rotas protegidas
- ✅ Redirecionar para `/pending-approval` se não aprovado
- ✅ Esconder botões de ações para usuários não aprovados

---

## 🎨 UI/UX

### **Tela de Aguardando Aprovação:**
- 📧 Mensagem clara
- ⏰ Informação de tempo estimado
- 📞 Contato de suporte
- 🔄 Botão de "Verificar Status"

### **Admin - Lista de Pendentes:**
- 📊 Badge com contador de pendentes
- 🔔 Notificação de novos usuários
- ⚡ Aprovação rápida (1 clique)
- 📝 Campo opcional de motivo de rejeição

---

## 📊 Métricas

| Métrica | Valor Estimado |
|---------|----------------|
| **Migrations** | 2 |
| **RPC Functions** | 3 |
| **RLS Policies** | 4 |
| **React Pages** | 2 |
| **Hooks** | 2 |
| **Components** | 3 |
| **Time** | 3-4 horas |

---

## ✅ Checklist

- [ ] Migration: Add `approved` field
- [ ] Migration: Create `user_approvals` table
- [ ] RPC: `approve_user()`
- [ ] RPC: `reject_user()`
- [ ] RPC: `get_pending_users()`
- [ ] RLS: Policies for approvals
- [ ] Hook: `usePendingUsers`
- [ ] Hook: `useApproveUser`
- [ ] AuthContext: Add `approved` field
- [ ] Page: `/pending-approval`
- [ ] Page: `/admin/approvals`
- [ ] Component: `UserApprovalCard`
- [ ] Middleware: Approval check
- [ ] Navigation: Add "Approvals" link
- [ ] Testing: Full flow

---

## 🚀 Próximos Passos

Deseja que eu implemente agora? Posso começar pela Fase 1 (Database).
