# 🎯 Implementação de Role "Manager" - Plano Detalhado

## Objetivo
Criar sistema de permissões granular com novo role "Manager" que tem acesso a analytics/visualização mas sem permissões críticas.

---

## 📊 Estrutura de Permissões

### Roles Disponíveis
```typescript
type UserRole = 'user' | 'manager' | 'admin'
```

### Grupos de Permissões
```typescript
type PermissionGroup =
  | 'analytics'      // View analytics, reports, demographics
  | 'users_read'     // View users (read-only)
  | 'users_write'    // Edit/delete users
  | 'system_admin'   // Settings, content, translations, audit
```

### Matriz de Permissões

| Permissão      | User | Manager | Admin |
|----------------|------|---------|-------|
| analytics      | ❌    | ✅       | ✅     |
| users_read     | ❌    | ✅       | ✅     |
| users_write    | ❌    | ❌       | ✅     |
| system_admin   | ❌    | ❌       | ✅     |

---

## 🗂️ Fase 1: Database Schema (2-3 horas)

### Migration 1: Create User Roles ENUM
**Arquivo:** `supabase/migrations/20260107_create_user_roles.sql`

```sql
-- Create ENUM for user roles
CREATE TYPE user_role_type AS ENUM ('user', 'manager', 'admin');

-- Add permissions column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role_new user_role_type DEFAULT 'user',
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

-- Migrate existing admin users
UPDATE profiles
SET
  role_new = 'admin',
  permissions = '["analytics", "users_read", "users_write", "system_admin"]'::jsonb
WHERE role = 'admin' OR
      (raw_user_meta_data->>'role')::text = 'admin' OR
      (raw_user_meta_data->>'is_admin')::boolean = true;

-- Drop old role column and rename new one
ALTER TABLE profiles DROP COLUMN IF EXISTS role;
ALTER TABLE profiles RENAME COLUMN role_new TO role;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_permissions ON profiles USING gin(permissions);

COMMENT ON COLUMN profiles.role IS 'User role: user, manager, or admin';
COMMENT ON COLUMN profiles.permissions IS 'Array of permission groups: analytics, users_read, users_write, system_admin';
```

### Migration 2: Permission Check Functions
**Arquivo:** `supabase/migrations/20260107_create_permission_functions.sql`

```sql
-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role_type
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_role user_role_type;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN 'user'::user_role_type;
  END IF;

  -- Get role from profiles
  SELECT role INTO v_role
  FROM profiles
  WHERE user_id = v_user_id;

  RETURN COALESCE(v_role, 'user'::user_role_type);
END;
$$;

-- Check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(p_permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_permissions JSONB;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get user permissions
  SELECT permissions INTO v_permissions
  FROM profiles
  WHERE user_id = v_user_id;

  -- Check if permission exists in array
  RETURN v_permissions ? p_permission;
END;
$$;

-- Check if user is manager or admin
CREATE OR REPLACE FUNCTION public.is_user_manager()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role_type;
BEGIN
  v_role := get_user_role();
  RETURN v_role IN ('manager', 'admin');
END;
$$;

-- Update is_user_admin_safe to use new role system
CREATE OR REPLACE FUNCTION public.is_user_admin_safe()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role_type;
BEGIN
  v_role := get_user_role();
  RETURN v_role = 'admin';
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_manager() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin_safe() TO authenticated;
```

### Migration 3: Update RLS Policies
**Arquivo:** `supabase/migrations/20260107_update_rls_for_managers.sql`

