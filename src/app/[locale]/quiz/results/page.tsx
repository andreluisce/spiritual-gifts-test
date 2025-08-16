'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Gift, RotateCcw,
  BookOpen, AlertTriangle, Heart,
  Target, Lightbulb,
  Award, Users, Church, FileText
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import {
  useLatestResult,
  useSpiritualGifts,
  useCategories,
  type SpiritualGiftData
} from '@/hooks/use-quiz-queries'

import { useAuth } from '@/context/AuthContext'
import { formatScore, formatPercentage } from '@/data/quiz-data'

export default function ResultsPage() {
  const router = useRouter()
  const locale = useLocale()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const t = useTranslations('results')
  const tCommon = useTranslations('common')

  const { data: latestResult, isLoading: loadingResults, error: resultsError } = useLatestResult(user?.id || null)
  const { data: spiritualGiftsData, isLoading: loadingSpiritualGifts } = useSpiritualGifts(locale)
  const { data: categories, isLoading: loadingCategories } = useCategories(locale)

  const loading = loadingResults || loadingSpiritualGifts || loadingCategories

  const getGiftByKey = (key: string): SpiritualGiftData | undefined => {
    return spiritualGiftsData?.find(gift => gift.gift_key === key)
  }

  // Get extended spiritual gift data based on quiz results
  const getExtendedGiftData = (giftName: string): SpiritualGiftData | undefined => {
    if (!giftName || !spiritualGiftsData) return undefined;
    return spiritualGiftsData?.find(gift => 
      gift.name?.toLowerCase().includes(giftName.toLowerCase())
    )
  }

  const getScorePercentage = (score: number, giftKey: string): number => {
    // Maximum weighted scores for each gift with 5 questions per gift (balanced quiz)
    // Based on generate_balanced_quiz function analysis
    const maxScore = 56.406 // All gifts have same max with balanced quiz
    
    return (score / maxScore) * 100
  }

  // Removed unused handlers for cleaner code

  const retakeQuiz = () => {
    router.push('/quiz')
  }

  // Get the top gift with extended data
  const getTopGiftWithData = () => {
    if (!latestResult || !spiritualGiftsData || latestResult.topGifts.length === 0) return null

    // Since the new RPC returns gift names in Portuguese, we need to use the gift keys from totalScore
    // to find the corresponding gift data
    const scores = Object.entries(latestResult.totalScore)
    if (scores.length === 0) return null

    // Get the highest scoring gift key
    const topGiftKey = scores.reduce((a, b) => a[1] > b[1] ? a : b)[0]
    const topGift = getGiftByKey(topGiftKey)
    
    
    return topGift
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (resultsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Erro ao carregar resultados: {resultsError.message}</p>
          <Button onClick={() => router.push('/quiz')}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  // Debug: log the data to understand the issue

  if (!latestResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Nenhum resultado encontrado</p>
          <Button onClick={() => router.push('/quiz')}>
            Fazer o Teste
          </Button>
        </div>
      </div>
    )
  }

  // Debug: log the data to understand the issue

  const allScores = spiritualGiftsData
    ? spiritualGiftsData.map(gift => {
        const score = latestResult.totalScore[gift.gift_key] || 0;
        return {
          giftKey: gift.gift_key,
          score: score,
        };
      }).filter(scoreData => {
        const giftFound = getGiftByKey(scoreData.giftKey) !== undefined;
        return giftFound;
      })
    : [];

  // Sort scores by score value (descending) since we have totalScore directly
  const sortedScores = allScores.sort((a, b) => {
    return b.score - a.score
  });

  const topGiftWithData = getTopGiftWithData()
  
  // Debug logging

  // Calculate rankings considering tied scores
  const calculateRankings = () => {
    const rankingsMap = new Map<string, number>()
    let currentRank = 1
    let previousScore: number | null = null
    let sameRankCount = 0

    sortedScores.forEach((scoreData) => {
      const currentScore = scoreData.score

      if (previousScore !== null && currentScore !== previousScore) {
        // Score changed, update rank
        currentRank += sameRankCount
        sameRankCount = 1
      } else {
        // Same score or first item
        sameRankCount++
      }

      const gift = getGiftByKey(scoreData.giftKey)
      if (gift) {
        rankingsMap.set(gift.name, currentRank)
      }

      previousScore = currentScore
    })

    return rankingsMap
  }

  const rankingsMap = calculateRankings()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Gift className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600">
            {t('resultDate', { date: new Date(latestResult.createdAt).toLocaleDateString(locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US') })}
          </p>
        </div>

        {/* Top Gifts Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {t('topGifts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {latestResult.topGifts.map((giftName, index) => {
                const rank = rankingsMap.get(giftName) || index + 1
                return (
                  <div key={index} className="text-center">
                    <Badge
                      variant={rank === 1 ? "default" : "secondary"}
                      className="text-sm px-3 py-1 mb-2"
                    >
                      #{rank}
                    </Badge>
                    <p className="font-semibold">{giftName}</p>
                    {rank === 1 && topGiftWithData && (
                      <p className="text-xs text-gray-500 mt-1">
                        Dom Espiritual
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap gap-2 w-full mb-4">
            <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
            <TabsTrigger value="characteristics">{t('tabs.characteristics')}</TabsTrigger>
            <TabsTrigger value="qualities">{t('tabs.qualities')}</TabsTrigger>
            <TabsTrigger value="dangers">{t('tabs.precautions')}</TabsTrigger>
            <TabsTrigger value="guidance">{t('tabs.guidance')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-[70px] md:mt-[40px]">
            {/* Detailed Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {t('detailedScores')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {sortedScores.map(({ giftKey, score }, index) => {
                  const gift = getGiftByKey(giftKey)!  // Safe now due to filter above

                  const percentage = getScorePercentage(score, giftKey)

                  return (
                    <div key={`${giftKey}-${index}`}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{gift.name}</h3>
                          <p className="text-sm text-gray-600">{gift.definition}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{formatScore(score, 0)}</div>
                          <div className="text-sm text-gray-500">{tCommon('points')}</div>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-3 mb-2" />
                      <div className="text-sm text-gray-500 mb-4">
                        {t('affinity', { percentage: formatPercentage(percentage) })}
                      </div>
                      {index < sortedScores.length - 1 && <Separator />}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Categories Overview */}
            {categories && (
              <div className="grid md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.key}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {category.key === 'motivational' && <Heart className="h-5 w-5" />}
                        {category.key === 'ministries' && <Users className="h-5 w-5" />}
                        {category.key === 'manifestations' && <Church className="h-5 w-5" />}
                        {category.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{category.greek_term}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-2">{category.description}</p>
                      <p className="text-xs text-blue-600 font-medium">{category.purpose}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="characteristics" className="space-y-6 mt-[70px] md:mt-[40px]">
            {topGiftWithData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    {t('characteristicsTitle', {giftName: topGiftWithData.name})}
                  </CardTitle>
                  <p className="text-gray-600">{topGiftWithData.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {topGiftWithData.characteristics?.map((char, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <Badge variant="outline" className="mt-1">
                          {index + 1}
                        </Badge>
                        <p className="text-gray-700 flex-1">{char.characteristic}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {t('notAvailable.main')}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="qualities" className="space-y-6 mt-[70px] md:mt-[40px]">
            {topGiftWithData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {t('qualitiesTitle')}
                  </CardTitle>
                  <p className="text-gray-600">
                    {t('qualitiesDescription', {giftName: topGiftWithData.name})}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {topGiftWithData.qualities?.map((quality, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <Badge variant="outline" className="mt-1 bg-green-100 text-green-800">
                          {index + 1}
                        </Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {quality.quality_name}
                          </h4>
                          {quality.description && (
                            <p className="text-sm text-gray-600">{quality.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Dados de qualidades não disponíveis para análise completa.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="dangers" className="space-y-6 mt-[70px] md:mt-[40px]">
            {topGiftWithData && topGiftWithData.dangers && topGiftWithData.dangers.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    {t('precautionsTitle')}
                  </CardTitle>
                  <p className="text-gray-600">
                    {t('precautionsDescription')}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {topGiftWithData.dangers?.map((danger, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <Badge variant="outline" className="mt-1 bg-yellow-100 text-yellow-800">
                          {index + 1}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-gray-800">{danger.danger}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Misunderstandings section */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      {t('misunderstandingsTitle')}
                    </h4>
                    <div className="grid gap-3">
                      {topGiftWithData.misunderstandings?.map((misunderstanding, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                          <Badge variant="outline" className="mt-1 bg-red-100 text-red-800">
                            {index + 1}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-gray-800">{misunderstanding.misunderstanding}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {t('notAvailable.precautions')}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="guidance" className="space-y-6 mt-[70px] md:mt-[40px]">
            {topGiftWithData ? (
              <>
                {/* Orientações Práticas */}
                {topGiftWithData.orientations && topGiftWithData.orientations.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-green-600" />
                        {t('orientationsTitle')}
                      </CardTitle>
                      <p className="text-gray-600">
                        {t('orientationsDescription')}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Group orientations by category */}
                        {['spiritual', 'practical', 'development'].map((category) => {
                          const categoryOrientations = topGiftWithData.orientations?.filter(
                            (orientation: any) => orientation.category === category
                          )
                          
                          if (!categoryOrientations || categoryOrientations.length === 0) return null
                          
                          return (
                            <div key={category}>
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                {category === 'spiritual' && <BookOpen className="h-4 w-4 text-blue-600" />}
                                {category === 'practical' && <Target className="h-4 w-4 text-green-600" />}
                                {category === 'development' && <Lightbulb className="h-4 w-4 text-purple-600" />}
                                {category === 'spiritual' ? 'Orientações Espirituais' : 
                                 category === 'practical' ? 'Orientações Práticas' : 
                                 'Desenvolvimento'}
                              </h4>
                              <div className="grid gap-2">
                                {categoryOrientations.map((orientation: any, index: number) => (
                                  <div key={`${category}-orientation-${index}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
                                    <Badge variant="outline" className="mt-1">
                                      {index + 1}
                                    </Badge>
                                    <p className="text-gray-700 flex-1">{orientation.orientation}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {/* Biblical References Detailed */}
                {topGiftWithData.detailed_biblical_references && topGiftWithData.detailed_biblical_references.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        {t('biblicalReferencesTitle')}
                      </CardTitle>
                      <p className="text-gray-600">
                        {t('biblicalReferencesDescription')}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {topGiftWithData.detailed_biblical_references.map((ref: any, index: number) => (
                          <div key={`biblical-ref-${index}-${ref.reference}`} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                            <div className="flex items-start gap-3">
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                {ref.reference}
                              </Badge>
                              <div className="flex-1">
                                <blockquote className="text-blue-900 font-medium italic mb-2 border-l-4 border-blue-300 pl-3">
                                  "{ref.verse_text}"
                                </blockquote>
                                <p className="text-blue-800 text-sm">
                                  {ref.application}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {t('biblicalReferencesTitle')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500 italic">
                        {t('notAvailable.biblicalReferences')}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {t('notAvailable.guidance')}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Link href={`/${locale}/quiz/report`}>
            <Button variant="default" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <FileText size={16} />
              {t('actions.fullReport')}
            </Button>
          </Link>

          <Button variant="outline" onClick={retakeQuiz} className="flex items-center gap-2">
            <RotateCcw size={16} />
            {t('actions.retakeTest')}
          </Button>

          <Link href="/gifts">
            <Button variant="outline">
              {t('actions.viewAllGifts')}
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button variant="outline">
              {t('actions.myHistory')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}