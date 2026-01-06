'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'

type ActivityType =
    | 'login'
    | 'logout'
    | 'quiz_start'
    | 'quiz_complete'
    | 'profile_update'
    | 'password_change'
    | 'account_created'
    | 'email_verified'
    | 'page_view'

interface LogActivityParams {
    activityType: ActivityType
    description?: string
    metadata?: Record<string, unknown>
}

/**
 * Hook to track user activities
 */
export function useActivityTracking() {
    const supabase = createClient()

    const logActivity = async ({
        activityType,
        description,
        metadata = {}
    }: LogActivityParams) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                console.warn('Cannot log activity: No user logged in')
                return
            }

            // Get client info
            const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined

            await supabase.rpc('log_user_activity', {
                p_user_id: user.id,
                p_activity_type: activityType,
                p_description: description || activityType,
                p_user_agent: userAgent,
                p_metadata: metadata
            })
        } catch (error) {
            console.error('Failed to log activity:', error)
        }
    }

    return { logActivity }
}

/**
 * Hook to auto-track page views
 */
export function usePageViewTracking(pageName: string) {
    const { logActivity } = useActivityTracking()

    useEffect(() => {
        logActivity({
            activityType: 'page_view',
            description: `Viewed ${pageName}`,
            metadata: {
                page: pageName,
                path: typeof window !== 'undefined' ? window.location.pathname : undefined
            }
        })
    }, [pageName]) // eslint-disable-line react-hooks/exhaustive-deps
}
