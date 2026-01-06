'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  Target, Lightbulb, Award, Heart, Users, Church,
  ChevronDown, ChevronRight
} from 'lucide-react'
import {
  useResultBySessionId,
  useSpiritualGifts,
  useCategories,
  type SpiritualGiftData,
} from '@/hooks/use-quiz-queries'
import { useLocale, useTranslations } from 'next-intl'
import { formatScore, formatPercentage } from '@/data/quiz-data'
import { BibleVersesSection } from '@/components/BibleVersesSection'

export default function OverviewPage() {
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations('results')
  const tCommon = useTranslations('common')
  const sessionId = params.sessionId as string
  const [expandedGifts, setExpandedGifts] = useState<Set<string>>(new Set())
  const [expandedVerses, setExpandedVerses] = useState<Set<string>>(new Set())

  const { data: result, isLoading: loadingResults } = useResultBySessionId(sessionId)
  const { data: spiritualGiftsData, isLoading: loadingSpiritualGifts } = useSpiritualGifts(locale)
  const { data: categories, isLoading: loadingCategories } = useCategories(locale)

  const loading = loadingResults || loadingSpiritualGifts || loadingCategories

  const getGiftByKey = (key: string): SpiritualGiftData | undefined => {
    return spiritualGiftsData?.find(gift => gift.gift_key === key)
  }

  const getScorePercentage = (score: number, maxScoreInResults: number): number => {
    // Use the highest score in the results as 100% (relative strength)
    // This makes the visualization meaningful even for preview mode or partial tests
    return (score / maxScoreInResults) * 100
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!result || !spiritualGiftsData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t('dataNotAvailable')}</p>
      </div>
    )
  }

  const allScores = spiritualGiftsData.map(gift => ({
    giftKey: gift.gift_key,
    giftName: gift.name,
    definition: gift.definition,
    score: result.totalScore[gift.gift_key] || 0,
  }))

  const sortedScores = allScores.sort((a, b) => b.score - a.score)

  // Calculate max score from actual results (to handle preview mode or partial tests)
  const maxScoreInResults = Math.max(...allScores.map(s => s.score), 1)

  return (
    <div className="space-y-6">
      {/* Top Gifts Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {t('topGifts')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
            const percentage = getScorePercentage(score, maxScoreInResults)
            const giftData = getGiftByKey(giftKey)
            const isExpanded = expandedGifts.has(giftKey)

            return (
              <div key={giftKey}>
                <div
                  className="flex justify-between items-center mb-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors border border-gray-200 hover:border-blue-300"
                  onClick={() => toggleGiftExpansion(giftKey)}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center mt-1 bg-blue-50 p-1 rounded">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-blue-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {giftName}
                        <span className="text-xs text-blue-500 font-normal bg-blue-50 px-2 py-1 rounded">
                          {isExpanded ? t('clickToHide') : t('clickToExpand')}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-600">{definition}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{formatScore(score, 0)}</div>
                    <div className="text-sm text-gray-500">{tCommon('points')}</div>
                  </div>
                </div>

                <Progress value={percentage} className="h-3 mb-3" />
                <div className="text-sm text-gray-500 mb-3">
                  {t('affinity', { percentage: formatPercentage(percentage) })}
                </div>

                {/* Expanded Content */}
                {isExpanded && giftData && (
                  <div className="bg-gray-50 p-4 rounded-lg mt-3 space-y-4">
                    {/* Top Characteristics */}
                    {giftData.characteristics && giftData.characteristics.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                          <Lightbulb className="h-4 w-4" />
                          {t('expandedDetails.topCharacteristics')}
                        </h4>
                        <div className="space-y-2">
                          {giftData.characteristics.slice(0, 3).map((char, charIndex) => (
                            <div key={char.characteristic || `char-${giftKey}-${charIndex}`} className="flex items-start gap-2">
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
                            <div key={quality.quality_name || `quality-${giftKey}-${qualityIndex}`} className="flex items-start gap-2">
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

                    {/* Biblical References - Now from gift_bible_verses table */}
                    <BibleVersesSection
                      giftKey={giftKey}
                      locale={locale}
                      expandedVerses={expandedVerses}
                      setExpandedVerses={setExpandedVerses}
                    />

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.href = `/quiz/results/${sessionId}/characteristics`
                        }}
                      >
                        {t('expandedDetails.viewAllCharacteristics')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.href = `/quiz/results/${sessionId}/qualities`
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  )
}