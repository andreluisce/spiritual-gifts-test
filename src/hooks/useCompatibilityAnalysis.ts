import { useState, useEffect } from 'react'
import {
  dynamicCompatibilityAnalyzer,
  type DynamicGiftCompatibility,
  type DynamicMinistryRecommendation
} from '@/lib/dynamic-gift-compatibility'
import { aiCompatibilityAnalyzer, type UserGiftProfile } from '@/lib/ai-compatibility-analyzer'
import { useAuth } from '@/context/AuthContext'
import { useSpiritualGifts } from '@/hooks/use-quiz-queries'
import { useLocale, useTranslations } from 'next-intl'
import type { Database } from '@/lib/database.types'
import { createClient } from '@/lib/supabase-client'

// Helper function to extract sessionId from URL
function getSessionIdFromUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined

  const pathSegments = window.location.pathname.split('/').filter(Boolean)

  // Check if we're in a quiz results page: /[locale]/quiz/results/[sessionId]/...
  const quizResultsIndex = pathSegments.findIndex(segment => segment === 'results')
  if (quizResultsIndex !== -1 && pathSegments[quizResultsIndex + 1]) {
    const potentialSessionId = pathSegments[quizResultsIndex + 1]
    // Validate it looks like a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (uuidRegex.test(potentialSessionId)) {
      return potentialSessionId
    }
  }

  // For other pages (like dashboard), return undefined
  return undefined
}

interface CompatibilityAnalysisResult {
  compatibilities: DynamicGiftCompatibility[]
  ministryRecommendations: DynamicMinistryRecommendation[]
  insights: {
    dominantPattern: string
    balanceAnalysis: string
    developmentSuggestions: string[]
  }
  isLoading: boolean
  hasAIAnalysis: boolean
  regenerateAnalysis: () => Promise<void>
}

