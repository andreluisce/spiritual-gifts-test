'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Star,
  Lightbulb,
  ArrowRight,
  Award,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import { useCompatibilityAnalysis } from '@/hooks/useCompatibilityAnalysis'
import { spiritualGifts } from '@/data/quiz-data'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface CompatibilityAnalysisProps {
  giftScores: Record<string, number>
  className?: string
}

export default function CompatibilityAnalysis({ giftScores, className }: CompatibilityAnalysisProps) {
  const t = useTranslations('results.compatibility')
  const { compatibilities, ministryRecommendations, insights, hasAIAnalysis, isLoading, regenerateAnalysis } = useCompatibilityAnalysis(giftScores)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateAIAnalysis = async () => {
    setIsGenerating(true)
    try {
      await regenerateAnalysis()
    } catch (error) {
      console.error('Error generating AI analysis:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getGiftName = (giftKey: string): string => {
    return spiritualGifts.find(g => g.key === giftKey)?.name || giftKey
  }

  const getCompatibilityColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-blue-600 bg-blue-50'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getCompatibilityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4" />
    if (score >= 60) return <Star className="h-4 w-4" />
    if (score >= 40) return <TrendingUp className="h-4 w-4" />
    return <AlertTriangle className="h-4 w-4" />
  }

  if (compatibilities.length === 0 && ministryRecommendations.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            Complete o teste para ver sua análise de compatibilidade
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Gift Combination Insights */}
      {insights.dominantPattern && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                {t('profileAnalysis')}
                {hasAIAnalysis && (
                  <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border-purple-200">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {t('aiBadge')}
                  </Badge>
                )}
              </div>
              {!hasAIAnalysis && !isLoading && (
                <Button
                  onClick={handleGenerateAIAnalysis}
                  disabled={isGenerating}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {t('generating')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t('generateAI')}
                    </>
                  )}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">{t('dominantPattern')}:</span>
                <Badge variant="outline" className="font-medium">
                  {insights.dominantPattern}
                </Badge>
              </div>
              <p className="text-gray-700 text-sm">{insights.balanceAnalysis}</p>
            </div>

            {insights.developmentSuggestions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  {t('developmentSuggestions')}
                </h4>
                <div className="space-y-2">
                  {insights.developmentSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasAIAnalysis && (
              <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-700 mb-2 font-medium">
                  <Sparkles className="h-4 w-4 inline mr-1" />
                  {t('basicAnalysis')}
                </p>
                <p className="text-xs text-purple-600">
                  {t('aiDescription')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Gift Compatibility Analysis */}
      {compatibilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Compatibilidade entre Seus Dons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {compatibilities.map((compatibility, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-lg">
                      {getGiftName(compatibility.primaryGift)}
                    </h4>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="flex gap-1">
                      {compatibility.secondaryGifts.map((gift, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {getGiftName(gift)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getCompatibilityColor(compatibility.compatibilityScore)}`}>
                    {getCompatibilityIcon(compatibility.compatibilityScore)}
                    <span className="font-semibold text-sm">
                      {compatibility.compatibilityScore}%
                    </span>
                  </div>
                </div>

                <Progress value={compatibility.compatibilityScore} className="mb-3" />

                {compatibility.synergyDescription && (
                  <p className="text-gray-600 text-sm mb-3">
                    {compatibility.synergyDescription}
                  </p>
                )}

                {compatibility.strengthAreas.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium text-green-700 text-sm mb-2 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Áreas de Força
                    </h5>
                    <div className="space-y-1">
                      {compatibility.strengthAreas.map((area, idx) => (
                        <p key={idx} className="text-xs text-gray-600 pl-4">
                          • {area}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {compatibility.potentialChallenges.length > 0 && (
                  <div>
                    <h5 className="font-medium text-yellow-700 text-sm mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Pontos de Atenção
                    </h5>
                    <div className="space-y-1">
                      {compatibility.potentialChallenges.map((challenge, idx) => (
                        <p key={idx} className="text-xs text-gray-600 pl-4">
                          • {challenge}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Ministry Recommendations */}
      {ministryRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Ministérios Recomendados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ministryRecommendations.map((ministry, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">{ministry.ministryName}</h4>
                    <p className="text-gray-600 text-sm mb-2">{ministry.description}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getCompatibilityColor(ministry.compatibilityScore)} ml-4`}>
                    <Star className="h-4 w-4" />
                    <span className="font-semibold text-sm">
                      {ministry.compatibilityScore}%
                    </span>
                  </div>
                </div>

                <Progress value={ministry.compatibilityScore} className="mb-3" />

                <div className="grid md:grid-cols-2 gap-4">
                  {ministry.responsibilities.length > 0 && (
                    <div>
                      <h5 className="font-medium text-blue-700 text-sm mb-2 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Principais Responsabilidades
                      </h5>
                      <div className="space-y-1">
                        {ministry.responsibilities.slice(0, 3).map((responsibility, idx) => (
                          <p key={idx} className="text-xs text-gray-600 pl-4">
                            • {responsibility}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {ministry.growthAreas.length > 0 && (
                    <div>
                      <h5 className="font-medium text-purple-700 text-sm mb-2 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Áreas de Crescimento
                      </h5>
                      <div className="space-y-1">
                        {ministry.growthAreas.slice(0, 3).map((area, idx) => (
                          <p key={idx} className="text-xs text-gray-600 pl-4">
                            • {area}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-3" />

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>
                      <strong>Dons Essenciais:</strong> {ministry.requiredGifts.map(g => getGiftName(g)).join(', ')}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {ministry.compatibilityScore >= 80 ? 'Altamente Recomendado' : 
                     ministry.compatibilityScore >= 60 ? 'Recomendado' : 'Considerar'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}