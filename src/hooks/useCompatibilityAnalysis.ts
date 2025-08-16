import { useState, useEffect } from 'react'
import { 
  dynamicCompatibilityAnalyzer,
  getMinistryRecommendations as getDynamicMinistryRecommendations,
  type DynamicGiftCompatibility,
  type DynamicMinistryRecommendation
} from '@/lib/dynamic-gift-compatibility'
import { aiCompatibilityAnalyzer, type UserGiftProfile } from '@/lib/ai-compatibility-analyzer'
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
          isLoading: false
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
        
        // Get AI-enhanced analysis
        let aiAnalysis = null
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
            locale: 'pt'
          }
          
          aiAnalysis = await aiCompatibilityAnalyzer.analyzeCompatibility(userProfile)
          
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
          dominantPattern: aiAnalysis?.personalizedInsights?.split('.')[0] || `Profile ${topGiftName.replace(/^[A-Z]_/, '')}`,
          balanceAnalysis: aiAnalysis?.strengthsDescription || (compatibilities.length > 0 
            ? `Your main gifts show ${compatibilities[0].synergyDescription}` 
            : 'Analysis in progress...'),
          developmentSuggestions: aiAnalysis?.practicalApplications || compatibilities.flatMap(c => c.strengthAreas).slice(0, 3)
        }

        setAnalysis({
          compatibilities,
          ministryRecommendations,
          insights,
          isLoading: false,
          hasAIAnalysis: !!(aiAnalysis && aiAnalysis.personalizedInsights && aiAnalysis.strengthsDescription),
          regenerateAnalysis: async () => {
            if (!giftScores) return
            
            setAnalysis(prev => ({ ...prev, isLoading: true }))
            
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
                locale: 'pt'
              }
              
              const newAiAnalysis = await aiCompatibilityAnalyzer.analyzeCompatibility(userProfile)
              
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
  }, [giftScores, topGiftsCount])

  return analysis
}