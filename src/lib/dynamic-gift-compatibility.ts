// Dynamic Gift Compatibility System with AI Enhancement
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { 
  aiCompatibilityAnalyzer, 
  type UserGiftProfile, 
  type AICompatibilityAnalysis 
} from './ai-compatibility-analyzer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface DynamicGiftCompatibility {
  primaryGift: string
  secondaryGifts: string[]
  compatibilityScore: number
  strengthAreas: string[]
  potentialChallenges: string[]
  synergyDescription: string
  aiEnhancedAnalysis?: AICompatibilityAnalysis
}

export interface DynamicMinistryRecommendation {
  ministryKey: string
  ministryName: string
  description: string
  compatibilityScore: number
  matchedGifts: number
  totalRequired: number
  responsibilities: string[]
  growthAreas: string[]
  aiInsights?: string
}

export interface GiftSynergyData {
  synergyLevel: 'strong' | 'moderate' | 'challenge'
  description: string
  compatibilityScore: number
  strengths: Array<{
    strength: string
    order: number
  }>
  challenges: Array<{
    challenge: string
    solution: string
    order: number
  }>
}

class DynamicCompatibilityAnalyzer {
  
  /**
   * Get compatibility analysis between two gifts
   */
  async getGiftCompatibility(
    primaryGift: Database['public']['Enums']['gift_key'],
    secondaryGift: Database['public']['Enums']['gift_key'],
    locale: string = 'pt'
  ): Promise<GiftSynergyData | null> {
    try {
      const { data, error } = await supabase.rpc('get_gift_compatibility', {
        p_primary_gift: primaryGift,
        p_secondary_gift: secondaryGift,
        p_locale: locale
      })

      if (error) {
        console.error('Error fetching gift compatibility:', error)
        return null
      }

      return data as GiftSynergyData
    } catch (error) {
      console.error('Error in getGiftCompatibility:', error)
      return null
    }
  }

  /**
   * Get ministry recommendations based on user's gifts
   */
  async getMinistryRecommendations(
    userGifts: Database['public']['Enums']['gift_key'][],
    locale: string = 'pt'
  ): Promise<DynamicMinistryRecommendation[]> {
    try {
      const { data, error } = await supabase.rpc('get_ministry_recommendations', {
        p_user_gifts: userGifts,
        p_locale: locale
      })

      if (error) {
        console.error('Error fetching ministry recommendations:', error)
        return []
      }

      return (data || []).map((ministry: any) => ({
        ministryKey: ministry.ministry_key,
        ministryName: ministry.ministry_name,
        description: ministry.description,
        compatibilityScore: ministry.compatibility_score,
        matchedGifts: ministry.matched_gifts,
        totalRequired: ministry.total_required,
        responsibilities: ministry.responsibilities?.map((r: any) => r.responsibility) || [],
        growthAreas: ministry.growth_areas?.map((g: any) => g.area) || []
      }))
    } catch (error) {
      console.error('Error in getMinistryRecommendations:', error)
      return []
    }
  }

  /**
   * Comprehensive compatibility analysis with AI enhancement
   */
  async analyzeUserGiftProfile(
    userProfile: UserGiftProfile,
    includeAI: boolean = true
  ): Promise<DynamicGiftCompatibility> {
    const { primaryGift, secondaryGifts } = userProfile
    
    // Get structured compatibility data from database
    const compatibilityPromises = secondaryGifts.map(secondaryGift =>
      this.getGiftCompatibility(primaryGift.key, secondaryGift.key)
    )
    
    const compatibilityResults = await Promise.all(compatibilityPromises)
    
    // Calculate overall compatibility score
    const validResults = compatibilityResults.filter(Boolean) as GiftSynergyData[]
    const avgCompatibilityScore = validResults.length > 0
      ? validResults.reduce((sum, result) => sum + result.compatibilityScore, 0) / validResults.length
      : 70
    
    // Extract strengths and challenges
    const strengthAreas = validResults.flatMap(result => 
      result.strengths.map(s => s.strength)
    )
    
    const potentialChallenges = validResults.flatMap(result =>
      result.challenges.map(c => c.challenge)
    )
    
    // Generate AI-enhanced analysis if requested
    let aiEnhancedAnalysis: AICompatibilityAnalysis | undefined
    if (includeAI) {
      try {
        const structuredData = {
          compatibilityResults: validResults,
          avgCompatibilityScore,
          strengthAreas,
          potentialChallenges
        }
        
        aiEnhancedAnalysis = await aiCompatibilityAnalyzer.analyzeCompatibility(
          userProfile,
          structuredData
        )
      } catch (error) {
        console.warn('AI analysis failed:', error)
      }
    }
    
    return {
      primaryGift: primaryGift.name,
      secondaryGifts: secondaryGifts.map(g => g.name),
      compatibilityScore: avgCompatibilityScore,
      strengthAreas,
      potentialChallenges,
      synergyDescription: aiEnhancedAnalysis?.personalizedInsights || 
        `Combinação de ${primaryGift.name} com ${secondaryGifts.map(g => g.name).join(', ')}`,
      aiEnhancedAnalysis
    }
  }

