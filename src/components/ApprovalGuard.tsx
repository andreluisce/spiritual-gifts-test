'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useEffect } from 'react'

interface ApprovalGuardProps {
    children: React.ReactNode
}

export default function ApprovalGuard({ children }: ApprovalGuardProps) {
    const { user, isApproved, approvedLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!approvedLoading && user && !isApproved) {
            router.push('/pending-approval')
        }
    }, [user, isApproved, approvedLoading, router])

    if (approvedLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (user && !isApproved) {
        return null // Will redirect
    }

    return <>{children}</>
}
