import { useState, useEffect } from 'react'
import { 
  dynamicCompatibilityAnalyzer,
  type DynamicGiftCompatibility,
  type DynamicMinistryRecommendation
} from '@/lib/dynamic-gift-compatibility'
import { aiCompatibilityAnalyzer, type UserGiftProfile } from '@/lib/ai-compatibility-analyzer'
import { useAuth } from '@/context/AuthContext'
import { useSpiritualGifts } from '@/hooks/use-quiz-queries'
import { useLocale } from 'next-intl'
import type { Database } from '@/lib/database.types'

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
  const { data: spiritualGiftsData } = useSpiritualGifts(locale)
  
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
    regenerateAnalysis: async () => {}
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
          regenerateAnalysis: async () => {}
        })
        return
      }

      try {
        setAnalysis(prev => ({ ...prev, isLoading: true }))
        
        // Use dynamic compatibility analyzer with AI
        const topGifts = Object.entries(giftScores)
          .sort(([,a], [,b]) => b - a)
          .slice(0, topGiftsCount)
          .map(([giftKey]) => giftKey)
        
        // Function to get gift name in correct language
        const getGiftName = (giftKey: string): string => {
          if (!spiritualGiftsData) {
            // Fallback mapping for Portuguese
            const fallbackNames: Record<string, string> = {
              'A_PROPHECY': 'Profecia',
              'B_SERVICE': 'Serviço',
              'C_TEACHING': 'Ensino',
              'D_EXHORTATION': 'Exortação',
              'E_GIVING': 'Doação',
              'F_LEADERSHIP': 'Liderança',
              'G_MERCY': 'Misericórdia'
            }
            return fallbackNames[giftKey] || giftKey.replace(/^[A-Z]_/, '')
          }
          
          const gift = spiritualGiftsData.find(g => g.gift_key === giftKey)
          return gift?.name || giftKey.replace(/^[A-Z]_/, '')
        }

        const compatibilities: DynamicGiftCompatibility[] = []
        const ministryRecommendations = await dynamicCompatibilityAnalyzer.getMinistryRecommendations(
          topGifts as Database['public']['Enums']['gift_key'][]
        )
        
        // Get compatibility data for each pair of top gifts
        for (let i = 0; i < topGifts.length; i++) {
          for (let j = i + 1; j < topGifts.length; j++) {
            const compatibility = await dynamicCompatibilityAnalyzer.getGiftCompatibility(
              topGifts[i] as Database['public']['Enums']['gift_key'],
              topGifts[j] as Database['public']['Enums']['gift_key']
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
                `Sua combinação de ${primaryGiftName} e ${secondaryGiftName} cria uma força única`,
                `${primaryGiftName} aprimora sua capacidade de ${secondaryGiftName.toLowerCase()}`,
                `Essa combinação é ideal para ministérios que requerem tanto ${primaryGiftName.toLowerCase()} quanto ${secondaryGiftName.toLowerCase()}`
              ],
              challenges: [
                `Balance o tempo entre exercer ${primaryGiftName} e ${secondaryGiftName}`,
                `Evite se sobrecarregar tentando usar todos os dons simultaneamente`
              ],
              description: `A união entre ${primaryGiftName} e ${secondaryGiftName} forma uma base sólida para o serviço cristão efetivo`
            }
          }
          
          const compatKey = `${topGifts[0]}_${topGifts[1]}`
          const compatData = giftCompatibilities[compatKey] || giftCompatibilities[`${topGifts[1]}_${topGifts[0]}`] || {
            score: 80,
            strengths: [`${primaryGiftName} e ${secondaryGiftName} se complementam naturalmente`],
            challenges: [`Continue desenvolvendo ambos os dons em equilíbrio`],
            description: `Seus dons principais trabalham em harmonia`
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
                  sessionId: window.location.pathname.split('/').slice(-2, -1)[0], // Get sessionId from URL (second to last segment)
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
                    const sessionId = window.location.pathname.split('/').pop()
                    await fetch('/api/ai-analysis', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      credentials: 'include',
                      body: JSON.stringify({
                        profile: userProfile,
                        sessionId: sessionId,
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
                      sessionId: window.location.pathname.split('/').pop(), // Get sessionId from URL
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
          regenerateAnalysis: async () => {}
        })
      }
    }

    analyzeCompatibility()
  }, [giftScores, topGiftsCount, locale, spiritualGiftsData, user])

  return analysis
}