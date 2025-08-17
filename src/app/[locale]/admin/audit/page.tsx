'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Shield,
  Activity,
  Search,
  Filter,
  Download,
  ArrowLeft,
  Clock,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Eye,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { useRecentActivity } from '@/hooks/useAdminData'
import { useAuditLogs, useAuditStats } from '@/hooks/useAuditData'

export default function AdminAuditPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('logs')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  // Get real audit data
  const { logs: auditLogs, loading: auditLoading, error: auditError } = useAuditLogs(
    50, // limit
    0,  // offset
    selectedAction === 'all' ? undefined : selectedAction,
    selectedStatus === 'all' ? undefined : selectedStatus,
    searchTerm || undefined
  )
  const { stats: auditStats, loading: statsLoading } = useAuditStats()
  const { activities, loading: activityLoading } = useRecentActivity(20)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, loading, router])

  if (loading || auditLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  // Using only real audit logs from database - no mock data

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <AlertTriangle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR')
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Audit & Activity Logs</h1>
            <p className="text-gray-600 mt-1">
              Monitor system activities, user actions, and security events
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export Logs</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Advanced Filters</span>
              <span className="sm:hidden">Filters</span>
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-6">
          {/* Audit Statistics */}
          {auditStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Events</p>
                      <p className="text-2xl font-bold">{auditStats.totalEvents}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Events Today</p>
                      <p className="text-2xl font-bold">{auditStats.eventsToday}</p>
                    </div>
                    <Clock className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Failed Events</p>
                      <p className="text-2xl font-bold">{auditStats.failedEvents}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Unique Users</p>
                      <p className="text-2xl font-bold">{auditStats.uniqueUsers}</p>
                    </div>
                    <User className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by user, action, or resource..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm whitespace-nowrap"
                  >
                    <option value="all">All Actions</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="quiz">Quiz</option>
                    <option value="user">User Management</option>
                    <option value="system">System</option>
                  </select>
                  
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm whitespace-nowrap"
                  >
                    <option value="all">All Status</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs List */}
          <Card>
            <CardHeader>
              <CardTitle>System Audit Logs ({auditLogs.length})</CardTitle>
              {auditError && (
                <p className="text-sm text-red-600">Error loading audit logs: {auditError}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(log.status)} flex-shrink-0`}>
                      {getStatusIcon(log.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">{log.action}</h3>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {log.resource}
                        </Badge>
                        <Badge className={`${getStatusColor(log.status)} whitespace-nowrap`}>
                          {log.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : 'No additional details'}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-gray-500">
                        <div className="truncate">
                          <span className="font-medium">User:</span> {log.user_email}
                        </div>
                        <div className="whitespace-nowrap">
                          <span className="font-medium">Time:</span> {formatTime(log.created_at)}
                        </div>
                        <div className="truncate">
                          <span className="font-medium">IP:</span> {log.ip_address || 'N/A'}
                        </div>
                        <div className="truncate">
                          <span className="font-medium">Browser:</span> {log.user_agent ? log.user_agent.slice(0, 30) + '...' : 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="self-start mt-2 sm:mt-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {auditLogs.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No audit logs found in the database</p>
                  {auditError && (
                    <p className="text-sm text-red-600 mt-2">Error: {auditError}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent System Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg bg-gray-50">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.user_name || activity.user_email}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {activity.action}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
                        {formatTime(activity.created_at)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Security Monitoring</h3>
                <p className="text-gray-600 mb-4">Advanced security event tracking and monitoring</p>
                <Button variant="outline">Configure Security Alerts</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Audit Reports</h3>
                <p className="text-gray-600 mb-4">Generate comprehensive audit and compliance reports</p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Daily Report
                  </Button>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Weekly Report
                  </Button>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Custom Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}