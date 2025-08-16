'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Award,
  Eye,
  AlertCircle,
  Play,
  Trash2
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useUserResults, useLatestResult, useSpiritualGifts, useDeleteResult, type SpiritualGiftData } from '@/hooks/use-quiz-queries'
import { useAuth } from '@/context/AuthContext'
import { useTranslations, useLocale } from 'next-intl'
import { formatScore } from '@/data/quiz-data'
import CompatibilityAnalysis from '@/components/CompatibilityAnalysis'

const QUIZ_STATE_KEY = 'quiz_in_progress'

interface QuizState {
  answers: Record<number, number>
  currentQuestionIndex: number
  startedAt: number
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const locale = useLocale()
  const { data: results, isLoading: loadingResults } = useUserResults(user?.id || null)
  const { data: latestResult, isLoading: loadingLatestResult } = useLatestResult(user?.id || null)
  const { data: gifts, isLoading: loadingGifts } = useSpiritualGifts(locale)
  const deleteResultMutation = useDeleteResult()
  const [quizInProgress, setQuizInProgress] = useState<QuizState | null>(null)
  const tCommon = useTranslations('common')
  const t = useTranslations('dashboard')

  const loading = loadingResults || loadingLatestResult || loadingGifts || authLoading

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = `/${locale}`
    }
  }, [user, authLoading, locale])

  // Check for quiz in progress
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const persistedState = localStorage.getItem(QUIZ_STATE_KEY)
      if (persistedState) {
        const state: QuizState = JSON.parse(persistedState)
        
        // Check if the state is not too old (e.g., 24 hours)
        const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours in ms
        const isStateValid = Date.now() - state.startedAt < MAX_AGE
        
        if (isStateValid && Object.keys(state.answers).length > 0) {
          setQuizInProgress(state)
        } else {
          // Clear old/invalid state
          localStorage.removeItem(QUIZ_STATE_KEY)
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted quiz state:', error)
      localStorage.removeItem(QUIZ_STATE_KEY)
    }
  }, [])

  const getGiftByKey = (key: string): SpiritualGiftData | undefined => {
    return gifts?.find(gift => gift.gift_key === key)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDeleteResult = async (sessionId: string) => {
    if (!user?.id) {
      return
    }
    
    try {
      await deleteResultMutation.mutateAsync({
        sessionId,
        userId: user.id
      })
    } catch (error) {
      console.error('❌ Dashboard error deleting result:', error)
      // Could add toast notification here
      alert(t('deleteError', { error: error instanceof Error ? error.message : 'Erro desconhecido' }))
    }
  }

  const getGiftEvolution = () => {
    if (!results || results.length < 2) return null

    const latest = results[0]
    const previous = results[1]

    const evolution = Object.entries(latest.totalScore).map(([giftKey, latestScore]) => {
      const previousScore = previous.totalScore[giftKey] || 0
      const change = latestScore - previousScore
      const gift = getGiftByKey(giftKey)

      return {
        giftKey,
        giftName: gift?.name || giftKey,
        latestScore,
        previousScore,
        change,
        percentChange: previousScore > 0 ? ((change / previousScore) * 100) : 0
      }
    }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change))

    return evolution.slice(0, 5) // Top 5 changes
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Main Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              {t('myDashboard')}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {t('subtitle')}
            </p>
          </div>
          {quizInProgress && (
            <div className="mt-4 md:mt-0">
              <Link href="/quiz">
                <Button className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
{t('continueTest')}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Quiz in Progress Alert */}
        {quizInProgress && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">
                    {t('testInProgress')}
                  </h3>
                  <p className="text-amber-700 mb-4">
                    {t('welcome.testInProgress')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/quiz">
                      <Button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white">
                        <Play className="h-4 w-4" />
      {t('continueTest')}
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        localStorage.removeItem(QUIZ_STATE_KEY)
                        setQuizInProgress(null)
                      }}
                      className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      {t('discardTest')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!results || results.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <Award className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
              {t('welcome.title')}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {quizInProgress 
                ? t('welcome.testInProgress')
                : t('welcome.description')
              }
            </p>
            <Link href="/quiz">
              <Button size="lg" className="flex items-center gap-2 mx-auto">
                {quizInProgress ? (
                  <>
                    <Play className="h-5 w-5" />
  {t('continueTest')}
                  </>
                ) : (
                  <>
                    <Award className="h-5 w-5" />
                    {t('welcome.button')}
                  </>
                )}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{t('stats.totalTests')}</p>
                      <p className="text-xl sm:text-2xl font-bold">{results.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                      <Award className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{t('stats.mainGift')}</p>
                      <p className="text-sm sm:text-lg font-bold truncate">{latestResult?.topGifts[0] || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{t('stats.lastTest')}</p>
                      <p className="text-xs sm:text-sm font-semibold truncate">{latestResult ? formatDate(latestResult.createdAt) : 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{t('stats.evolution')}</p>
                      <p className="text-sm sm:text-lg font-bold truncate">
                        {results.length > 1 ? t('stats.growing') : t('stats.first')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compatibility Analysis */}
            {latestResult && latestResult.totalScore && (
              <CompatibilityAnalysis 
                giftScores={latestResult.totalScore}
                className="mb-8"
              />
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              {/* Latest Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{t('sections.recentResult')}</span>
                    <Badge>{latestResult ? formatDate(latestResult.createdAt) : 'N/A'}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">{t('sections.top5Gifts')}</h4>
                      <div className="space-y-3">
                        {latestResult?.topGifts.slice(0, 5).map((giftName, index) => {
                          const giftKey = Object.entries(latestResult.totalScore)
                            .sort(([, a], [, b]) => b - a)[index][0]
                          const score = latestResult.totalScore[giftKey]
                          const maxScore = 25 // Assuming 5 questions per gift with max 5 points each

                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <Badge variant={index === 0 ? "default" : "secondary"}>
                                  #{index + 1}
                                </Badge>
                                <span className="font-medium">{giftName}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-24">
                                  <Progress value={(score / maxScore) * 100} className="h-2" />
                                </div>
                                <span className="text-sm font-semibold w-8">{formatScore(score, 0)}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Link href={`/quiz/results/${latestResult?.sessionId}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          {t('sections.viewDetails')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Evolution/Change */}
              {(() => {
                const evolution = getGiftEvolution()
                return evolution ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('sections.giftEvolution')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          {t('sections.compareWithPrevious')}
                        </p>
                        <div className="space-y-3">
                          {evolution.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="font-medium">{item.giftName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                  {formatScore(item.previousScore, 0)} → {formatScore(item.latestScore, 0)}
                                </span>
                                <Badge
                                  variant={item.change > 0 ? "default" : item.change < 0 ? "destructive" : "secondary"}
                                  className="text-xs"
                                >
                                  {item.change > 0 ? '+' : ''}{formatScore(item.change, 0)}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('sections.testHistory')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">
                          {t('sections.takeAnother')}
                        </p>
                        <Link href="/quiz">
                          <Button size="sm">{t('sections.takeAnother')}</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}
            </div>

            {/* Historical Results */}
            <Card>
              <CardHeader>
                <CardTitle>{t('sections.fullHistory')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={result.sessionId}>
                      <div className="p-4 rounded-lg bg-gray-50 space-y-3">
                        {/* Header row with badge and date */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <Badge variant={index === 0 ? "default" : "secondary"}>
                              {index === 0 ? t('sections.mostRecent') : `#${index + 1}`}
                            </Badge>
                            <span className="font-medium text-sm">
                              {formatDate(result.createdAt)}
                            </span>
                          </div>
                          
                          {/* Action buttons - responsive layout */}
                          <div className="flex flex-col sm:flex-row gap-2 sm:flex-shrink-0 w-full sm:w-auto">
                            <Link href={`/quiz/results/${result.sessionId}`} className="flex-1 sm:flex-none">
                              <Button variant="outline" size="sm" className="w-full sm:w-auto flex items-center justify-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{t('sections.view')}</span>
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full sm:w-auto flex items-center justify-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={deleteResultMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>{t('sections.remove')}</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('sections.confirmRemoval')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('sections.confirmRemovalDescription', { date: formatDate(result.createdAt) })}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteResult(result.sessionId)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    disabled={deleteResultMutation.isPending}
                                  >
                                    {deleteResultMutation.isPending ? t('sections.removing') : t('sections.removeTest')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        
                        {/* Gifts badges row */}
                        <div className="flex flex-wrap gap-2">
                          {result.topGifts.slice(0, 3).map((gift, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {gift}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {index < results.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}