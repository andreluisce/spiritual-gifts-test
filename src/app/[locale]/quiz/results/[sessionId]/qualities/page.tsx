'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Target, AlertTriangle } from 'lucide-react'
import {
  useResultBySessionId,
  useSpiritualGifts,
} from '@/hooks/use-quiz-queries'
import { useLocale, useTranslations } from 'next-intl'

export default function QualitiesPage() {
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
        <p className="text-gray-500">Dados não disponíveis</p>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Qualidades a Desenvolver
          </CardTitle>
          {topGiftData && (
            <p className="text-sm text-gray-600">
              Qualidades recomendadas para o seu dom principal: <strong>{topGiftData.name}</strong>
            </p>
          )}
        </CardHeader>
        <CardContent>
          {topGiftData?.qualities && topGiftData.qualities.length > 0 ? (
            <div className="space-y-4">
              {topGiftData.qualities.map((quality, index) => (
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

      {/* All Gifts Qualities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Qualidades para Todos os Seus Dons
          </CardTitle>
          <p className="text-sm text-gray-600">
            Qualidades recomendadas para desenvolver cada um dos seus dons espirituais
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {sortedScores.slice(0, 5).map(({ giftKey, score }) => {
            const giftData = spiritualGiftsData.find(gift => gift.gift_key === giftKey)
            if (!giftData) return null

            return (
              <div key={giftKey} className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  {giftData.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{giftData.definition}</p>
                
                {giftData.qualities && giftData.qualities.length > 0 ? (
                  <div className="space-y-3">
                    {giftData.qualities.map((quality, qualityIndex) => (
                      <div key={qualityIndex} className="bg-green-50 p-3 rounded-lg">
                        <h4 className="font-medium text-green-800">{quality.quality_name}</h4>
                        {quality.description && (
                          <p className="text-sm text-green-700 mt-1">{quality.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    {t('qualitiesNotAvailable')}
                  </p>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}