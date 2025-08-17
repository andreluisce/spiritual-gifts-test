'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { BarChart3, Brain, Users, FileText } from 'lucide-react'

const tabs = [
  {
    key: 'overview',
    href: '/admin/analytics/overview',
    icon: BarChart3,
    translationKey: 'tabs.overview'
  },
  {
    key: 'spiritual-gifts',
    href: '/admin/analytics/spiritual-gifts', 
    icon: Brain,
    translationKey: 'tabs.spiritualGifts'
  },
  {
    key: 'demographics',
    href: '/admin/analytics/demographics',
    icon: Users,
    translationKey: 'tabs.demographics'
  },
  {
    key: 'reports',
    href: '/admin/analytics/reports',
    icon: FileText,
    translationKey: 'tabs.reports'
  }
]

export default function AnalyticsNavigation() {
  const t = useTranslations('admin.analytics')
  const pathname = usePathname()

  return (
    <nav className="flex overflow-x-auto scrollbar-hide space-x-1 border-b border-gray-200 mb-6 pb-0">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = pathname === tab.href || pathname.endsWith(tab.href)
        
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={cn(
              'flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap flex-shrink-0',
              isActive
                ? 'text-blue-600 border-blue-600 bg-blue-50'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t(tab.translationKey)}</span>
            <span className="sm:hidden">{t(tab.translationKey).split(' ')[0]}</span>
          </Link>
        )
      })}
    </nav>
  )
}