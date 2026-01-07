# 🔐 Guia: Como Promover Usuários a Admin ou Manager

## 📋 Índice
1. [Via SQL (Mais Rápido)](#via-sql)
2. [Via RPC Function (Recomendado para Admins)](#via-rpc-function)
3. [Via Interface Admin (Futuro)](#via-interface-admin)

---

## 1️⃣ Via SQL (Mais Rápido) {#via-sql}

### **Opção A: Usando Supabase Dashboard**

1. Acesse: https://supabase.com/dashboard/project/vttkurdzstlkybojigry/editor
2. Vá em **SQL Editor**
3. Execute um dos comandos abaixo:

#### **Promover para ADMIN:**
```sql
-- Substitua 'user@email.com' pelo email do usuário
UPDATE profiles
SET
  role = 'admin',
  permissions = '["analytics", "users_read", "users_write", "system_admin"]'::jsonb
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'user@email.com'
);
```

#### **Promover para MANAGER:**
```sql
-- Substitua 'user@email.com' pelo email do usuário
UPDATE profiles
SET
  role = 'manager',
  permissions = '["analytics", "users_read"]'::jsonb
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'user@email.com'
);
```

#### **Rebaixar para USER:**
```sql
-- Substitua 'user@email.com' pelo email do usuário
UPDATE profiles
SET
  role = 'user',
  permissions = '[]'::jsonb
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'user@email.com'
);
```

### **Opção B: Usando Supabase CLI Local**

```bash
# No terminal do projeto
supabase db execute --sql "
UPDATE profiles
SET
  role = 'admin',
  permissions = '[\"analytics\", \"users_read\", \"users_write\", \"system_admin\"]'::jsonb
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'user@email.com'
);
"
```

---

## 2️⃣ Via RPC Function (Recomendado para Admins) {#via-rpc-function}

### **Usar a função `admin_update_user`**

Esta função já existe e só pode ser chamada por admins.

#### **No Supabase Dashboard SQL Editor:**
```sql
-- Promover para Admin
SELECT admin_update_user(
  p_user_id := (SELECT id FROM auth.users WHERE email = 'user@email.com'),
  p_role := 'admin'::user_role_type
);

-- Promover para Manager
SELECT admin_update_user(
  p_user_id := (SELECT id FROM auth.users WHERE email = 'user@email.com'),
  p_role := 'manager'::user_role_type
);
```

#### **No Frontend (JavaScript/TypeScript):**
```typescript
// Exemplo de uso no código
const { data, error } = await supabase.rpc('admin_update_user', {
  p_user_id: 'uuid-do-usuario',
  p_role: 'manager' // ou 'admin'
})

if (error) {
  console.error('Erro ao promover usuário:', error)
} else {
  console.log('Usuário promovido com sucesso!', data)
}
```

---

## 3️⃣ Via Interface Admin (Futuro - A Implementar) {#via-interface-admin}

### **Página de Gerenciamento de Usuários**

Quando implementarmos a UI completa, você poderá:

1. Ir em `/admin/users`
2. Clicar no usuário
3. Selecionar o role no dropdown
4. Clicar em "Salvar"

**Código de exemplo para implementar:**

```tsx
// src/app/[locale]/admin/users/page.tsx
import { usePermissions } from '@/hooks/usePermissions'

export default function UsersPage() {
  const { canEditUsers } = usePermissions()

  const handleRoleChange = async (userId: string, newRole: 'user' | 'manager' | 'admin') => {
    const { data, error } = await supabase.rpc('admin_update_user', {
      p_user_id: userId,
      p_role: newRole
    })

    if (!error) {
      toast.success('Role atualizado com sucesso!')
    }
  }

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <span>{user.email}</span>
          {canEditUsers && (
            <select
              value={user.role}
              onChange={(e) => handleRoleChange(user.id, e.target.value)}
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          )}
        </div>
      ))}
    </div>
  )
}
```

---

## 🔍 Verificar Role de um Usuário

### **Via SQL:**
```sql
SELECT
  u.email,
  p.role,
  p.permissions
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'user@email.com';
```

### **Via RPC:**
```sql
-- Verificar seu próprio role
SELECT get_user_role();

-- Verificar suas permissões
SELECT get_user_permissions();
```

### **No Frontend:**
```typescript
const { userRole, permissions, isAdmin, isManager } = useAuth()

console.log('Role:', userRole)
console.log('Permissions:', permissions)
console.log('Is Admin:', isAdmin)
console.log('Is Manager:', isManager)
```

---

## 📊 Listar Todos os Usuários e seus Roles

```sql
SELECT
  u.email,
  p.role,
  p.permissions,
  p.created_at,
  p.last_login
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY p.role DESC, u.email;
```

---

## ⚠️ Importante: Segurança

### **Quem pode promover usuários?**

1. **Via SQL/Dashboard**: Qualquer pessoa com acesso ao Supabase Dashboard (você)
2. **Via RPC `admin_update_user`**: Apenas usuários com role = 'admin'
3. **Via Interface Admin**: Apenas usuários com role = 'admin' (quando implementado)

### **Proteções Implementadas:**

- ✅ RLS policies impedem managers de editar roles
- ✅ RPC function `admin_update_user` verifica `is_user_admin_safe()`
- ✅ Frontend usa `<PermissionGuard permission="users_write">` para esconder botões

---

## 🚀 Exemplo Prático: Promover Primeiro Manager

### **Passo a Passo:**

1. **Identifique o email do usuário:**
   ```sql
   SELECT id, email FROM auth.users;
   ```

2. **Promova para Manager:**
   ```sql
   UPDATE profiles
   SET
     role = 'manager',
     permissions = '["analytics", "users_read"]'::jsonb
   WHERE id = 'cole-o-uuid-aqui';
   ```

3. **Verifique:**
   ```sql
   SELECT
     u.email,
     p.role,
     p.permissions
   FROM auth.users u
   LEFT JOIN profiles p ON p.id = u.id
   WHERE p.role IN ('admin', 'manager');
   ```

4. **Teste no Frontend:**
   - Faça logout
   - Faça login com o usuário promovido
   - Acesse `/admin`
   - Verifique o badge "Manager" no header

---

## 🎯 Resumo Rápido

| Método | Velocidade | Segurança | Quando Usar |
|--------|-----------|-----------|-------------|
| **SQL Dashboard** | ⚡ Instantâneo | 🔒 Requer acesso ao Dashboard | Setup inicial, emergências |
| **RPC Function** | ⚡ Rápido | 🔒🔒 Requer ser admin | Operação normal, via código |
| **Interface Admin** | 🐌 Depende da UI | 🔒🔒 Requer ser admin | Uso diário (quando implementado) |

---

## 📝 Próximos Passos

Para implementar a interface de gerenciamento de usuários:

1. Criar página `/admin/users` com lista de usuários
2. Adicionar dropdown de role para cada usuário
3. Usar `admin_update_user` RPC para salvar mudanças
4. Adicionar confirmação antes de promover/rebaixar
5. Mostrar histórico de mudanças de role (futuro)

**Quer que eu implemente a interface de gerenciamento de usuários agora?** 🚀
