'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function approveUserAction(userId: string) {
    // Use a fresh client for the action
    const supabase = await createClient()

    try {
        // 1. Check permissions (manager/admin)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Role check via RPC to be safe
        const { data: role } = await supabase.rpc('get_user_role')
        if (role !== 'admin' && role !== 'manager') {
            return { success: false, error: 'Permission denied' }
        }

        // 2. Call RPC to approve user
        const { error: rpcError } = await supabase.rpc('approve_user', { target_user_id: userId })

        if (rpcError) {
            console.error('Error approving user:', rpcError)
            return { success: false, error: rpcError.message }
        }

        // 3. Email notifications are currently disabled

        revalidatePath('/admin/approvals')
        return { success: true }
    } catch (error) {
        console.error('Unexpected error in approveUserAction:', error)
        return { success: false, error: 'Internal server error' }
    }
}

export async function rejectUserAction(userId: string, reason: string) {
    const supabase = await createClient()

    try {
        // 1. Check permissions
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const { data: role } = await supabase.rpc('get_user_role')
        if (role !== 'admin' && role !== 'manager') {
            return { success: false, error: 'Permission denied' }
        }

        // 2. RPC Reject
        const { error } = await supabase.rpc('reject_user', {
            target_user_id: userId,
            reject_reason: reason
        })

        if (error) {
            return { success: false, error: error.message }
        }

        // 3. Email notifications are currently disabled

        revalidatePath('/admin/approvals')
        return { success: true }
    } catch {
        return { success: false, error: 'Internal server error' }
    }
}
