'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Activity,
    Clock,
    UserCheck,
    TrendingUp,
    BarChart3,
    Download,
    Filter,
    Calendar,
    Shield,
    UserX,
    FileText,
    CheckCircle,
    Edit,
    UserPlus,
    Mail
} from 'lucide-react'
import { useUserActivities, useActivityStats } from '@/hooks/useUserActivity'
import { usePermissions } from '@/hooks/usePermissions'

export default function AdminUsersActivityPage() {
    const { user, isAdmin, isManager, loading } = useAuth()
    const { canViewUsers } = usePermissions()
    const router = useRouter()

    const { activities, loading: activitiesLoading } = useUserActivities(100)
    const { stats: activityStats, loading: activityStatsLoading } = useActivityStats()

    useEffect(() => {
        const allowed = isAdmin || isManager || canViewUsers
        if (!loading && (!user || !allowed)) {
            router.push('/dashboard')
        }
    }, [user, isAdmin, isManager, canViewUsers, loading, router])

    if (loading || activitiesLoading || activityStatsLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!user || !(isAdmin || isManager || canViewUsers)) return null

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'login': return <UserCheck className="h-4 w-4" />
            case 'logout': return <UserX className="h-4 w-4" />
            case 'quiz_start': return <FileText className="h-4 w-4" />
            case 'quiz_complete': return <CheckCircle className="h-4 w-4" />
            case 'profile_update': return <Edit className="h-4 w-4" />
            case 'password_change': return <Shield className="h-4 w-4" />
            case 'account_created': return <UserPlus className="h-4 w-4" />
            case 'email_verified': return <Mail className="h-4 w-4" />
            default: return <Activity className="h-4 w-4" />
        }
    }

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'login': return 'bg-green-100 text-green-600'
            case 'logout': return 'bg-gray-100 text-gray-600'
            case 'quiz_start': return 'bg-blue-100 text-blue-600'
            case 'quiz_complete': return 'bg-purple-100 text-purple-600'
            case 'profile_update': return 'bg-yellow-100 text-yellow-600'
            case 'password_change': return 'bg-orange-100 text-orange-600'
            case 'account_created': return 'bg-teal-100 text-teal-600'
            case 'email_verified': return 'bg-indigo-100 text-indigo-600'
            default: return 'bg-gray-100 text-gray-600'
        }
    }

    const formatActivityTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
        return `${Math.floor(diffInSeconds / 86400)}d ago`
    }

    return (
        <div className="space-y-6">
            {/* Activity Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {activityStatsLoading ? '...' : activityStats?.totalActivities.toLocaleString() || '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            All user activities tracked
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today&apos;s Activities</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {activityStatsLoading ? '...' : activityStats?.todayActivities.toLocaleString() || '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Activities in the last 24h
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {activityStatsLoading ? '...' : activityStats?.activeUsers.toLocaleString() || '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Users with recent activity
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Activity</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {activityStatsLoading ? '...' : activityStats?.topActivities[0]?.type.replace('_', ' ') || 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Most frequent activity type
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Activity Log */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Recent Activity Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activitiesLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            </div>
                        ) : activities.length > 0 ? (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className={`p-2 rounded-full ${getActivityColor(activity.activity_type)}`}>
                                            {getActivityIcon(activity.activity_type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {activity.user_name}
                                                </p>
                                                <span className="text-xs text-gray-500">({activity.user_email})</span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">
                                                {activity.activity_description}
                                            </p>
                                            {activity.ip_address && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    IP: {activity.ip_address}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {formatActivityTime(activity.created_at)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No activities found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Activity Types Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Activity Types
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activityStatsLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            </div>
                        ) : activityStats?.topActivities ? (
                            <div className="space-y-4">
                                {activityStats.topActivities.slice(0, 5).map((activity) => (
                                    <div key={activity.type} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                {getActivityIcon(activity.type)}
                                                <span className="font-medium capitalize">
                                                    {activity.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <span className="text-gray-500">{activity.count}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${(activity.count / (activityStats.topActivities[0]?.count || 1)) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No activity data available</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Activity Filters and Controls */}
            <Card>
                <CardHeader>
                    <CardTitle>Activity Controls</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 sm:gap-4">
                        <Button variant="outline" size="sm" className="whitespace-nowrap">
                            <Download className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Export Activity Log</span>
                            <span className="sm:hidden">Export</span>
                        </Button>
                        <Button variant="outline" size="sm" className="whitespace-nowrap">
                            <Filter className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Filter by User</span>
                            <span className="sm:hidden">Filter</span>
                        </Button>
                        <Button variant="outline" size="sm" className="whitespace-nowrap">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Filter by Date</span>
                            <span className="sm:hidden">Date</span>
                        </Button>
                        <Button variant="outline" size="sm" className="whitespace-nowrap">
                            <Shield className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Security Events Only</span>
                            <span className="sm:hidden">Security</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
