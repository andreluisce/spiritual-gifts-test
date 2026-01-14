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
  Sparkles
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
      description: t('navigation.descriptions.quiz')
    },
    {
      href: '/admin/settings/general',
      label: t('tabs.general'),
      icon: <Settings className="h-4 w-4" />,
      description: t('navigation.descriptions.general')
    },
    {
      href: '/admin/settings/ai',
      label: t('tabs.ai'),
      icon: <Sparkles className="h-4 w-4" />,
      description: t('navigation.descriptions.ai')
    }
  ]

  const currentPath = pathname.split('/').pop()

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
      <div className="p-2 sm:p-4 m-1 sm:m-4">
        {/* Mobile Header */}
        <div className="block lg:hidden mb-6">
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
                  {t('navigation.categories')}
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
                  {t('status.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t('status.quizQuestions')}</span>
                  <Badge variant="outline">
                    {(() => {
                      const questionsPerGift = settings?.quiz?.questionsPerGift
                      if (typeof questionsPerGift === 'number') {
                        return questionsPerGift
                      }
                      if (typeof questionsPerGift === 'object' && questionsPerGift) {
                        return Object.values(questionsPerGift)[0] || 5
                      }
                      return 0
                    })()} {t('status.perGift')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t('status.registration')}</span>
                  <Badge variant={settings?.general?.enableRegistration ? "default" : "secondary"}>
                    {settings?.general?.enableRegistration ? t('status.enabled') : t('status.disabled')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t('status.aiAnalysis')}</span>
                  <Badge variant={settings?.ai?.showAIButton ? "default" : "secondary"}>
                    {settings?.ai?.showAIButton ? t('status.visible') : t('status.hidden')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{t('status.emailService')}</span>
                  <Badge variant={process.env.RESEND_API_KEY ? "default" : "destructive"}>
                    {process.env.RESEND_API_KEY ? t('status.configured') : t('status.notSet')}
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
    </div>
  )
}
