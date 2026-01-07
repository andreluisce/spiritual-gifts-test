import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/context/AuthContext'
import { approveUserAction, rejectUserAction } from '@/app/actions/admin'

export interface PendingUser {
    id: string
    email: string
    display_name: string
    created_at: string
    rejection_reason?: string
}

export function usePendingUsers() {
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { isManager } = useAuth()
    const supabase = createClient()

    const fetchPendingUsers = useCallback(async () => {
        if (!isManager) return

        try {
            setLoading(true)
            const { data, error } = await supabase.rpc('get_pending_users')

            if (error) throw error

            setPendingUsers(data || [])
        } catch (err) {
            console.error('Error fetching pending users:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch pending users')
        } finally {
            setLoading(false)
        }
    }, [isManager, supabase])

    useEffect(() => {
        fetchPendingUsers()
    }, [fetchPendingUsers])

    return { pendingUsers, loading, error, refetch: fetchPendingUsers }
}

export function useApproveUsers() {
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const approveUser = async (userId: string) => {
        try {
            setProcessing(true)
            setError(null)

            const result = await approveUserAction(userId)

            if (!result.success) {
                throw new Error(result.error || 'Failed to approve user')
            }

            return { success: true }
        } catch (err) {
            console.error('Error approving user:', err)
            setError(err instanceof Error ? err.message : 'Failed to approve user')
            return { success: false, error: err }
        } finally {
            setProcessing(false)
        }
    }

    const rejectUser = async (userId: string, reason: string) => {
        try {
            setProcessing(true)
            setError(null)

            const result = await rejectUserAction(userId, reason)

            if (!result.success) {
                throw new Error(result.error || 'Failed to reject user')
            }

            return { success: true }
        } catch (err) {
            console.error('Error rejecting user:', err)
            setError(err instanceof Error ? err.message : 'Failed to reject user')
            return { success: false, error: err }
        } finally {
            setProcessing(false)
        }
    }

    return { approveUser, rejectUser, processing, error }
}
