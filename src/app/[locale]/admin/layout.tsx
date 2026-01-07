'use client'

import { useAuth } from '@/context/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { useRouter } from '@/i18n/navigation'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Users,
  BarChart3,
  Home,
  ArrowLeft,
  Database,
  Shield,
  Crown
} from 'lucide-react'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAdmin, loading, adminLoading, userRole, isManager } = useAuth()
  const { canViewUsers, canManageContent, canEditSettings, canViewAuditLogs } = usePermissions()
  const router = useRouter()
  const t = useTranslations('admin')

  useEffect(() => {
    // Allow both admins and managers
    if (!loading && !adminLoading && (!user || (!isAdmin && !isManager))) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, isManager, loading, adminLoading, router])

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || (!isAdmin && !isManager)) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="h-7 w-7 text-blue-600" />
                {t('title')}
              </h1>
              <p className="text-gray-600 text-sm">
                {t('subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-gray-50 border-gray-300">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t('backToApp')}</span>
                <span className="sm:hidden">App</span>
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              {/* Role Badge */}
              {isAdmin ? (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  <span className="hidden sm:inline">Administrator</span>
                  <span className="sm:hidden">Admin</span>
                </Badge>
              ) : isManager ? (
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span className="hidden sm:inline">Manager</span>
                  <span className="sm:hidden">Mgr</span>
                </Badge>
              ) : null}
              <div className="text-sm text-gray-600 hidden md:block">
                {user.user_metadata?.full_name || user.email}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">{t('navigation.dashboard')}</span>
              <span className="sm:hidden">Home</span>
            </Button>
          </Link>

          {/* Users - Visible to managers and admins */}
          {canViewUsers && (
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">{t('navigation.users')}</span>
                <span className="sm:hidden">Users</span>
              </Button>
            </Link>
          )}

          {/* Analytics - Visible to managers and admins */}
          <Link href="/admin/analytics">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('navigation.analytics')}</span>
              <span className="sm:hidden">Analytics</span>
            </Button>
          </Link>

          {/* Content - Admin only */}
          {canManageContent && (
            <Link href="/admin/content">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">{t('navigation.content')}</span>
                <span className="sm:hidden">Content</span>
              </Button>
            </Link>
          )}

          {/* Settings - Admin only */}
          {canEditSettings && (
            <Link href="/admin/settings">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">{t('navigation.settings')}</span>
                <span className="sm:hidden">Settings</span>
              </Button>
            </Link>
          )}

          {/* Audit - Admin only */}
          {canViewAuditLogs && (
            <Link href="/admin/audit">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">{t('navigation.audit')}</span>
                <span className="sm:hidden">Audit</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}