```sql
-- Allow managers to view analytics data
DROP POLICY IF EXISTS "Managers can view analytics" ON quiz_sessions;
CREATE POLICY "Managers can view analytics"
  ON quiz_sessions FOR SELECT
  USING (is_user_manager());

-- Allow managers to view user stats (but not edit)
DROP POLICY IF EXISTS "Managers can view users" ON profiles;
CREATE POLICY "Managers can view users"
  ON profiles FOR SELECT
  USING (is_user_manager());

-- Only admins can update/delete users
DROP POLICY IF EXISTS "Only admins can update users" ON profiles;
CREATE POLICY "Only admins can update users"
  ON profiles FOR UPDATE
  USING (is_user_admin_safe());

DROP POLICY IF EXISTS "Only admins can delete users" ON profiles;
CREATE POLICY "Only admins can delete users"
  ON profiles FOR DELETE
  USING (is_user_admin_safe());

-- System settings: managers can view, only admins can edit
DROP POLICY IF EXISTS "Managers can view settings" ON system_settings;
CREATE POLICY "Managers can view settings"
  ON system_settings FOR SELECT
  USING (is_user_manager());

DROP POLICY IF EXISTS "Only admins can edit settings" ON system_settings;
CREATE POLICY "Only admins can edit settings"
  ON system_settings FOR UPDATE
  USING (is_user_admin_safe());
```

---

## 🔧 Fase 2: Backend RPC Functions (2-3 horas)

### Update Admin RPC Functions
**Arquivo:** `supabase/migrations/20260107_update_admin_rpc_functions.sql`

```sql
-- Manager-safe version of get_users_with_stats (without sensitive data)
CREATE OR REPLACE FUNCTION public.manager_get_users_with_stats()
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  email_masked TEXT,  -- Only show first 3 chars + domain
  created_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  quiz_count BIGINT,
  role user_role_type
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is at least manager
  IF NOT is_user_manager() THEN
    RAISE EXCEPTION 'Manager or Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    p.user_id,
    COALESCE(p.display_name, 'Unknown') as display_name,
    -- Mask email: show first 3 chars + @domain
    CASE
      WHEN u.email IS NOT NULL THEN
        substring(u.email from 1 for 3) || '***@' || split_part(u.email, '@', 2)
      ELSE 'hidden@email.com'
    END as email_masked,
    p.created_at,
    p.last_login,
    COUNT(qs.id) as quiz_count,
    p.role
  FROM profiles p
  LEFT JOIN auth.users u ON u.id = p.user_id
  LEFT JOIN quiz_sessions qs ON qs.user_id = p.user_id
  GROUP BY p.user_id, p.display_name, u.email, p.created_at, p.last_login, p.role
  ORDER BY p.created_at DESC;
END;
$$;

-- Keep admin version with full data
-- (existing get_users_with_stats remains unchanged for admins)

GRANT EXECUTE ON FUNCTION public.manager_get_users_with_stats() TO authenticated;
```

---

## ⚛️ Fase 3: Frontend Core (3-4 horas)

### 3.1 Update AuthContext
**Arquivo:** `src/context/AuthContext.tsx`

```typescript
// Add to AuthContextType
export interface AuthContextType {
  // ... existing fields
  userRole: 'user' | 'manager' | 'admin' | null
  isManager: boolean
  hasPermission: (permission: string) => boolean
  permissions: string[]
}

// Add to AuthProvider
const [userRole, setUserRole] = useState<'user' | 'manager' | 'admin' | null>(null)
const [permissions, setPermissions] = useState<string[]>([])

// Fetch role and permissions
useEffect(() => {
  if (user) {
    supabase.rpc('get_user_role').then(({ data }) => {
      setUserRole(data)
    })

    // Get permissions from profile
    supabase
      .from('profiles')
      .select('permissions')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setPermissions(data?.permissions || [])
      })
  }
}, [user])

const hasPermission = useCallback((permission: string) => {
  return permissions.includes(permission)
}, [permissions])

const isManager = userRole === 'manager' || userRole === 'admin'
```

### 3.2 Create usePermissions Hook
**Arquivo:** `src/hooks/usePermissions.ts`

