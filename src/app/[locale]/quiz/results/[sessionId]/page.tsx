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
  Award, Users, Church, ArrowLeft,
  ChevronDown, ChevronRight
} from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  useResultBySessionId,
  useSpiritualGifts,
  useCategories,
  type SpiritualGiftData,
} from '@/hooks/use-quiz-queries'
import { useLocale, useTranslations } from 'next-intl'
import { formatScore, formatPercentage } from '@/data/quiz-data'
import CompatibilityAnalysis from '@/components/CompatibilityAnalysis'


export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations('results')
  const tCommon = useTranslations('common')
  const sessionId = params.sessionId as string
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedGifts, setExpandedGifts] = useState<Set<string>>(new Set())

  const { data: result, isLoading: loadingResults, error: resultsError } = useResultBySessionId(sessionId)
  const { data: spiritualGiftsData, isLoading: loadingSpiritualGifts } = useSpiritualGifts(locale)
  const { data: categories, isLoading: loadingCategories } = useCategories(locale)

  const loading = loadingResults || loadingSpiritualGifts || loadingCategories

  const getGiftByKey = (key: string): SpiritualGiftData | undefined => {
    return spiritualGiftsData?.find(gift => gift.gift_key === key)
  }

  // Get the top gift data from the database function
  // const getTopGiftData = (): TopGiftDetail | undefined => {
  //   return topGiftDetails?.[0] // Return the highest scoring gift
  // }

  const getScorePercentage = (score: number): number => {
    // Maximum weighted scores for each gift with 5 questions per gift (balanced quiz)
    // Based on generate_balanced_quiz function analysis
    const maxScore = 56.406 // All gifts have same max with balanced quiz
    
    return (score / maxScore) * 100
  }

  // Removed unused handlers for cleaner code

  const retakeQuiz = () => {
    router.push('/quiz')
  }

  // Get the complete top gift data
  const getTopGiftWithCompleteData = (): SpiritualGiftData | null => {
    if (!sortedScores.length || !spiritualGiftsData) return null
    const topGiftKey = sortedScores[0].giftKey
    return spiritualGiftsData.find(gift => gift.gift_key === topGiftKey) || null
  }

  const toggleGiftExpansion = (giftKey: string) => {
    const newExpanded = new Set(expandedGifts)
    if (newExpanded.has(giftKey)) {
      newExpanded.delete(giftKey)
    } else {
      newExpanded.add(giftKey)
    }
    setExpandedGifts(newExpanded)
  }

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
            {tCommon('tryAgain')}
          </Button>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">{t('noResults')}</p>
          <Button onClick={() => router.push('/quiz')}>
            {t('takeTest')}
          </Button>
        </div>
      </div>
    )
  }

  const allScores = spiritualGiftsData
    ? spiritualGiftsData.map(gift => ({
        giftKey: gift.gift_key,
        giftName: gift.name,
        definition: gift.definition,
        score: result.totalScore[gift.gift_key] || 0,
      }))
    : [];

  const sortedScores = allScores.sort((a, b) => b.score - a.score);

  const topGiftWithCompleteData = getTopGiftWithCompleteData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8 relative">
          {/* Back button */}
          <div className="absolute left-0 top-0">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
          </div>
          
          <div className="flex justify-center mb-4">
            <Gift className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600">
            {t('resultDate', { date: new Date(result.createdAt).toLocaleDateString(locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US') })}
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
              {sortedScores.slice(0, 5).map((scoreData, index) => (
                <div key={scoreData.giftKey} className="text-center">
                  <Badge
                    variant={index === 0 ? "default" : "secondary"}
                    className="text-sm px-3 py-1 mb-2"
                  >
                    #{index + 1}
                  </Badge>
                  <p className="font-semibold">{scoreData.giftName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatScore(scoreData.score, 1)} {tCommon('points')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap gap-2 w-full mb-4">
            <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
            <TabsTrigger value="compatibility">{t('tabs.compatibility')}</TabsTrigger>
            <TabsTrigger value="characteristics">{t('tabs.characteristics')}</TabsTrigger>
            <TabsTrigger value="qualities">{t('tabs.qualities')}</TabsTrigger>
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
                {sortedScores.map(({ giftKey, giftName, definition, score }, index) => {
                  const percentage = getScorePercentage(score)
                  const giftData = getGiftByKey(giftKey)
                  const isExpanded = expandedGifts.has(giftKey)

                  return (
                    <div key={giftKey}>
                      <div 
                        className="flex justify-between items-center mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        onClick={() => toggleGiftExpansion(giftKey)}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center mt-1">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {giftName}
                              <span className="text-xs text-gray-500 font-normal">{t('expandedDetails.clickToSeeDetails')}</span>
                            </h3>
                            <p className="text-sm text-gray-600">{definition}</p>
                          </div>
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

                      {/* Expanded Content */}
                      {isExpanded && giftData && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
                          {/* Top Characteristics */}
                          {giftData.characteristics && giftData.characteristics.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                                <Lightbulb className="h-4 w-4" />
                                {t('expandedDetails.topCharacteristics')}
                              </h4>
                              <div className="space-y-2">
                                {giftData.characteristics.slice(0, 3).map((char, charIndex) => (
                                  <div key={charIndex} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p className="text-sm text-gray-600">{char.characteristic}</p>
                                  </div>
                                ))}
                                {giftData.characteristics.length > 3 && (
                                  <p className="text-xs text-gray-500 italic">
                                    {t('expandedDetails.andMore', { count: giftData.characteristics.length - 3, type: t('expandedDetails.characteristics') })}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Top Qualities */}
                          {giftData.qualities && giftData.qualities.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                {t('expandedDetails.qualitiesToDevelop')}
                              </h4>
                              <div className="space-y-2">
                                {giftData.qualities.slice(0, 3).map((quality, qualityIndex) => (
                                  <div key={qualityIndex} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p className="text-sm text-gray-600">{quality.quality_name}</p>
                                  </div>
                                ))}
                                {giftData.qualities.length > 3 && (
                                  <p className="text-xs text-gray-500 italic">
                                    {t('expandedDetails.andMore', { count: giftData.qualities.length - 3, type: t('expandedDetails.qualities') })}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Biblical References */}
                          {giftData.biblical_references && (
                            <div>
                              <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                {t('expandedDetails.biblicalReference')}
                              </h4>
                              <p className="text-sm text-gray-600 italic">{giftData.biblical_references}</p>
                            </div>
                          )}

                          {/* Quick Actions */}
                          <div className="flex gap-2 pt-2 border-t border-gray-200">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab('characteristics');
                              }}
                            >
                              {t('expandedDetails.viewAllCharacteristics')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab('qualities');
                              }}
                            >
                              {t('expandedDetails.viewAllQualities')}
                            </Button>
                          </div>
                        </div>
                      )}

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
                        {category.name === 'MOTIVAÇÕES' && <Heart className="h-5 w-5" />}
                        {category.name === 'MINISTÉRIOS' && <Users className="h-5 w-5" />}
                        {category.name === 'MANIFESTAÇÕES' && <Church className="h-5 w-5" />}
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

          <TabsContent value="compatibility" className="space-y-6 mt-[70px] md:mt-[40px]">
            {result && result.totalScore && (
              <CompatibilityAnalysis 
                giftScores={result.totalScore}
              />
            )}
          </TabsContent>

          <TabsContent value="characteristics" className="space-y-6 mt-[70px] md:mt-[40px]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Características Detalhadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topGiftWithCompleteData?.characteristics && topGiftWithCompleteData.characteristics.length > 0 ? (
                  <div className="space-y-3">
                    {topGiftWithCompleteData.characteristics.map((char, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700">{char.characteristic}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Nenhuma característica disponível para este dom.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qualities" className="space-y-6 mt-[70px] md:mt-[40px]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Qualidades a Desenvolver
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topGiftWithCompleteData?.qualities && topGiftWithCompleteData.qualities.length > 0 ? (
                  <div className="space-y-4">
                    {topGiftWithCompleteData.qualities.map((quality, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-800">{quality.quality_name}</h4>
                        {quality.description && (
                          <p className="text-sm text-gray-600 mt-1">{quality.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Nenhuma qualidade disponível para este dom.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="guidance" className="space-y-6 mt-[70px] md:mt-[40px]">
            <div className="space-y-6">
              {/* Dangers/Precautions */}
              {topGiftWithCompleteData?.dangers && topGiftWithCompleteData.dangers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-700">
                      <AlertTriangle className="h-5 w-5" />
                      Cuidados e Precauções
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topGiftWithCompleteData.dangers.map((danger, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700">{danger.danger}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Misunderstandings */}
              {topGiftWithCompleteData?.misunderstandings && topGiftWithCompleteData.misunderstandings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <BookOpen className="h-5 w-5" />
                      Mal-Entendidos Comuns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topGiftWithCompleteData.misunderstandings.map((misunderstanding, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700">{misunderstanding.misunderstanding}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* If no data available */}
              {(!topGiftWithCompleteData?.dangers || topGiftWithCompleteData.dangers.length === 0) &&
               (!topGiftWithCompleteData?.misunderstandings || topGiftWithCompleteData.misunderstandings.length === 0) && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Orientações detalhadas não disponíveis para este dom.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Link href="/dashboard">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <ArrowLeft size={16} />
              {t('actions.backToDashboard')}
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
        </div>
      </div>
    </div>
  )
}
