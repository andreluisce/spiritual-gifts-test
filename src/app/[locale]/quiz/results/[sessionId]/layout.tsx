'use client'

import { useRouter, useParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Eye,
  Heart,
  BookOpen,
  Lightbulb,
  Target,
  AlertTriangle,
  Mail,
  Send,
  CheckCircle,
  X
} from 'lucide-react'
import {
  useResultBySessionId,
  useSpiritualGifts,
} from '@/hooks/use-quiz-queries'
import { useLocale } from 'next-intl'
import { formatScore } from '@/data/quiz-data'
import { useEmail } from '@/hooks/useEmail'
import { useState } from 'react'

interface ResultsLayoutProps {
  children: React.ReactNode
}

export default function ResultsLayout({ children }: ResultsLayoutProps) {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('results')
  const sessionId = params.sessionId as string
  const { sendQuizResultsEmail, sending, error: emailError, clearError } = useEmail()
  const [emailSent, setEmailSent] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)

  const { data: result, isLoading: loadingResults, error: resultsError } = useResultBySessionId(sessionId)
  const { data: spiritualGiftsData, isLoading: loadingSpiritualGifts } = useSpiritualGifts(locale)

  const loading = loadingResults || loadingSpiritualGifts

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (resultsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{t('errorLoading', { error: resultsError.message })}</p>
          <Button onClick={() => router.push('/quiz')}>
            {t('retakeQuiz')}
          </Button>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-4">{t('noResults')}</p>
          <Button onClick={() => router.push('/quiz')}>
            {t('takeQuiz')}
          </Button>
        </div>
      </div>
    )
  }

  // Calculate sorted scores
  const giftScores = result.totalScore as Record<string, number>
  const sortedScores = Object.entries(giftScores)
    .map(([giftKey, score]) => ({ giftKey, score }))
    .sort((a, b) => b.score - a.score)

  // Calculate maxScore based on actual quiz configuration
  // The quiz can have different lengths (7, 35, 70 questions)
  // Each question scores 0-5 points
  // Total possible score = (number of questions answered) * 5
  // Since questions are distributed across 7 gifts, theoretical max per gift = total / 7

  // Get number of questions from result metadata or calculate from answers
  const totalQuestionsAnswered = result.metadata?.totalQuestions ||
    result.answersCount ||
    70 // Default to full quiz if not specified

  // Theoretical maximum score per gift
  const theoreticalMaxScore = (totalQuestionsAnswered * 5) / 7

  const getScorePercentage = (score: number): number => {
    // Calculate percentage based on theoretical maximum
    // This gives absolute strength (how much of the possible score was achieved)
    return Math.min((score / theoreticalMaxScore) * 100, 100)
  }

  const topGift = sortedScores[0]
  const topGiftData = spiritualGiftsData?.find(gift => gift.gift_key === topGift?.giftKey)

  // Calculate compatibility level based on score distribution
  const getCompatibilityLevel = () => {
    if (sortedScores.length < 2) return t('excellent')

    const topScore = sortedScores[0].score
    const secondScore = sortedScores[1].score

    // Convert to percentage differences for more meaningful thresholds
    const topPercentage = getScorePercentage(topScore)
    const secondPercentage = getScorePercentage(secondScore)
    const percentageDifference = topPercentage - secondPercentage

    // Calculate percentage difference for more meaningful thresholds

    // Higher difference = more focused/compatible profile (using percentage differences)
    if (percentageDifference > 15) return t('excellent')    // >15% difference
    if (percentageDifference > 10) return t('good')         // 10-15% difference
    if (percentageDifference > 5) return t('balanced')      // 5-10% difference
    return t('diverse')                                     // <5% difference
  }

  const compatibilityLevel = getCompatibilityLevel()

  // Handle email sending
  const handleSendEmail = async () => {
    clearError()
    const result = await sendQuizResultsEmail(sessionId)

    if (result.success) {
      setEmailSent(true)
      setShowEmailDialog(false)
      // Auto-hide success message after 5 seconds
      setTimeout(() => setEmailSent(false), 5000)
    }
  }

  const navItems = [
    {
      href: `/quiz/results/${sessionId}/overview`,
      label: t('tabs.overview'),
      icon: <Eye className="h-4 w-4" />,
      description: t('tabDescriptions.overview')
    },
    {
      href: `/quiz/results/${sessionId}/compatibility`,
      label: t('tabs.compatibility'),
      icon: <Heart className="h-4 w-4" />,
      description: t('tabDescriptions.compatibility')
    },
    {
      href: `/quiz/results/${sessionId}/characteristics`,
      label: t('tabs.characteristics'),
      icon: <BookOpen className="h-4 w-4" />,
      description: t('tabDescriptions.characteristics')
    },
    {
      href: `/quiz/results/${sessionId}/qualities`,
      label: t('tabs.qualities'),
      icon: <Lightbulb className="h-4 w-4" />,
      description: t('tabDescriptions.qualities')
    },
    {
      href: `/quiz/results/${sessionId}/guidance`,
      label: t('tabs.guidance'),
      icon: <Target className="h-4 w-4" />,
      description: t('tabDescriptions.guidance')
    }
  ]

  const currentPath = pathname.split('/').pop()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="p-2 sm:p-4 m-1 sm:m-4">
          {/* Results Header */}
          <div className="mb-6">
            {/* Action bar - Email and Session ID */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{t('title')}</h1>
                <p className="text-sm text-gray-600">
                  {topGiftData ? `${t('yourTopGift')}: ${topGiftData.name}` : t('yourResults')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('backToDashboard')}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEmailDialog(true)}
                  className="flex items-center gap-2"
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <Send className="h-4 w-4 animate-pulse" />
                      <span className="hidden sm:inline">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span className="hidden sm:inline">Enviar por Email</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Email Success/Error Messages */}
            {emailSent && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Email enviado com sucesso!</p>
                  <p className="text-xs text-green-600">Verifique sua caixa de entrada para ver seus resultados detalhados.</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEmailSent(false)}
                  className="text-green-600 hover:text-green-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {emailError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Erro ao enviar email</p>
                  <p className="text-xs text-red-600">{emailError}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Results Summary Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                {t('resultsSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {topGiftData?.name || topGift?.giftKey}
                  </p>
                  <p className="text-sm text-gray-500">{t('primaryGift')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {formatScore(getScorePercentage(topGift?.score || 0), 1)}%
                  </p>
                  <p className="text-sm text-gray-500">{t('strength')}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-purple-600">
                    {new Date(result.createdAt).toLocaleDateString(locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US')}
                  </p>
                  <p className="text-sm text-gray-500">{t('testDate')}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-orange-600">
                    {compatibilityLevel}
                  </p>
                  <p className="text-sm text-gray-500">{t('compatibilityLevel')}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-indigo-600">
                    {t('exploreGifts')}
                  </p>
                  <p className="text-sm text-gray-500">{t('nextAction')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Navigation Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {t('sections')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {navItems.map((item) => {
                      const isActive = currentPath === item.href.split('/').pop()
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-start gap-3 px-3 sm:px-4 py-3 transition-colors hover:bg-gray-50",
                            isActive && "bg-blue-50 border-l-2 border-blue-600"
                          )}
                        >
                          <div className={cn(
                            "mt-0.5 flex-shrink-0",
                            isActive ? "text-blue-600" : "text-gray-400"
                          )}>
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              "font-medium text-sm truncate",
                              isActive ? "text-blue-900" : "text-gray-900"
                            )}>
                              {item.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {children}
            </div>
          </div>

          {/* Email Confirmation Dialog */}
          {showEmailDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Enviar Resultados por Email</h3>
                      <p className="text-sm text-gray-600">Receba seus resultados detalhados na sua caixa de entrada</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">O que você receberá:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Seu dom espiritual principal identificado</li>
                        <li>• Descrição detalhada do seu dom</li>
                        <li>• Sugestões para desenvolvimento</li>
                        <li>• Data de conclusão do teste</li>
                        <li>• Link para acessar novamente seus resultados</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowEmailDialog(false)}
                      className="flex-1"
                      disabled={sending}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSendEmail}
                      disabled={sending}
                      className="flex-1"
                    >
                      {sending ? (
                        <>
                          <Send className="h-4 w-4 mr-2 animate-pulse" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Email
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}