```typescript
import { useAuth } from '@/context/AuthContext'

export function usePermissions() {
  const { userRole, hasPermission } = useAuth()

  return {
    // View permissions
    canViewAnalytics: hasPermission('analytics'),
    canViewUsers: hasPermission('users_read'),

    // Write permissions
    canEditUsers: hasPermission('users_write'),
    canDeleteUsers: hasPermission('users_write'),

    // Admin permissions
    canEditSettings: hasPermission('system_admin'),
    canManageContent: hasPermission('system_admin'),
    canViewAuditLogs: hasPermission('system_admin'),
    canManageTranslations: hasPermission('system_admin'),

    // Role checks
    isAdmin: userRole === 'admin',
    isManager: userRole === 'manager',
    isManagerOrAdmin: ['manager', 'admin'].includes(userRole || ''),
  }
}
```

### 3.3 Create PermissionGuard Component
**Arquivo:** `src/components/PermissionGuard.tsx`

```typescript
import { useAuth } from '@/context/AuthContext'
import { ReactNode } from 'react'

interface PermissionGuardProps {
  permission: string
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGuard({
  permission,
  fallback = null,
  children
}: PermissionGuardProps) {
  const { hasPermission } = useAuth()

  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>
}

// Role-based guard
interface RoleGuardProps {
  roles: Array<'user' | 'manager' | 'admin'>
  fallback?: ReactNode
  children: ReactNode
}

export function RoleGuard({ roles, fallback = null, children }: RoleGuardProps) {
  const { userRole } = useAuth()

  return roles.includes(userRole || 'user') ? <>{children}</> : <>{fallback}</>
}
```

---

## 🎨 Fase 4: UI/UX Updates (4-5 horas)

### 4.1 Update Admin Layout
**Arquivo:** `src/app/[locale]/admin/layout.tsx`

```typescript
// Change access check
if (!loading && !adminLoading && (!user || !(isAdmin || isManager))) {
  router.push('/dashboard')
}

// Add role badge
<Badge variant={isAdmin ? "destructive" : "default"}>
  {isAdmin ? "Admin" : "Manager"}
</Badge>

// Filter navigation based on permissions
const navItems = [
  { href: '/admin', label: 'Dashboard', permission: 'analytics' },
  { href: '/admin/analytics', label: 'Analytics', permission: 'analytics' },
  { href: '/admin/users', label: 'Users', permission: 'users_read' },
  { href: '/admin/settings', label: 'Settings', permission: 'system_admin' },
  { href: '/admin/content', label: 'Content', permission: 'system_admin' },
].filter(item => hasPermission(item.permission))
```

### 4.2 Update User Management Page
**Arquivo:** `src/app/[locale]/admin/users/page.tsx`

```typescript
const { canEditUsers, canDeleteUsers } = usePermissions()

// Use different RPC for managers
const { users } = canEditUsers
  ? useAdminUsers()  // Full data
  : useManagerUsers() // Masked emails

// Conditionally show action buttons
<PermissionGuard permission="users_write">
  <Button onClick={handleDelete}>Delete</Button>
</PermissionGuard>
```

---

## 📝 Fase 5: Documentation (1-2 horas)

### Create ROLE_PERMISSIONS.md
- Document all permissions
- How to assign roles
- Security considerations

---

## ✅ Checklist de Implementação

- [ ] Migration 1: Create roles ENUM and permissions column
- [ ] Migration 2: Create permission check functions
- [ ] Migration 3: Update RLS policies
- [ ] Migration 4: Update admin RPC functions
- [ ] Update AuthContext with role/permissions
- [ ] Create usePermissions hook
- [ ] Create PermissionGuard components
- [ ] Update admin layout
- [ ] Update user management page
- [ ] Update other admin pages
- [ ] Test manager access
- [ ] Test admin access still works
- [ ] Document permissions system

---

## 🚀 Ordem de Execução

1. ✅ Criar e aplicar migrations (database schema)
2. ✅ Testar RPC functions no Supabase
3. ✅ Atualizar AuthContext
4. ✅ Criar hooks e components
5. ✅ Atualizar admin layout
6. ✅ Atualizar páginas individuais
7. ✅ Testar end-to-end
8. ✅ Documentar

**Estimativa total: 12-16 horas**
