'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  UserPlus,
  Shield,
  Crown,
  UserCheck,
  UserX,
} from 'lucide-react'
import { useUsersWithStats, useAdminStats } from '@/hooks/useAdminData'
import { useTranslations } from 'next-intl'
import { usePermissions } from '@/hooks/usePermissions'

export default function AdminUsersOverviewPage() {
  const { user, isAdmin, isManager, loading } = useAuth()
  const { canViewUsers } = usePermissions()
  const router = useRouter()
  const t = useTranslations('admin')

  // Fetch specific data for overview
  const { stats, loading: statsLoading } = useAdminStats()
  const { users, loading: usersLoading } = useUsersWithStats()

  useEffect(() => {
    const allowed = isAdmin || isManager || canViewUsers
    if (!loading && (!user || !allowed)) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, isManager, canViewUsers, loading, router])

  if (loading || statsLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !(isAdmin || isManager || canViewUsers)) return null

  const statsData = stats || {
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    newUsersThisMonth: 0,
    suspendedUsers: 0
  }

  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <Crown className="h-4 w-4" />
    if (role === 'manager') return <Shield className="h-4 w-4" />
    return <Users className="h-4 w-4" />
  }

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('users.stats.totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('users.stats.allRegistered')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('users.stats.activeUsers')}</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {statsData.totalUsers > 0
                ? t('users.stats.percentTotal', { percent: ((statsData.activeUsers / statsData.totalUsers) * 100).toFixed(1) })
                : t('users.stats.percentTotal', { percent: '0' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('users.stats.administrators')}</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.adminUsers}</div>
            <p className="text-xs text-muted-foreground">
              {t('users.stats.adminPrivileges')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('users.stats.newThisMonth')}</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.newUsersThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              {t('users.stats.fromLastMonth', { percent: '+12' })} {/* TODO: Calculate actual growth */}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('users.stats.suspended')}</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(statsData as unknown as { suspendedUsers?: number }).suspendedUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('users.stats.requireAttention')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>{t('users.recentRegistrations')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gray-50">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">
                    {(user.user_metadata?.name || (user.email ? user.email.split('@')[0] : '') || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.user_metadata?.name || (user.email ? user.email.split('@')[0] : '') || t('users.unknown')}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
                    {getRoleIcon(user.user_metadata?.role || 'user')}
                    {user.user_metadata?.role || 'user'}
                  </Badge>
                  <Badge className={`${getUserStatusColor(user.status)} whitespace-nowrap`}>
                    {user.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

}
