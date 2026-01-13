'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown } from 'lucide-react'
import { useUsersWithStats } from '@/hooks/useAdminData'
import { useEffect } from 'react'

export default function AdminUsersAdminsPage() {
    const { user, isAdmin, loading } = useAuth()
    const router = useRouter()

    const { users, loading: usersLoading } = useUsersWithStats()

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push('/dashboard')
        }
    }, [user, isAdmin, loading, router])

    if (loading || usersLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!user || !isAdmin) return null

    const admins = users.filter(u => (u.user_metadata?.role || 'user') === 'admin')

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5" />
                        System Administrators ({admins.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {admins.map((admin) => (
                            <div key={admin.id} className="flex items-center gap-4 p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <Crown className="h-6 w-6 text-yellow-600" />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">
                                        {admin.user_metadata?.name || (admin.email ? admin.email.split('@')[0] : '') || 'Unknown'}
                                    </h3>
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

                        {admins.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No administrators found (which is weird since you are one).
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
