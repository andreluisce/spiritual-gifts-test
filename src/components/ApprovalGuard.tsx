'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useSystemSettings } from '@/hooks/useSystemSettings'
import { useEffect } from 'react'

interface ApprovalGuardProps {
    children: React.ReactNode
}

export default function ApprovalGuard({ children }: ApprovalGuardProps) {
    const { user, isApproved, approvedLoading } = useAuth()
    const { settings, loading: settingsLoading } = useSystemSettings()
    const router = useRouter()

    const loading = approvedLoading || settingsLoading

    useEffect(() => {
        const requireApproval = settings?.general?.requireApproval || false

        if (!loading && user && !isApproved && requireApproval) {
            router.push('/pending-approval')
        }
    }, [user, isApproved, loading, router, settings])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const requireApproval = settings?.general?.requireApproval || false

    if (user && !isApproved && requireApproval) {
        return null // Will redirect
    }

    return <>{children}</>
}
