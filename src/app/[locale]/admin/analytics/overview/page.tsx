'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  FileText,
  Download,
  Globe,
  Brain,
  BarChart3
} from 'lucide-react'
import { formatScore, formatPercentage } from '@/data/quiz-data'
import { 
  useAnalyticsData, 
  useAdminStats
} from '@/hooks/useAdminData'
import AnalyticsNavigation from '@/components/AnalyticsNavigation'

type DateRange = '7d' | '30d' | '90d' | '1y'

export default function AnalyticsOverviewPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const t = useTranslations('admin.analytics')
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  
  // Fetch real data
  const { analytics: realAnalytics, loading: analyticsLoading } = useAnalyticsData(dateRange)
  const { stats: realStats, loading: statsLoading } = useAdminStats()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, loading, router])

  if (loading || analyticsLoading || statsLoading) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('tabs.overview')}</h1>
          <p className="text-gray-600 mt-1">
            {t('overview.subtitle')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-3 py-2 border rounded-md text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap"
          >
            <option value="7d">{t('dateRange.7d')}</option>
            <option value="30d">{t('dateRange.30d')}</option>
            <option value="90d">{t('dateRange.90d')}</option>
            <option value="1y">{t('dateRange.1y')}</option>
          </select>
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('exportData')}</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <AnalyticsNavigation />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('overview.totalQuizzes')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((realAnalytics?.overview as { totalQuizzes?: number })?.totalQuizzes || (realStats as { totalQuizzes?: number })?.totalQuizzes || 0).toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              {t('overview.totalCompleted')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('overview.avgCompletionTime')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatScore((realAnalytics?.overview as { avgCompletionTime?: number })?.avgCompletionTime || 0, 1)} min</div>
            <p className="text-xs text-muted-foreground">
              {t('overview.optimalEngagement')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('overview.averageScore')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatScore((realAnalytics?.overview as { avgScore?: number })?.avgScore || (realStats as { averageScore?: number })?.averageScore || 0, 1)}</div>
            <p className="text-xs text-muted-foreground">
              {t('overview.outOfPossible')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('overview.completionRate')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage((realAnalytics?.overview as { completionRate?: number })?.completionRate || 0, 1)}</div>
            <p className="text-xs text-muted-foreground">
              {t('overview.usersComplete')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('overview.returningUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage((realAnalytics?.overview as { returningUsers?: number })?.returningUsers || 0, 1)}</div>
            <p className="text-xs text-muted-foreground">
              {t('overview.retentionRate')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('overview.mobileUsers')}</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage((realAnalytics?.overview as { mobileUsers?: number })?.mobileUsers || 0, 1)}</div>
            <p className="text-xs text-muted-foreground">
              {t('overview.viaMobile')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real Analytics Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('overview.analyticsTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t('overview.analyticsDescription')}</p>
            <p className="text-xs text-gray-400 mt-2">{t('overview.chartsComingSoon')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Real Growth Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('overview.totalUsersCard')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{realStats?.totalUsers?.toLocaleString() || '0'}</p>
                <p className="text-sm text-gray-500">{t('overview.registeredUsers')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('overview.activeUsersCard')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{realStats?.activeUsers?.toLocaleString() || '0'}</p>
                <p className="text-sm text-gray-500">{t('overview.haveCompleted')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('overview.mostPopularGift')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-lg font-bold text-purple-600">{realStats?.mostPopularGift || 'N/A'}</p>
                <p className="text-sm text-gray-500">{t('overview.topSpiritualGift')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}