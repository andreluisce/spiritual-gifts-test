'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { usePermissions } from '@/hooks/usePermissions'
import { useTranslations } from 'next-intl'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Search,
    Users,
    Crown,
    Shield,
    Trash2,
    Edit,
    FileText,
    AlertCircle,
    CheckCircle2
} from 'lucide-react'
import { formatScore } from '@/data/quiz-data'
import { useUsersWithStats, UserWithStats } from '@/hooks/useAdminData'
import { useAdminUsers } from '@/hooks/useAdminCheck'
import { UserEditDialog } from '@/components/admin/users/UserEditDialog'
import { UserDeleteDialog } from '@/components/admin/users/UserDeleteDialog'
import { UserQuizResultsDialog } from '@/components/admin/users/UserQuizResultsDialog'

export default function AdminUsersListPage() {
    const { user, isAdmin, isManager, loading } = useAuth()
    const router = useRouter()
    const { canEditUsers, canDeleteUsers, canViewUsers } = usePermissions()
    const tList = useTranslations('admin.users.list')
    const tShared = useTranslations('admin.shared')

    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRole, setSelectedRole] = useState('all')
    const [selectedStatus, setSelectedStatus] = useState('all')

    // Dialog states
    const [editingUser, setEditingUser] = useState<UserWithStats | null>(null)
    const [viewingQuizResultsUser, setViewingQuizResultsUser] = useState<UserWithStats | null>(null)
    const [deletingUser, setDeletingUser] = useState<UserWithStats | null>(null)

    // Fetch real data
    const { users: usersData, loading: usersLoading } = useUsersWithStats()
    // Admin user check set
    const { adminUserIds } = useAdminUsers()

    useEffect(() => {
        const allowed = isAdmin || isManager || canViewUsers || canEditUsers || canDeleteUsers
        if (!loading && (!user || !allowed)) {
            router.push('/dashboard')
        }
    }, [user, isAdmin, isManager, canViewUsers, canEditUsers, canDeleteUsers, loading, router])

    if (loading || usersLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!user || !(isAdmin || isManager || canViewUsers || canEditUsers || canDeleteUsers)) return null

    const filteredUsers = (usersData || []).filter(u => {
        const userName = u.user_metadata?.name || (u.email ? u.email.split('@')[0] : '') || ''
        const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email ? u.email.toLowerCase().includes(searchTerm.toLowerCase()) : false)
        const userRole = u.user_metadata?.role || 'user'
        const matchesRole = selectedRole === 'all' || userRole === selectedRole
        const matchesStatus = selectedStatus === 'all' || u.status === selectedStatus

        return matchesSearch && matchesRole && matchesStatus
    })

    // Helper functions for UI
    const getRoleIcon = (role: string) => {
        if (role === 'admin') return <Crown className="h-4 w-4" />
        if (role === 'manager') return <Shield className="h-4 w-4" />
        return <Users className="h-4 w-4" />
    }

    const getRoleBadgeColor = (role: string) => {
        if (role === 'admin') return 'bg-yellow-100 text-yellow-800 border-yellow-300'
        if (role === 'manager') return 'bg-blue-100 text-blue-800 border-blue-300'
        return 'bg-gray-100 text-gray-800 border-gray-300'
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
            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder={tList('searchPlaceholder')}
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
                                <option value="all">{tList('allRoles')}</option>
                                <option value="admin">{tShared('roles.administrator')}</option>
                                <option value="manager">{tShared('roles.manager')}</option>
                                <option value="user">{tShared('roles.user')}</option>
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-3 py-2 border rounded-md text-sm whitespace-nowrap"
                            >
                                <option value="all">{tList('allStatus')}</option>
                                <option value="active">{tShared('active')}</option>
                                <option value="inactive">{tShared('inactive')}</option>
                                <option value="suspended">{tShared('suspended')}</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users List */}
            <Card>
                <CardHeader>
                    <CardTitle>{tList('allUsersCount', { count: filteredUsers.length })}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredUsers.map((u) => (
                            <div key={u.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-semibold text-lg">
                                        {(u.user_metadata?.name || (u.email ? u.email.split('@')[0] : '') || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {u.user_metadata?.name || (u.email ? u.email.split('@')[0] : '') || tShared('unknown')}
                                        </h3>
                                        {adminUserIds.has(u.id) && (
                                            <Crown className="h-4 w-4 text-yellow-500" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">{u.email}</p>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-400">
                                        <span className="whitespace-nowrap">{tList('joined')}: {new Date(u.created_at).toLocaleDateString()}</span>
                                        <span className="whitespace-nowrap">{tList('lastLogin')}: {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : tList('never')}</span>
                                        <span className="whitespace-nowrap">{tList('quizzes')}: {u.quiz_count}</span>
                                        <span className="whitespace-nowrap">{tList('avgScore')}: {formatScore(u.avg_score, 1)}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0">
                                    {!u.approved ? (
                                        <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap border-orange-500 text-orange-700 bg-orange-50">
                                            <AlertCircle className="h-3 w-3" />
                                            <span>{tList('pending')}</span>
                                        </Badge>
                                    ) : (
                                        <div title={tList('approved')}>
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        </div>
                                    )}
                                    <Badge className={`flex items-center gap-1 whitespace-nowrap border ${getRoleBadgeColor(u.user_metadata?.role || 'user')}`}>
                                        {getRoleIcon(u.user_metadata?.role || 'user')}
                                        <span className="capitalize">{u.user_metadata?.role || 'user'}</span>
                                    </Badge>
                                    <Badge className={`${getUserStatusColor(u.status)} whitespace-nowrap`}>
                                        {u.status}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-1 mt-2 sm:mt-0">
                                    {(isAdmin || isManager) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setViewingQuizResultsUser(u)}
                                            title={tList('viewResults')}
                                        >
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {canEditUsers && (
                                        <Button variant="ghost" size="sm" onClick={() => setEditingUser(u)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    )}

                                    {canDeleteUsers && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => setDeletingUser(u)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">{tList('noUsersFound')}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <UserEditDialog
                open={!!editingUser}
                user={editingUser}
                onOpenChange={(open) => !open && setEditingUser(null)}
            />

            <UserDeleteDialog
                open={!!deletingUser}
                user={deletingUser}
                onOpenChange={(open) => !open && setDeletingUser(null)}
            />

            <UserQuizResultsDialog
                open={!!viewingQuizResultsUser}
                user={viewingQuizResultsUser}
                onOpenChange={(open) => !open && setViewingQuizResultsUser(null)}
            />
        </div>
    )
}
