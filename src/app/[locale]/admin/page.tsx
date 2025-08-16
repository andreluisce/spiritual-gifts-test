'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import {
  Users,
  FileText,
  Settings,
  Activity,
  Database,
  TrendingUp,
  UserCheck
} from 'lucide-react'
import { formatScore } from '@/data/quiz-data'
import { useAdminStats, useRecentActivity, useGiftDistribution, useSystemStatus } from '@/hooks/useAdminData'

export default function AdminDashboard() {
  const tStats = useTranslations('admin.dashboard.stats')
  const tActivity = useTranslations('admin.dashboard.recentActivity')
  const tGifts = useTranslations('admin.dashboard.topGifts')
  
  // Fetch real data
  const { stats, loading: statsLoading } = useAdminStats()
  const { activities, loading: activityLoading } = useRecentActivity(5)
  const { distribution: topGifts, loading: giftsLoading } = useGiftDistribution()
  const { loading: systemLoading } = useSystemStatus()

  if (statsLoading || systemLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <FileText className="h-4 w-4" />
      case 'user': return <Users className="h-4 w-4" />
      case 'content': return <Database className="h-4 w-4" />
      case 'system': return <Settings className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'quiz': return 'bg-blue-100 text-blue-600'
      case 'user': return 'bg-green-100 text-green-600'
      case 'content': return 'bg-purple-100 text-purple-600'
      case 'system': return 'bg-orange-100 text-orange-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return `${seconds} seconds ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours ago`
    const days = Math.floor(hours / 24)
    return `${days} days ago`
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tStats('totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
              ) : (
                formatScore(stats?.totalUsers || 0, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              +{formatScore(stats?.newUsersThisMonth || 0, 0)} {tStats('newUsersThisMonth')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tStats('totalQuizzes')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
              ) : (
                formatScore(stats?.totalQuizzes || 0, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              +{formatScore(stats?.completedToday || 0, 0)} {tStats('completedToday')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tStats('averageScore')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
              ) : (
                `${formatScore(stats?.averageScore || 0, 1)}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {tStats('acrossAllAttempts')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tStats('activeUsers')}</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
              ) : (
                formatScore(stats?.activeUsers || 0, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {tStats('activeThisWeek')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-600" />
              {tActivity('title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="animate-pulse flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : activities && activities.length > 0 ? (
                activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.user_name || activity.user_email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {activity.action} • {formatTimeAgo(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  {tActivity('noActivity')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Gifts Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {tGifts('title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {giftsLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="animate-pulse space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2"></div>
                  </div>
                ))
              ) : topGifts.length > 0 ? (
                topGifts.slice(0, 7).map((gift, index) => (
                  <div key={gift.gift_name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">#{index + 1} {gift.gift_name}</span>
                      <span className="text-gray-500">{gift.count} {tGifts('users')}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${gift.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatScore(gift.percentage, 1)}% {tGifts('ofTotal')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {tGifts('noData')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}