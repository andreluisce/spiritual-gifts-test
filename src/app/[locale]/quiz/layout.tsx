'use client'

import ApprovalGuard from '@/components/ApprovalGuard'

export default function QuizLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ApprovalGuard>
            {children}
        </ApprovalGuard>
    )
}
