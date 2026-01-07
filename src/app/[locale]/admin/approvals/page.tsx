'use client'

import { useState } from 'react'
import { usePendingUsers, useApproveUsers, PendingUser } from '@/hooks/useAdminApprovals'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogCancel,
    AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { CheckCircle, XCircle, Clock, AlertCircle, UserCheck } from 'lucide-react'

export default function ApprovalsPage() {
    const { pendingUsers, loading, refetch } = usePendingUsers()
    const { approveUser, rejectUser, processing } = useApproveUsers()
    const [rejectingUser, setRejectingUser] = useState<PendingUser | null>(null)
    const [rejectReason, setRejectReason] = useState('')

    const handleApprove = async (user: PendingUser) => {
        const result = await approveUser(user.id)
        if (result.success) {
            refetch()
        } else {
            alert('Failed to approve user')
        }
    }

    const handleRejectClick = (user: PendingUser) => {
        setRejectingUser(user)
        setRejectReason('')
    }

    const handleConfirmReject = async (e: React.MouseEvent) => {
        e.preventDefault()
        if (!rejectingUser) return

        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection')
            return
        }

        const result = await rejectUser(rejectingUser.id, rejectReason)
        if (result.success) {
            setRejectingUser(null)
            refetch()
        } else {
            alert('Failed to reject user')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <UserCheck className="h-6 w-6 text-blue-600" />
                        Pending Approvals
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Review and approve new user registrations
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                        {pendingUsers.length} Pending
                    </Badge>
                </div>
            </div>

            {pendingUsers.length === 0 ? (
                <Card className="bg-gray-50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-green-100 p-4 rounded-full mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                        <p className="text-gray-500 mt-2 max-w-sm">
                            There are no pending user approvals at the moment. New registrations will appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {pendingUsers.map((user) => (
                        <Card key={user.id} className="overflow-hidden">
                            <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {user.display_name || 'No Name'}
                                            </h3>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                            <Clock className="h-3 w-3" />
                                            Registered: {new Date(user.created_at).toLocaleString()}
                                        </span>
                                        {user.rejection_reason && (
                                            <span className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded">
                                                <AlertCircle className="h-3 w-3" />
                                                Previously Rejected
                                            </span>
                                        )}
                                    </div>
                                    {user.rejection_reason && (
                                        <p className="mt-2 text-sm text-red-600 italic">
                                            Reason: "{user.rejection_reason}"
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:pl-4 mt-2 sm:mt-0">
                                    <Button
                                        onClick={() => handleRejectClick(user)}
                                        disabled={processing}
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50 border-red-200"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => handleApprove(user)}
                                        disabled={processing}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Reject Dialog */}
            <AlertDialog open={!!rejectingUser} onOpenChange={(open: boolean) => !open && setRejectingUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to reject access for {rejectingUser?.display_name || rejectingUser?.email}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reason for rejection (required)</label>
                            <Textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="E.g., Invalid registration, Spam account..."
                                rows={3}
                            />
                            <p className="text-xs text-gray-500">
                                This reason will be recorded but not automatically sent to the user (unless email integration is active).
                            </p>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing} onClick={() => setRejectingUser(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleConfirmReject}
                            disabled={processing || !rejectReason.trim()}
                        >
                            Confirm Rejection
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
