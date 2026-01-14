'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sparkles, Brain, Target, TrendingUp, 
  Lightbulb, Users, Star, RefreshCw,
  AlertCircle, CheckCircle2, ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { type UserGiftProfile, type AICompatibilityAnalysis } from '@/lib/ai-compatibility-analyzer'
import type { Database } from '@/lib/database.types'
import { useTranslations } from 'next-intl'

interface AIInsightsProps {
  giftScores: Record<string, number>
  topGifts: string[]
  sessionId?: string
  locale?: string
  className?: string
}

export default function AIInsights({ giftScores, topGifts, sessionId, locale = 'pt', className }: AIInsightsProps) {
  const t = useTranslations('aiInsights')
  const [aiAnalysis, setAiAnalysis] = useState<AICompatibilityAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  const generateAIAnalysis = useCallback(async () => {
    if (topGifts.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const userProfile: UserGiftProfile = {
        primaryGift: {
          key: topGifts[0] as Database['public']['Enums']['gift_key'],
          name: topGifts[0]?.replace(/^[A-Z]_/, '') || 'Unknown',
          score: giftScores[topGifts[0]] || 0
        },
        secondaryGifts: topGifts.slice(1, 3).map(giftKey => ({
          key: giftKey as Database['public']['Enums']['gift_key'],
          name: giftKey.replace(/^[A-Z]_/, ''),
          score: giftScores[giftKey] || 0
        })),
        locale
      }

      // Call server-side API route
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: userProfile,
          sessionId,
          useCache: true
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const { analysis } = await response.json()
      setAiAnalysis(analysis)
      setHasAnalyzed(true)
    } catch (err) {
      console.error('AI Analysis Error:', err)
      setError(t('error'))
    } finally {
      setIsLoading(false)
    }
  }, [topGifts, giftScores, sessionId, locale, t])

  // Auto-generate on mount if we have data
  useEffect(() => {
    if (topGifts.length > 0 && !hasAnalyzed) {
      generateAIAnalysis()
    }
  }, [topGifts, hasAnalyzed, generateAIAnalysis])

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50'
    if (confidence >= 60) return 'text-blue-600 bg-blue-50'
    if (confidence >= 40) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircle2 className="h-4 w-4" />
    if (confidence >= 60) return <Star className="h-4 w-4" />
    if (confidence >= 40) return <TrendingUp className="h-4 w-4" />
    return <AlertCircle className="h-4 w-4" />
  }

  if (topGifts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-12">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {t('completeTest')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {t('title')}
          <Badge variant="outline" className="ml-auto text-xs">
            {t('beta')}
          </Badge>
        </CardTitle>
        {aiAnalysis && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {t('basedOnGifts')}
            </p>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${getConfidenceColor(aiAnalysis.confidence)}`}>
              {getConfidenceIcon(aiAnalysis.confidence)}
              <span className="font-semibold">
                {t('confidence', { value: aiAnalysis.confidence })}
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="h-8 w-8 text-purple-600 mx-auto mb-4" />
              </motion.div>
              <p className="text-purple-700 font-medium">
                {t('loading')}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {t('loadingSub')}
              </p>
            </motion.div>
          )}

          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex-1">
                  {error}
                </AlertDescription>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateAIAnalysis}
                  className="ml-2"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {t('retry')}
                </Button>
              </Alert>
            </motion.div>
          )}

          {aiAnalysis && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Personalized Insights */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  <h4 className="font-semibold text-gray-800">{t('personalizedAnalysis')}</h4>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {aiAnalysis.personalizedInsights}
                </p>
              </div>

              <Separator />

              {/* Strengths Description */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-gray-800">{t('strengths')}</h4>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {aiAnalysis.strengthsDescription}
                </p>
              </div>

              <Separator />

              {/* Development Plan */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-gray-800">{t('developmentPlan')}</h4>
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {aiAnalysis.developmentPlan}
                </p>
                
                {/* Practical Applications */}
                {aiAnalysis.practicalApplications.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-700 text-sm">{t('practicalApplications')}</h5>
                    {aiAnalysis.practicalApplications.map((application, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{application}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Ministry Recommendations */}
              {aiAnalysis.ministryRecommendations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-purple-600" />
                    <h4 className="font-semibold text-gray-800">{t('ministryRecommendations')}</h4>
                  </div>
                  <div className="space-y-2">
                    {aiAnalysis.ministryRecommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Challenges Guidance */}
              {aiAnalysis.challengesGuidance && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <h4 className="font-semibold text-gray-800">{t('challenges')}</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {aiAnalysis.challengesGuidance}
                    </p>
                  </div>
                </>
              )}

              {/* Action Button */}
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateAIAnalysis}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  {t('regenerate')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
