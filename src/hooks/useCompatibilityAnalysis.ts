import { useMemo } from 'react'
import { 
  analyzeGiftCompatibility, 
  getMinistryRecommendations,
  getGiftCombinationInsights,
  type GiftCompatibility,
  type MinistryRecommendation
} from '@/lib/gift-compatibility'

interface CompatibilityAnalysisResult {
  compatibilities: GiftCompatibility[]
  ministryRecommendations: MinistryRecommendation[]
  insights: {
    dominantPattern: string
    balanceAnalysis: string
    developmentSuggestions: string[]
  }
  isLoading: boolean
}

export function useCompatibilityAnalysis(
  giftScores: Record<string, number> | null | undefined,
  topGiftsCount: number = 3
): CompatibilityAnalysisResult {
  
  const analysis = useMemo(() => {
    if (!giftScores || Object.keys(giftScores).length === 0) {
      return {
        compatibilities: [],
        ministryRecommendations: [],
        insights: {
          dominantPattern: '',
          balanceAnalysis: '',
          developmentSuggestions: []
        },
        isLoading: false
      }
    }

    const compatibilities = analyzeGiftCompatibility(giftScores, topGiftsCount)
    const ministryRecommendations = getMinistryRecommendations(giftScores, topGiftsCount)
    const insights = getGiftCombinationInsights(giftScores)

    return {
      compatibilities,
      ministryRecommendations,
      insights,
      isLoading: false
    }
  }, [giftScores, topGiftsCount])

  return analysis
}