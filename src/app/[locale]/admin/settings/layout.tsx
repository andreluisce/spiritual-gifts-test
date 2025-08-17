'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Settings,
  HelpCircle,
  Save,
  ArrowLeft,
  Sparkles,
  Mail
} from 'lucide-react'
import { useSystemSettings } from '@/hooks/useSystemSettings'

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('admin.settings')
  
  const {
    settings,
    loading: settingsLoading,
    updateSettings,
    error
  } = useSystemSettings()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, loading, router])

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  const handleSaveSettings = async () => {
    if (!settings) return
    
    try {
      await updateSettings(settings)
      // Show success toast or notification
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const navItems = [
    {
      href: '/admin/settings/quiz',
      label: t('tabs.quiz'),
      icon: <HelpCircle className="h-4 w-4" />,
      description: 'Configure quiz parameters and questions'
    },
    {
      href: '/admin/settings/general',
      label: t('tabs.general'),
      icon: <Settings className="h-4 w-4" />,
      description: 'General system settings'
    },
    {
      href: '/admin/settings/ai',
      label: 'IA & Análise',
      icon: <Sparkles className="h-4 w-4" />,
      description: 'AI analysis configuration'
    },
    {
      href: '/admin/settings/email',
      label: 'Email & Notificações',
      icon: <Mail className="h-4 w-4" />,
      description: 'Email service configuration using Resend'
    }
  ]

  const currentPath = pathname.split('/').pop()

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Mobile Header */}
      <div className="block lg:hidden mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
        </div>
        <div className="mb-4">
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-sm text-gray-600">{t('subtitle')}</p>
        </div>
        <Button 
          onClick={handleSaveSettings}
          className="w-full flex items-center justify-center gap-2"
          size="lg"
        >
          <Save className="h-4 w-4" />
          {t('saveChanges')}
        </Button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-sm text-gray-600">{t('subtitle')}</p>
          </div>
        </div>
        <Button 
          onClick={handleSaveSettings}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {t('saveChanges')}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700 text-sm">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Settings Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = currentPath === item.href.split('/').pop()
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50",
                        isActive && "bg-blue-50 border-l-2 border-blue-600"
                      )}
                    >
                      <div className={cn(
                        "mt-0.5",
                        isActive ? "text-blue-600" : "text-gray-400"
                      )}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className={cn(
                          "font-medium text-sm",
                          isActive ? "text-blue-900" : "text-gray-900"
                        )}>
                          {item.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Quiz Questions</span>
                <Badge variant="outline">
                  {settings?.quiz?.questionsPerGift || 0} per gift
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Registration</span>
                <Badge variant={settings?.general?.enableRegistration ? "default" : "secondary"}>
                  {settings?.general?.enableRegistration ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">AI Analysis</span>
                <Badge variant={settings?.ai?.showAIButton ? "default" : "secondary"}>
                  {settings?.ai?.showAIButton ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Email Service</span>
                <Badge variant={process.env.RESEND_API_KEY ? "default" : "destructive"}>
                  {process.env.RESEND_API_KEY ? 'Configured' : 'Not Set'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  )
}