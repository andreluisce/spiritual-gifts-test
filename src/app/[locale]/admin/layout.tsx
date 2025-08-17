'use client'

import { useAuth } from '@/context/AuthContext'
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
  Shield
} from 'lucide-react'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const t = useTranslations('admin')

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
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
              <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                {t('adminAccess')}
              </Badge>
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
          <Link href="/admin/users">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t('navigation.users')}</span>
              <span className="sm:hidden">Users</span>
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('navigation.analytics')}</span>
              <span className="sm:hidden">Analytics</span>
            </Button>
          </Link>
          <Link href="/admin/content">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">{t('navigation.content')}</span>
              <span className="sm:hidden">Content</span>
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{t('navigation.settings')}</span>
              <span className="sm:hidden">Settings</span>
            </Button>
          </Link>
          <Link href="/admin/audit">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{t('navigation.audit')}</span>
              <span className="sm:hidden">Audit</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}