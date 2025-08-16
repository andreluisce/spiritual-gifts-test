'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Sparkles, Info } from 'lucide-react'
import {
  useResultBySessionId,
} from '@/hooks/use-quiz-queries'
import CompatibilityAnalysis from '@/components/CompatibilityAnalysis'
import { useTranslations } from 'next-intl'

export default function CompatibilityPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const t = useTranslations('results')

  const { data: result, isLoading: loadingResults } = useResultBySessionId(sessionId)

  if (loadingResults) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!result || !result.totalScore) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t('compatibilityDataNotAvailable')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            {t('tabs.compatibility')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">{t('compatibilityAndAI')}</p>
              <p>
                {t('compatibilityDescription')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {t('personalizedAnalysisAI')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CompatibilityAnalysis 
            giftScores={result.totalScore}
          />
        </CardContent>
      </Card>
    </div>
  )
}