  /**
   * Get enhanced ministry recommendations with AI insights
   */
  async getEnhancedMinistryRecommendations(
    userProfile: UserGiftProfile,
    includeAI: boolean = true
  ): Promise<DynamicMinistryRecommendation[]> {
    const userGiftKeys = [
      userProfile.primaryGift.key,
      ...userProfile.secondaryGifts.map(g => g.key)
    ]
    
    const recommendations = await this.getMinistryRecommendations(userGiftKeys)
    
    // Enhance with AI insights if requested
    if (includeAI && recommendations.length > 0) {
      try {
        const aiAnalysis = await aiCompatibilityAnalyzer.analyzeCompatibility(userProfile)
        
        // Add AI insights to top recommendations
        return recommendations.map((rec, index) => ({
          ...rec,
          aiInsights: index < 3 && aiAnalysis.ministryRecommendations[index]
            ? `IA sugere: ${aiAnalysis.ministryRecommendations[index]}`
            : undefined
        }))
      } catch (error) {
        console.warn('AI enhancement failed for ministries:', error)
      }
    }
    
    return recommendations
  }

  /**
   * Save user's compatibility analysis to database
   */
  async saveCompatibilityAnalysis(
    userId: string,
    primaryGift: Database['public']['Enums']['gift_key'],
    secondaryGift: Database['public']['Enums']['gift_key'],
    compatibilityScore: number,
    analysisText?: string,
    recommendations?: string[]
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('gift_compatibility_analysis')
        .insert({
          user_id: userId,
          primary_gift_key: primaryGift,
          secondary_gift_key: secondaryGift,
          compatibility_score: compatibilityScore,
          analysis_text: analysisText,
          recommendations: recommendations
        })

      if (error) {
        console.error('Error saving compatibility analysis:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in saveCompatibilityAnalysis:', error)
      return false
    }
  }

  /**
   * Get user's previous compatibility analyses
   */
  async getUserCompatibilityHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('gift_compatibility_analysis')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching compatibility history:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserCompatibilityHistory:', error)
      return []
    }
  }
}

// Export singleton instance
export const dynamicCompatibilityAnalyzer = new DynamicCompatibilityAnalyzer()

// React hook for easy usage
export function useDynamicCompatibility() {
  const analyzeProfile = async (
    userProfile: UserGiftProfile,
    includeAI: boolean = true
  ): Promise<DynamicGiftCompatibility> => {
    return await dynamicCompatibilityAnalyzer.analyzeUserGiftProfile(userProfile, includeAI)
  }

  const getMinistryRecommendations = async (
    userProfile: UserGiftProfile,
    includeAI: boolean = true
  ): Promise<DynamicMinistryRecommendation[]> => {
    return await dynamicCompatibilityAnalyzer.getEnhancedMinistryRecommendations(userProfile, includeAI)
  }

  const getGiftCompatibility = async (
    primaryGift: Database['public']['Enums']['gift_key'],
    secondaryGift: Database['public']['Enums']['gift_key']
  ): Promise<GiftSynergyData | null> => {
    return await dynamicCompatibilityAnalyzer.getGiftCompatibility(primaryGift, secondaryGift)
  }

  return {
    analyzeProfile,
    getMinistryRecommendations,
    getGiftCompatibility
  }
}

// Server-side functions for API routes
export {
  dynamicCompatibilityAnalyzer as compatibilityAnalyzer
}