'use client'

import React, { useEffect, useState } from 'react'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { UserWithStats } from '@/hooks/useAdminData'
import { useUserQuizResults, QuizResult } from '@/hooks/useUserQuizResults'
import { useTranslations, useLocale } from 'next-intl'

interface UserQuizResultsDialogProps {
    user: UserWithStats | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function UserQuizResultsDialog({ user, open, onOpenChange }: UserQuizResultsDialogProps) {
    const t = useTranslations('adminUserQuiz')
    const locale = useLocale()
    const [quizResults, setQuizResults] = useState<QuizResult[]>([])
    const { fetchUserQuizResults, loading: quizResultsLoading, error } = useUserQuizResults()

    useEffect(() => {
        if (user && open) {
            fetchUserQuizResults(user.id).then(setQuizResults)
        } else {
            setQuizResults([])
        }
    }, [user, open, fetchUserQuizResults])

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {t('title', { user: user?.user_metadata?.name || user?.email || '' })}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('description')}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm border border-red-200">
                            Error: {error}
                        </div>
                    )}
                    {quizResultsLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">{t('loading')}</p>
                        </div>
                    ) : quizResults.length > 0 ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="text-sm text-gray-500">{t('totalAttempts')}</div>
                                        <div className="text-2xl font-bold">{quizResults.length}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="text-sm text-gray-500">{t('completed')}</div>
                                        <div className="text-2xl font-bold text-green-600">
                                            {quizResults.filter(r => r.is_completed).length}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {quizResults.map((result, index) => (
                                <Card key={result.session_id} className={result.is_completed ? '' : 'opacity-60'}>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                {result.is_completed ? (
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <Clock className="h-5 w-5 text-yellow-600" />
                                                )}
                                                {t('attempt', { num: quizResults.length - index })}
                                            </span>
                                            <Badge className={result.is_completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                                {result.is_completed ? t('status.completed') : t('status.inProgress')}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">{t('started')}:</span>
                                                <span className="ml-2 font-medium">{formatDate(result.started_at)}</span>
                                            </div>
                                            {result.completed_at && (
                                                <div>
                                                    <span className="text-gray-500">{t('finished')}:</span>
                                                    <span className="ml-2 font-medium">{formatDate(result.completed_at)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {result.is_completed && result.top_gifts && result.top_gifts.length > 0 && (
                                            <>
                                                <div>
                                                    <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                                                        <TrendingUp className="h-4 w-4" />
                                                        {t('topGifts')}
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {result.top_gifts.slice(0, 3).map((gift, giftIndex) => (
                                                            <div key={gift.gift_id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${giftIndex === 0 ? 'bg-yellow-400 text-yellow-900' :
                                                                    giftIndex === 1 ? 'bg-gray-300 text-gray-700' :
                                                                        'bg-orange-300 text-orange-900'
                                                                    }`}>
                                                                    {giftIndex + 1}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="font-semibold text-lg text-gray-900">{gift.gift_name}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t">
                                                    <Button
                                                        onClick={() => {
                                                            const url = `/${locale}/admin/quiz-report/${result.session_id}`
                                                            window.open(url, '_blank')
                                                        }}
                                                        className="w-full"
                                                        variant="outline"
                                                    >
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        {t('viewReport')}
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">{t('empty')}</p>
                        </div>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>{t('close')}</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog >
    )
}
