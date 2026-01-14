'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, RefreshCcw, LogOut } from 'lucide-react'

export default function PendingApprovalPage() {
    const { user, isApproved, approvedLoading, signOut } = useAuth()
    const router = useRouter()
    // const t = useTranslations('auth') // We might need to add translations later

    useEffect(() => {
        // If user is already approved, redirect to home/dashboard
        if (isApproved && !approvedLoading) {
            router.push('/dashboard')
        }

        // If not logged in, redirect to login
        if (!approvedLoading && !user) {
            router.push('/login')
        }
    }, [isApproved, approvedLoading, router, user])

    if (approvedLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!user) {
        return null // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="max-w-md w-full shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-yellow-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Aguardando Aprovação</CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                        Sua conta foi criada com sucesso!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center text-gray-600 space-y-2">
                        <p>
                            Para garantir a segurança e integridade do teste de dons espirituais,
                            sua conta precisa ser aprovada por um administrador.
                        </p>

                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2"
                        >
                            <RefreshCcw className="h-4 w-4" />
                            Verificar Status
                        </Button>

                        <Button
                            onClick={() => signOut()}
                            variant="ghost"
                            className="w-full text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Sair e tentar mais tarde
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
