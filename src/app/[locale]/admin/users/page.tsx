'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  Shield,
  Mail,
  Calendar,
  Activity,
  Edit,
  Trash2,
  ArrowLeft,
  UserCheck,
  UserX,
  Crown,
  FileText,
  CheckCircle,
  TrendingUp,
  Clock,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { formatScore } from '@/data/quiz-data'
import { useUsersWithStats, useAdminStats, useUpdateUser, UserWithStats } from '@/hooks/useAdminData'
import { useUserActivities, useActivityStats } from '@/hooks/useUserActivity'
import { useAdminUsers } from '@/hooks/useAdminCheck'
import { useUserQuizResults, QuizResult } from '@/hooks/useUserQuizResults'

// All data comes from the database - no mock data

// Validation schema for user editing
const userEditSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name must be less than 100 characters'),
  role: z.enum(['user', 'admin']),
  status: z.enum(['active', 'inactive', 'suspended'])
})

type UserEditForm = z.infer<typeof userEditSchema>

export default function AdminUsersPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [activeTab, setActiveTab] = useState('overview')
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null)
  const [viewingQuizResults, setViewingQuizResults] = useState<UserWithStats | null>(null)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const { fetchUserQuizResults, loading: quizResultsLoading } = useUserQuizResults()

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<UserEditForm>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      displayName: '',
      role: 'user',
      status: 'active'
    }
  })
  
  // Fetch real data
  const { users: realUsers, loading: usersLoading } = useUsersWithStats()
  const { stats: realStats, loading: statsLoading } = useAdminStats()
  const { updateUser, updating } = useUpdateUser()
  const { activities, loading: activitiesLoading } = useUserActivities(100)
  const { stats: activityStats, loading: activityStatsLoading } = useActivityStats()
  const { adminUserIds } = useAdminUsers()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, loading, router])

  if (loading || usersLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  // Use only real data from database
  const usersData = realUsers || []
  const statsData = realStats || {
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    newUsersThisMonth: 0,
    suspendedUsers: 0
  }
  
  const filteredUsers = usersData.filter(user => {
    const userName = user.user_metadata?.name || (user.email ? user.email.split('@')[0] : '') || ''
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email ? user.email.toLowerCase().includes(searchTerm.toLowerCase()) : false)
    const userRole = user.user_metadata?.role || 'user'
    const matchesRole = selectedRole === 'all' || userRole === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Crown className="h-4 w-4" /> : <Users className="h-4 w-4" />
  }


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

  const handleEditUser = (user: UserWithStats) => {
    setEditingUser(user)
    reset({
      displayName: user.user_metadata?.name || (user.email ? user.email.split('@')[0] : '') || '',
      role: (user.user_metadata?.role as 'user' | 'admin') || 'user',
      status: user.status || 'active'
    })
  }

  const handleSaveUser = async (data: UserEditForm) => {
    
    if (!editingUser) {
      console.error('No editing user found')
      return
    }

    try {

      const result = await updateUser(editingUser.id, {
        displayName: data.displayName,
        role: data.role,
        status: data.status
      })


      if (result.success) {
        setEditingUser(null)
        reset()
        // Refresh the users list by reloading the page data
        window.location.reload()
      } else {
        console.error('Failed to update user:', result.error)
        alert('Failed to update user: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user: ' + error)
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    reset()
  }

  const handleViewQuizResults = async (user: UserWithStats) => {
    setViewingQuizResults(user)
    const results = await fetchUserQuizResults(user.id)
    setQuizResults(results)
  }

  const handleCloseQuizResults = () => {
    setViewingQuizResults(null)
    setQuizResults([])
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">
              Manage system users, roles, and permissions
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export Users</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Button size="sm" className="whitespace-nowrap">
              <UserPlus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add User</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="admins">Administrators</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsData.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  All registered users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsData.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {statsData.totalUsers > 0 ? `${((statsData.activeUsers / statsData.totalUsers) * 100).toFixed(1)}% of total` : '0% of total'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsData.adminUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Admin privileges
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsData.newUsersThisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suspended</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(statsData as { suspendedUsers?: number }).suspendedUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usersData.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gray-50">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold">
                        {(user.user_metadata?.name || (user.email ? user.email.split('@')[0] : '') || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.user_metadata?.name || (user.email ? user.email.split('@')[0] : '') || 'Unknown'}
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
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm whitespace-nowrap"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                  
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm whitespace-nowrap"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {(user.user_metadata?.name || (user.email ? user.email.split('@')[0] : '') || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {user.user_metadata?.name || (user.email ? user.email.split('@')[0] : '') || 'Unknown'}
                        </h3>
                        {adminUserIds.has(user.id) && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-400">
                        <span className="whitespace-nowrap">Joined: {new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                        <span className="whitespace-nowrap">Last login: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('pt-BR') : 'Never'}</span>
                        <span className="whitespace-nowrap">Quizzes: {user.quiz_count}</span>
                        <span className="whitespace-nowrap">Avg Score: {formatScore(user.avg_score, 1)}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0">
                      <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
                        {getRoleIcon(user.user_metadata?.role || 'user')}
                        {user.user_metadata?.role || 'user'}
                      </Badge>
                      <Badge className={`${getUserStatusColor(user.status)} whitespace-nowrap`}>
                        {user.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 mt-2 sm:mt-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewQuizResults(user)}
                        title="View Quiz Results"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {user.user_metadata?.name || user.email}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                              Delete User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No users found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                System Administrators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usersData.filter(u => (u.user_metadata?.role || 'user') === 'admin').map((admin) => (
                  <div key={admin.id} className="flex items-center gap-4 p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Crown className="h-6 w-6 text-yellow-600" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{admin.user_metadata?.name || (admin.email ? admin.email.split('@')[0] : '') || 'Unknown'}</h3>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Administrator since {new Date(admin.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Administrator
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
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
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <AlertDialog open={!!editingUser} onOpenChange={() => editingUser && handleCancelEdit()}>
        <AlertDialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit User</AlertDialogTitle>
            <AlertDialogDescription className="line-clamp-2">
              Update user information and permissions for {editingUser?.email}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <form onSubmit={handleSubmit(handleSaveUser)} className="space-y-4 py-4">
            {/* Display Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <Input
                {...register('displayName')}
                placeholder="Enter display name"
                className={`w-full ${errors.displayName ? 'border-red-500' : ''}`}
              />
              {errors.displayName && (
                <p className="text-xs text-red-500">{errors.displayName.message}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select
                {...register('role')}
                className={`w-full px-3 py-2 border rounded-md text-sm ${errors.role ? 'border-red-500' : ''}`}
              >
                <option value="user">User</option>
                <option value="admin">Administrator</option>
              </select>
              {errors.role && (
                <p className="text-xs text-red-500">{errors.role.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                {...register('status')}
                className={`w-full px-3 py-2 border rounded-md text-sm ${errors.status ? 'border-red-500' : ''}`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              {errors.status && (
                <p className="text-xs text-red-500">{errors.status.message}</p>
              )}
            </div>

            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel type="button" onClick={handleCancelEdit}>Cancel</AlertDialogCancel>
              <Button 
                type="submit"
                disabled={isSubmitting || updating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting || updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quiz Results Dialog */}
      <AlertDialog open={!!viewingQuizResults} onOpenChange={() => viewingQuizResults && handleCloseQuizResults()}>
        <AlertDialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quiz Results - {viewingQuizResults?.user_metadata?.name || viewingQuizResults?.email}
            </AlertDialogTitle>
            <AlertDialogDescription>
              All quiz attempts and results for this user
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 space-y-4">
            {quizResultsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading quiz results...</p>
              </div>
            ) : quizResults.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-gray-500">Total de Tentativas</div>
                      <div className="text-2xl font-bold">{quizResults.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-gray-500">Completados</div>
                      <div className="text-2xl font-bold text-green-600">
                        {quizResults.filter(r => r.is_completed).length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {quizResults.map((result, index) => (
                  <Card key={result.session_id} className={result.is_completed ? '' : 'opacity-60'}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {result.is_completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                          Attempt #{quizResults.length - index}
                        </span>
                        <Badge className={result.is_completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {result.is_completed ? 'Completed' : 'In Progress'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Iniciado:</span>
                          <span className="ml-2 font-medium">{formatDate(result.started_at)}</span>
                        </div>
                        {result.completed_at && (
                          <div>
                            <span className="text-gray-500">Completado:</span>
                            <span className="ml-2 font-medium">{formatDate(result.completed_at)}</span>
                          </div>
                        )}
                      </div>

                      {result.is_completed && result.top_gifts && result.top_gifts.length > 0 && (
                        <>
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Top 3 Dons Espirituais
                            </h4>
                            <div className="space-y-2">
                              {result.top_gifts.slice(0, 3).map((gift, giftIndex) => (
                                <div key={gift.gift_id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                    giftIndex === 0 ? 'bg-yellow-400 text-yellow-900' :
                                    giftIndex === 1 ? 'bg-gray-300 text-gray-700' :
                                    'bg-orange-300 text-orange-900'
                                  }`}>
                                    {giftIndex + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-lg text-gray-900">{gift.gift_name}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 border-t">
                            <Button
                              onClick={() => {
                                const url = `/pt/admin/quiz-report/${result.session_id}`
                                console.log('Opening report URL:', url)
                                console.log('Session ID:', result.session_id)
                                window.open(url, '_blank')
                              }}
                              className="w-full"
                              variant="outline"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Ver Relatório Completo
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">This user hasn't taken any quizzes yet</p>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseQuizResults}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}