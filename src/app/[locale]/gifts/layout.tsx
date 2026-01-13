import ApprovalGuard from '@/components/ApprovalGuard'

export default function GiftsLayout({
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
