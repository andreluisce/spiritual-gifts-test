'use client'

import { useRouter, useParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Eye,
  Heart,
  BookOpen,
  Lightbulb,
  Target,
  AlertTriangle
} from 'lucide-react'
import {
  useResultBySessionId,
  useSpiritualGifts,
  useCategories,
} from '@/hooks/use-quiz-queries'
import { useLocale } from 'next-intl'
import { formatScore } from '@/data/quiz-data'

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

  const { data: result, isLoading: loadingResults, error: resultsError } = useResultBySessionId(sessionId)
  const { data: spiritualGiftsData, isLoading: loadingSpiritualGifts } = useSpiritualGifts(locale)
  const { data: categories, isLoading: loadingCategories } = useCategories(locale)

  const loading = loadingResults || loadingSpiritualGifts || loadingCategories

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

  const getScorePercentage = (score: number): number => {
    const maxScore = 56.406
    return (score / maxScore) * 100
  }

  const topGift = sortedScores[0]
  const topGiftData = spiritualGiftsData?.find(gift => gift.gift_key === topGift?.giftKey)

  // Calculate compatibility level based on score distribution
  const getCompatibilityLevel = () => {
    if (sortedScores.length < 2) return t('excellent')
    
    const topScore = sortedScores[0].score
    const secondScore = sortedScores[1].score
    const scoreDifference = topScore - secondScore
    
    // Higher difference = more focused/compatible profile
    if (scoreDifference > 15) return t('excellent')
    if (scoreDifference > 10) return t('good') 
    if (scoreDifference > 5) return t('balanced')
    return t('diverse')
  }

  const compatibilityLevel = getCompatibilityLevel()

  const navItems = [
    {
      href: `/quiz/results/${sessionId}/overview`,
      label: t('tabs.overview'),
      icon: <Eye className="h-4 w-4" />,
      description: 'Visão geral dos seus resultados'
    },
    {
      href: `/quiz/results/${sessionId}/compatibility`,
      label: t('tabs.compatibility'),
      icon: <Heart className="h-4 w-4" />,
      description: 'Análise de compatibilidade'
    },
    {
      href: `/quiz/results/${sessionId}/characteristics`,
      label: t('tabs.characteristics'),
      icon: <BookOpen className="h-4 w-4" />,
      description: 'Características detalhadas'
    },
    {
      href: `/quiz/results/${sessionId}/qualities`,
      label: t('tabs.qualities'),
      icon: <Lightbulb className="h-4 w-4" />,
      description: 'Qualidades dos seus dons'
    },
    {
      href: `/quiz/results/${sessionId}/guidance`,
      label: t('tabs.guidance'),
      icon: <Target className="h-4 w-4" />,
      description: 'Orientações práticas'
    }
  ]

  const currentPath = pathname.split('/').pop()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('backToDashboard')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
              <p className="text-sm text-gray-600">
                {topGiftData ? `${t('yourTopGift')}: ${topGiftData.name}` : t('yourResults')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {t('sessionId')}: {sessionId.slice(-8)}
            </Badge>
          </div>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
              <CardHeader>
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
                          "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50",
                          isActive && "bg-blue-50 border-l-2 border-blue-600"
                        )}
                      >
                        <div className={cn(
                          "mt-0.5",
                          isActive ? "text-blue-600" : "text-gray-400"
                        )}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <div className={cn(
                            "font-medium text-sm",
                            isActive ? "text-blue-900" : "text-gray-900"
                          )}>
                            {item.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
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
      </div>
    </div>
  )
}