'use client'

import { useAuth } from '@/context/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { Link, useRouter, usePathname } from '@/i18n/navigation'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Users,
  BarChart3,
  Database,
  Shield,
  LayoutDashboard,
  ChevronLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAdmin, loading, adminLoading, isManager } = useAuth()
  const { canViewUsers, canManageContent, canEditSettings, canViewAuditLogs } = usePermissions()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('admin')
  const tShared = useTranslations('admin.shared')

  useEffect(() => {
    // Allow both admins and managers
    if (!loading && !adminLoading && (!user || (!isAdmin && !isManager))) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, isManager, loading, adminLoading, router])

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user || (!isAdmin && !isManager)) {
    return null
  }

  const navItems = [
    { href: '/admin', label: t('navigation.dashboard'), icon: LayoutDashboard, show: true },
    { href: '/admin/users', label: t('navigation.users'), icon: Users, show: canViewUsers },
    { href: '/admin/analytics', label: t('navigation.analytics'), icon: BarChart3, show: true },
    { href: '/admin/content', label: t('navigation.content'), icon: Database, show: canManageContent },
    { href: '/admin/settings', label: t('navigation.settings'), icon: Settings, show: canEditSettings },
    { href: '/admin/audit', label: t('navigation.audit'), icon: Shield, show: canViewAuditLogs },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Polished Admin Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 print:hidden shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">

            {/* Left Side: Brand & Links */}
            <div className="flex items-center min-w-0">
              {/* Brand Logo */}
              <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3 mr-2 sm:mr-8">
                <div className="bg-slate-900 p-1.5 rounded-lg shadow-sm">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="font-bold text-slate-800 text-sm sm:text-lg tracking-tight">
                  Admin
                </span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:ml-6 lg:flex lg:space-x-1">
                {navItems.filter(i => i.show).map(item => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 h-full",
                        isActive
                          ? "border-purple-600 text-[#6d28d9] bg-purple-50/50"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <item.icon className={cn("mr-2 h-4 w-4", isActive ? "text-[#7c3aed]" : "text-slate-400")} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right Side: User & Exit */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Role Badges */}
              {isAdmin ? (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hidden lg:flex text-xs">
                  {tShared('roles.administrator')}
                </Badge>
              ) : isManager ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hidden lg:flex text-xs">
                  {tShared('roles.manager')}
                </Badge>
              ) : null}

              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

              {/* Back to App Button */}
              <Link href="/dashboard" className="group flex items-center gap-1.5 sm:gap-2 text-slate-500 hover:text-slate-800 transition-colors">
                <div className="p-1 sm:p-1.5 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors">
                  <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">{t('backToApp')}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation (Scrollable Strip) */}
        <div className="lg:hidden overflow-x-auto border-t border-slate-100 flex items-center gap-2 px-3 h-12 scrollbar-hide bg-slate-50/50">
          {navItems.filter(i => i.show).map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-shrink-0 text-xs sm:text-sm font-medium flex items-center whitespace-nowrap px-2 sm:px-3 py-1.5 rounded-md transition-all",
                  isActive ? "bg-white shadow-sm text-purple-700" : "text-slate-500 hover:bg-white/50"
                )}
              >
                <item.icon className={cn("mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4", isActive ? "text-purple-600" : "text-slate-400")} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 print:p-0 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  )
}