import ApprovalGuard from '@/components/ApprovalGuard'

export default function DashboardLayout({
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
