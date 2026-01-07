'use server'

import { createClient } from '@/lib/supabase-server'
import { emailService } from '@/lib/email'
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

        // 3. Send approval email
        try {
            // Fetch secure email via RPC
            const { data: userEmail, error: emailError } = await supabase.rpc('manager_get_user_email', { target_user_id: userId })

            if (emailError || !userEmail) {
                console.warn('Could not fetch user email for notification:', emailError)
            } else {
                // Fetch display name from PROFILE (can be read by manager due to RLS)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('display_name')
                    .eq('id', userId)
                    .single()

                const userName = profile?.display_name || userEmail.split('@')[0]

                // Send Welcome/Approval Email
                // Note: sendWelcomeEmail content implies "Welcome to the test", which fits perfectly for "You are approved to start"
                await emailService.sendWelcomeEmail(userName, userEmail)
            }
        } catch (emailError) {
            console.error('Failed to send approval email (action succeeded):', emailError)
            // We do not fail the action, as the user is approved in DB
        }

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

        // 3. Send Rejection Email (Optional - using generic text)
        try {
            const { data: userEmail } = await supabase.rpc('manager_get_user_email', { target_user_id: userId })

            if (userEmail) {
                await emailService.sendEmail({
                    to: userEmail,
                    subject: 'Atualização sobre sua conta',
                    text: `Olá,\n\nInfelizmente seu acesso ao Teste de Dons Espirituais não foi aprovado neste momento.\nMotivo: ${reason}\n\nSe acredita que isso é um erro, entre em contato com a administração.`
                })
            }
        } catch (e) {
            console.error('Error sending rejection email:', e)
        }

        revalidatePath('/admin/approvals')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Internal server error' }
    }
}