export function useCompatibilityAnalysis(
  giftScores: Record<string, number> | null | undefined,
  topGiftsCount: number = 3
): CompatibilityAnalysisResult {
  const { user } = useAuth()
  const locale = useLocale()
  const t = useTranslations('results.compatibility')
  const { data: spiritualGiftsData } = useSpiritualGifts(locale)
  const supabase = createClient()

  const [analysis, setAnalysis] = useState<CompatibilityAnalysisResult>({
    compatibilities: [],
    ministryRecommendations: [],
    insights: {
      dominantPattern: '',
      balanceAnalysis: '',
      developmentSuggestions: []
    },
    isLoading: true,
    hasAIAnalysis: false,
    regenerateAnalysis: async () => { }
  })

  useEffect(() => {
    const analyzeCompatibility = async () => {

      if (!giftScores || Object.keys(giftScores).length === 0) {
        setAnalysis({
          compatibilities: [],
          ministryRecommendations: [],
          insights: {
            dominantPattern: '',
            balanceAnalysis: '',
            developmentSuggestions: []
          },
          isLoading: false,
          hasAIAnalysis: false,
          regenerateAnalysis: async () => { }
        })
        return
      }

      try {
        setAnalysis(prev => ({ ...prev, isLoading: true }))

        const normalizeList = (value: unknown): string[] => {
          if (!Array.isArray(value)) return []
          return value
            .map((item: unknown) => {
              if (typeof item === 'string') return item
              if (typeof item === 'object' && item !== null) {
                const obj = item as Record<string, unknown>
                return obj.text || obj.description || obj.value || obj.name || obj.item || obj.detail || obj.area || obj.responsibility
              }
              return null
            })
            .filter(Boolean) as string[]
        }

        const createPairKey = (a: string, b: string) => {
          return a <= b ? `${a}_${b}` : `${b}_${a}`
        }

        // Use dynamic compatibility analyzer with AI
        const topGifts = Object.entries(giftScores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, topGiftsCount)
          .map(([giftKey]) => giftKey)

        // Function to get gift name in correct language
        const getGiftName = (giftKey: string): string => {
          if (!spiritualGiftsData) {
            // Fallback mapping for different locales
            const fallbackNames: Record<string, Record<string, string>> = {
              'pt': {
                'A_PROPHECY': 'Profecia',
                'B_SERVICE': 'Serviço',
                'C_TEACHING': 'Ensino',
                'D_EXHORTATION': 'Exortação',
                'E_GIVING': 'Doação',
                'F_LEADERSHIP': 'Liderança',
                'G_MERCY': 'Misericórdia'
              },
              'en': {
                'A_PROPHECY': 'Prophecy',
                'B_SERVICE': 'Service',
                'C_TEACHING': 'Teaching',
                'D_EXHORTATION': 'Exhortation',
                'E_GIVING': 'Giving',
                'F_LEADERSHIP': 'Leadership',
                'G_MERCY': 'Mercy'
              },
              'es': {
                'A_PROPHECY': 'Profecía',
                'B_SERVICE': 'Servicio',
                'C_TEACHING': 'Enseñanza',
                'D_EXHORTATION': 'Exhortación',
                'E_GIVING': 'Donación',
                'F_LEADERSHIP': 'Liderazgo',
                'G_MERCY': 'Misericordia'
              }
            }
            return fallbackNames[locale]?.[giftKey] || giftKey.replace(/^[A-Z]_/, '')
          }

          const gift = spiritualGiftsData.find(g => g.gift_key === giftKey)
          return gift?.name || giftKey.replace(/^[A-Z]_/, '')
        }

        const compatibilities: DynamicGiftCompatibility[] = []

        // Prefer curated insights from the new tables; fallback to existing RPCs
        const fetchPairInsight = async (a: string, b: string) => {
          const { data } = await supabase
            .from('gift_pair_insights')
            .select('synergy_score, summary, strengths, risks, mitigations, examples')
            .eq('pair_key', createPairKey(a, b))
            .eq('language', locale)
            .eq('status', 'active')
            .order('version', { ascending: false })
            .limit(1)
            .maybeSingle()

          return data
        }

        const fetchMinistryRecommendations = async (): Promise<DynamicMinistryRecommendation[]> => {
          const { data } = await supabase
            .from('ministry_recommendations')
            .select('ministry_key, ministry_name, description, gifts_match, fit_score, why_fit, responsibilities, growth_areas, success_metrics, spiritual_practices')
            .eq('language', locale)
            .eq('status', 'active')
            .order('version', { ascending: false })

          if (!data || data.length === 0) return []

          return data.map((row: {
            ministry_key: string;
            ministry_name: string;
            description: string | null;
            gifts_match: unknown;
            fit_score: unknown;
            why_fit: string | null;
            responsibilities: unknown;
            growth_areas: unknown;
            success_metrics: unknown;
            spiritual_practices: unknown;
          }) => {
            const giftsMatch = Array.isArray(row.gifts_match) ? row.gifts_match : []
            const matched = giftsMatch.filter((g: unknown) => topGifts.includes(g as string)).length
            const totalRequired = giftsMatch.length || topGifts.length || 1
            const scoreFromRow = typeof row.fit_score === 'number' ? row.fit_score : Math.round((matched / totalRequired) * 100)

            return {
              ministryKey: row.ministry_key,
              ministryName: row.ministry_name,
              description: row.description || row.why_fit || '',
              compatibilityScore: scoreFromRow,
              matchedGifts: matched,
              totalRequired,
              responsibilities: normalizeList(row.responsibilities),
              growthAreas: normalizeList(row.growth_areas),
              successMetrics: normalizeList(row.success_metrics),
              spiritualPractices: normalizeList(row.spiritual_practices)
            }
          })
        }

        const ministryRecommendations = await (async () => {
          const fromDb = await fetchMinistryRecommendations()
          if (fromDb.length > 0) return fromDb
          return await dynamicCompatibilityAnalyzer.getMinistryRecommendations(
            topGifts as Database['public']['Enums']['gift_key'][],
            locale
          )
        })()

        // Get compatibility data for each pair of top gifts
        for (let i = 0; i < topGifts.length; i++) {
          for (let j = i + 1; j < topGifts.length; j++) {
            const curated = await fetchPairInsight(topGifts[i], topGifts[j])

            if (curated) {
              compatibilities.push({
                primaryGift: topGifts[i],
                secondaryGifts: [topGifts[j]],
                compatibilityScore: typeof curated.synergy_score === 'number' ? curated.synergy_score : 75,
                strengthAreas: normalizeList(curated.strengths),
                potentialChallenges: normalizeList(curated.risks),
                mitigations: normalizeList(curated.mitigations),
                examples: normalizeList(curated.examples),
                synergyDescription: curated.summary || 'Análise de compatibilidade'
              })
              continue
            }

            const compatibility = await dynamicCompatibilityAnalyzer.getGiftCompatibility(
              topGifts[i] as Database['public']['Enums']['gift_key'],
              topGifts[j] as Database['public']['Enums']['gift_key'],
              locale
            )

            if (compatibility && compatibility.compatibilityScore !== undefined) {
              compatibilities.push({
                primaryGift: topGifts[i],
                secondaryGifts: [topGifts[j]],
                compatibilityScore: compatibility.compatibilityScore,
                strengthAreas: (compatibility.strengths || []).map(s => typeof s === 'string' ? s : s.strength),
                potentialChallenges: (compatibility.challenges || []).map(c => typeof c === 'string' ? c : c.challenge),
                synergyDescription: compatibility.description || 'Análise de compatibilidade'
              })
            }
          }
        }

        // If no compatibilities were found, create meaningful fallback compatibilities
        if (compatibilities.length === 0 && topGifts.length >= 2) {

          // Create compatibility between top 2 gifts
          const primaryGiftName = getGiftName(topGifts[0])
          const secondaryGiftName = getGiftName(topGifts[1])

          // Create meaningful compatibility based on gift combinations
          const giftCompatibilities = {
            [`${topGifts[0]}_${topGifts[1]}`]: {
              score: 85,
              strengths: [
                t('fallbackSynergy.combinationStrength', { primary: primaryGiftName, secondary: secondaryGiftName }),
                t('fallbackSynergy.enhancesCapability', { primary: primaryGiftName, secondary: secondaryGiftName.toLowerCase() }),
                t('fallbackSynergy.idealCombination', { primary: primaryGiftName.toLowerCase(), secondary: secondaryGiftName.toLowerCase() })
              ],
              challenges: [
                t('fallbackSynergy.balanceTime', { primary: primaryGiftName, secondary: secondaryGiftName }),
                t('fallbackSynergy.avoidOverload')
              ],
              description: t('fallbackSynergy.unionDescription', { primary: primaryGiftName, secondary: secondaryGiftName })
            }
          }

          const compatKey = `${topGifts[0]}_${topGifts[1]}`
          const compatData = giftCompatibilities[compatKey] || giftCompatibilities[`${topGifts[1]}_${topGifts[0]}`] || {
            score: 80,
            strengths: [t('fallbackSynergy.naturalComplement', { primary: primaryGiftName, secondary: secondaryGiftName })],
            challenges: [t('fallbackSynergy.continueBalancing')],
            description: t('fallbackSynergy.worksInHarmony')
          }

          compatibilities.push({
            primaryGift: topGifts[0],
            secondaryGifts: [topGifts[1]],
            compatibilityScore: compatData.score,
            strengthAreas: compatData.strengths,
            potentialChallenges: compatData.challenges,
            synergyDescription: compatData.description
          })
        }

        // Get AI-enhanced analysis
        let aiAnalysis = null
        try {

          const userProfile: UserGiftProfile = {
            primaryGift: {
              key: topGifts[0] as Database['public']['Enums']['gift_key'],
              name: getGiftName(topGifts[0]),
              score: giftScores[topGifts[0]] || 0
            },
            secondaryGifts: topGifts.slice(1, 3).map(giftKey => ({
              key: giftKey as Database['public']['Enums']['gift_key'],
              name: getGiftName(giftKey),
              score: giftScores[giftKey] || 0
            })),
            locale: locale
          }

          // Choose analysis method based on authentication status
          if (user) {
            // User is logged in - use secure server-side API
            try {
              const response = await fetch('/api/ai-analysis', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for authentication
                body: JSON.stringify({
                  profile: userProfile,
                  ...(getSessionIdFromUrl() && { sessionId: getSessionIdFromUrl() }),
                  useCache: true,
                  locale: locale
                })
              })


              if (response.ok) {
                const { analysis } = await response.json()
                aiAnalysis = analysis
              } else if (response.status === 401) {
                console.warn('🔒 useCompatibilityAnalysis: Authentication failed, falling back to client-side')
                throw new Error('Authentication failed - using fallback')
              } else {
                console.error('❌ useCompatibilityAnalysis: Server-side API failed:', response.status)
                throw new Error(`API response: ${response.status}`)
              }
            } catch (serverError) {
              console.warn('Server-side AI analysis failed, trying client-side fallback:', serverError)
              // Even for logged-in users, try client-side as fallback
              try {
                aiAnalysis = await aiCompatibilityAnalyzer.analyzeCompatibility(userProfile, locale)

                // Try to save client-side analysis to cache if user is logged in
                if (user && aiAnalysis) {
                  try {
                    await fetch('/api/ai-analysis', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      credentials: 'include',
                      body: JSON.stringify({
                        profile: userProfile,
                        ...(getSessionIdFromUrl() && { sessionId: getSessionIdFromUrl() }),
                        useCache: false,
                        clientAnalysis: aiAnalysis, // Include pre-computed analysis
                        locale: locale
                      })
                    })
                  } catch (cacheError) {
                    console.warn('⚠️ useCompatibilityAnalysis: Failed to save client analysis to cache:', cacheError)
                  }
                }
              } catch (clientError) {
                console.error('❌ useCompatibilityAnalysis: Both server-side and client-side failed:', clientError)
                aiAnalysis = null
              }
            }
          } else {
            // User not logged in - use client-side analysis with potential API key exposure risk
            aiAnalysis = await aiCompatibilityAnalyzer.analyzeCompatibility(userProfile, locale)
          }

          // Enhance compatibilities with AI insights
          if (aiAnalysis && compatibilities.length > 0) {
            compatibilities[0].aiEnhancedAnalysis = aiAnalysis
          }
        } catch (error) {
          console.warn('AI analysis failed, using fallback insights:', error)
        }

        // Generate insights from AI analysis or fallback to compatibility analysis
        const topGiftName = topGifts[0] || 'Unknown'
        const insights = {
          dominantPattern: aiAnalysis?.personalizedInsights
            ? aiAnalysis.personalizedInsights.split('.')[0] + '.'
            : `Perfil ${topGiftName.replace(/^[A-Z]_/, '')}`,
          balanceAnalysis: aiAnalysis?.strengthsDescription || (compatibilities.length > 0
            ? `Seus principais dons mostram ${compatibilities[0].synergyDescription}`
            : 'Análise em progresso...'),
          developmentSuggestions: aiAnalysis?.practicalApplications || compatibilities.flatMap(c => c.strengthAreas).slice(0, 3)
        }

        const hasAIAnalysisResult = !!(aiAnalysis && aiAnalysis.personalizedInsights && aiAnalysis.strengthsDescription)

        setAnalysis({
          compatibilities,
          ministryRecommendations,
          insights,
          isLoading: false,
          hasAIAnalysis: hasAIAnalysisResult,
          regenerateAnalysis: async () => {
            if (!giftScores) return

            setAnalysis(prev => ({ ...prev, isLoading: true }))

            try {
              const userProfile: UserGiftProfile = {
                primaryGift: {
                  key: topGifts[0] as Database['public']['Enums']['gift_key'],
                  name: getGiftName(topGifts[0]),
                  score: giftScores[topGifts[0]] || 0
                },
                secondaryGifts: topGifts.slice(1, 3).map(giftKey => ({
                  key: giftKey as Database['public']['Enums']['gift_key'],
                  name: getGiftName(giftKey),
                  score: giftScores[giftKey] || 0
                })),
                locale: locale
              }

              // Choose analysis method based on authentication status
              let newAiAnalysis = null
              if (user) {
                // User is logged in - use secure server-side API with fallback
                try {
                  const response = await fetch('/api/ai-analysis', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    credentials: 'include', // Include cookies for authentication
                    body: JSON.stringify({
                      profile: userProfile,
                      ...(getSessionIdFromUrl() && { sessionId: getSessionIdFromUrl() }),
                      useCache: false,
                      locale: locale
                    })
                  })

                  if (response.ok) {
                    const { analysis } = await response.json()
                    newAiAnalysis = analysis
                  } else if (response.status === 401) {
                    console.warn('🔒 Regenerate: Authentication failed, falling back to client-side')
                    throw new Error('Authentication failed - using fallback')
                  } else {
                    console.error('❌ Regenerate: Server-side API failed:', response.status)
                    throw new Error(`API error: ${response.status}`)
                  }
                } catch (serverError) {
                  console.warn('Regenerate: Server-side failed, trying client-side fallback:', serverError)
                  try {
                    newAiAnalysis = await aiCompatibilityAnalyzer.analyzeCompatibility(userProfile, locale)
                  } catch (clientError) {
                    console.error('❌ Regenerate: Both server-side and client-side failed:', clientError)
                    newAiAnalysis = null
                  }
                }
              } else {
                // User not logged in - use client-side analysis
                newAiAnalysis = await aiCompatibilityAnalyzer.analyzeCompatibility(userProfile, locale)
              }

              if (newAiAnalysis) {
                const newInsights = {
                  dominantPattern: newAiAnalysis.personalizedInsights?.split('.')[0] || insights.dominantPattern,
                  balanceAnalysis: newAiAnalysis.strengthsDescription || insights.balanceAnalysis,
                  developmentSuggestions: newAiAnalysis.practicalApplications || insights.developmentSuggestions
                }

                setAnalysis(prev => ({
                  ...prev,
                  insights: newInsights,
                  hasAIAnalysis: true,
                  isLoading: false
                }))
              } else {
                setAnalysis(prev => ({ ...prev, isLoading: false }))
              }
            } catch (error) {
              console.error('Error regenerating AI analysis:', error)
              setAnalysis(prev => ({ ...prev, isLoading: false }))
            }
          }
        })
      } catch (error) {
        console.error('Error in compatibility analysis:', error)
        setAnalysis({
          compatibilities: [],
          ministryRecommendations: [],
          insights: {
            dominantPattern: 'Analysis Error',
            balanceAnalysis: 'Unable to complete analysis at this time.',
            developmentSuggestions: []
          },
          isLoading: false,
          hasAIAnalysis: false,
          regenerateAnalysis: async () => { }
        })
      }
    }

    analyzeCompatibility()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giftScores, topGiftsCount, locale, spiritualGiftsData, user, t])

  return analysis
}
