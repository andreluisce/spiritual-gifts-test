/**
 * usePermissions Hook
 *
 * Provides granular permission checks for the Manager role system.
 *
 * @example
 * ```tsx
 * const { canViewAnalytics, canEditUsers, isAdmin } = usePermissions()
 *
 * if (canViewAnalytics) {
 *   // Show analytics
 * }
 * ```
 */

import { useAuth } from '@/context/AuthContext'

export interface Permissions {
    // View permissions
    canViewAnalytics: boolean
    canViewUsers: boolean
    canViewSettings: boolean

    // Write permissions
    canEditUsers: boolean
    canDeleteUsers: boolean

    // Admin permissions
    canEditSettings: boolean
    canManageContent: boolean
    canViewAuditLogs: boolean
    canManageTranslations: boolean

    // Role checks
    isAdmin: boolean
    isManager: boolean
    isManagerOrAdmin: boolean

    // Raw data
    userRole: 'user' | 'manager' | 'admin' | null
    permissions: string[]
}

export function usePermissions(): Permissions {
    const { userRole, hasPermission, isAdmin, isManager } = useAuth()

    return {
        // View permissions
        canViewAnalytics: hasPermission('analytics'),
        canViewUsers: hasPermission('users_read'),
        canViewSettings: hasPermission('analytics') || hasPermission('system_admin'),

        // Write permissions
        canEditUsers: hasPermission('users_write'),
        canDeleteUsers: hasPermission('users_write'),

        // Admin permissions
        canEditSettings: hasPermission('system_admin'),
        canManageContent: hasPermission('system_admin'),
        canViewAuditLogs: hasPermission('system_admin'),
        canManageTranslations: hasPermission('system_admin'),

        // Role checks
        isAdmin,
        isManager,
        isManagerOrAdmin: isManager || isAdmin,

        // Raw data
        userRole,
        permissions: useAuth().permissions,
    }
}
