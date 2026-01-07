/**
 * Permission Guard Components
 *
 * Components to conditionally render content based on user permissions and roles.
 *
 * @example
 * ```tsx
 * <PermissionGuard permission="users_write">
 *   <Button>Delete User</Button>
 * </PermissionGuard>
 *
 * <RoleGuard roles={['admin', 'manager']}>
 *   <AdminPanel />
 * </RoleGuard>
 * ```
 */

import { useAuth } from '@/context/AuthContext'
import { ReactNode } from 'react'

interface PermissionGuardProps {
    permission: string
    fallback?: ReactNode
    children: ReactNode
}

/**
 * PermissionGuard - Renders children only if user has the specified permission
 */
export function PermissionGuard({
    permission,
    fallback = null,
    children
}: PermissionGuardProps) {
    const { hasPermission } = useAuth()

    return hasPermission(permission) ? <>{children}</> : <>{fallback}</>
}

interface RoleGuardProps {
    roles: Array<'user' | 'manager' | 'admin'>
    fallback?: ReactNode
    children: ReactNode
}

/**
 * RoleGuard - Renders children only if user has one of the specified roles
 */
export function RoleGuard({
    roles,
    fallback = null,
    children
}: RoleGuardProps) {
    const { userRole } = useAuth()

    return roles.includes(userRole || 'user') ? <>{children}</> : <>{fallback}</>
}

interface AdminOnlyProps {
    fallback?: ReactNode
    children: ReactNode
}

/**
 * AdminOnly - Renders children only if user is admin
 */
export function AdminOnly({ fallback = null, children }: AdminOnlyProps) {
    const { isAdmin } = useAuth()

    return isAdmin ? <>{children}</> : <>{fallback}</>
}

interface ManagerOrAdminProps {
    fallback?: ReactNode
    children: ReactNode
}

/**
 * ManagerOrAdmin - Renders children only if user is manager or admin
 */
export function ManagerOrAdmin({ fallback = null, children }: ManagerOrAdminProps) {
    const { isManager } = useAuth()

    return isManager ? <>{children}</> : <>{fallback}</>
}
