'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lightbulb, AlertTriangle } from 'lucide-react'
import {
  useResultBySessionId,
  useSpiritualGifts,
  type SpiritualGiftData,
} from '@/hooks/use-quiz-queries'
import { useLocale, useTranslations } from 'next-intl'

export default function CharacteristicsPage() {
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
            <Lightbulb className="h-5 w-5" />
            Características Detalhadas
          </CardTitle>
          {topGiftData && (
            <p className="text-sm text-gray-600">
              Características do seu dom principal: <strong>{topGiftData.name}</strong>
            </p>
          )}
        </CardHeader>
        <CardContent>
          {topGiftData?.characteristics && topGiftData.characteristics.length > 0 ? (
            <div className="space-y-3">
              {topGiftData.characteristics.map((char, index) => (
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

      {/* All Gifts Characteristics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Características de Todos os Seus Dons
          </CardTitle>
          <p className="text-sm text-gray-600">
            Explore as características de todos os dons espirituais identificados no seu perfil
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {sortedScores.slice(0, 5).map(({ giftKey, score }) => {
            const giftData = spiritualGiftsData.find(gift => gift.gift_key === giftKey)
            if (!giftData) return null

            return (
              <div key={giftKey} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  {giftData.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{giftData.definition}</p>
                
                {giftData.characteristics && giftData.characteristics.length > 0 ? (
                  <div className="space-y-2">
                    {giftData.characteristics.map((char, charIndex) => (
                      <div key={charIndex} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700">{char.characteristic}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    {t('characteristicsNotAvailable')}
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