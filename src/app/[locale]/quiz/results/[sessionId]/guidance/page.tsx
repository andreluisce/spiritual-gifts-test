'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, BookOpen } from 'lucide-react'
import {
  useResultBySessionId,
  useSpiritualGifts
} from '@/hooks/use-quiz-queries'
import { useLocale, useTranslations } from 'next-intl'

export default function GuidancePage() {
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations('results')
  const sessionId = params.sessionId as string

  const { data: result, isLoading: loadingResults } = useResultBySessionId(sessionId)
  const { data: spiritualGiftsData, isLoading: loadingSpiritualGifts } = useSpiritualGifts(locale)

  const loading = loadingResults || loadingSpiritualGifts

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

  // Get top gift
  const sortedScores = Object.entries(result.totalScore)
    .map(([giftKey, score]) => ({ giftKey, score }))
    .sort((a, b) => b.score - a.score)

  const topGift = sortedScores[0]
  const topGiftData = spiritualGiftsData.find(gift => gift.gift_key === topGift?.giftKey)

  return (
    <div className="space-y-6">
      {/* Main Gift Guidance */}
      {topGiftData && (
        <>
          {/* Dangers/Precautions */}
          {topGiftData.dangers && topGiftData.dangers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                  {t('precautionsTitle')}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {t('precautionsDescription')}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topGiftData.dangers.map((danger, index) => (
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
          {topGiftData.misunderstandings && topGiftData.misunderstandings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <BookOpen className="h-5 w-5" />
                  {t('misunderstandingsTitle')}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {t('misunderstandingsDescription', { giftName: topGiftData.name })}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topGiftData.misunderstandings.map((misunderstanding, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700">{misunderstanding.misunderstanding}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Biblical References */}
          {topGiftData.detailed_biblical_references && topGiftData.detailed_biblical_references.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <BookOpen className="h-5 w-5" />
                  {t('biblicalReferencesTitle')}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {t('biblicalReferencesDescription')}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topGiftData.detailed_biblical_references.map((ref, index) => (
                    <div key={`biblical-ref-${index}-${ref.reference}`} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium border border-blue-300">
                          {ref.reference}
                        </div>
                        <div className="flex-1">
                          <blockquote className="text-blue-900 font-medium italic mb-2 border-l-4 border-blue-300 pl-3">
                            &quot;{ref.verse_text}&quot;
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
          )}
        </>
      )}

      {/* General Guidance for All Gifts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            {t('generalGuidanceTitle')}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {t('generalGuidanceDescription')}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {sortedScores.slice(0, 3).map(({ giftKey }) => {
            const giftData = spiritualGiftsData.find(gift => gift.gift_key === giftKey)
            if (!giftData) return null

            const hasDangers = giftData.dangers && giftData.dangers.length > 0
            const hasMisunderstandings = giftData.misunderstandings && giftData.misunderstandings.length > 0

            if (!hasDangers && !hasMisunderstandings) return null

            return (
              <div key={giftKey} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">
                  {giftData.name}
                </h3>

                {hasDangers && (
                  <div className="mb-4">
                    <h4 className="font-medium text-amber-700 mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Cuidados
                    </h4>
                    <div className="space-y-2">
                      {giftData.dangers?.map((danger, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">{danger.danger}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasMisunderstandings && (
                  <div>
                    <h4 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      Mal-entendidos
                    </h4>
                    <div className="space-y-2">
                      {giftData.misunderstandings?.map((misunderstanding, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">{misunderstanding.misunderstanding}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* If no guidance data available */}
      {(!topGiftData?.dangers || topGiftData.dangers.length === 0) &&
       (!topGiftData?.misunderstandings || topGiftData.misunderstandings.length === 0) &&
       (!topGiftData?.detailed_biblical_references || topGiftData.detailed_biblical_references.length === 0) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t('guidanceNotAvailable')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}