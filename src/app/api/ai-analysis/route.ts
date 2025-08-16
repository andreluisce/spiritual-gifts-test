import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { aiCompatibilityAnalyzer, type UserGiftProfile, type AICompatibilityAnalysis } from '@/lib/ai-compatibility-analyzer'
import type { Database } from '@/lib/database.types'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { profile, sessionId, useCache = true } = body as {
      profile: UserGiftProfile
      sessionId?: string
      useCache?: boolean
    }

    // Validate required fields
    if (!profile?.primaryGift?.key) {
      return NextResponse.json({ 
        error: 'Missing required profile data' 
      }, { status: 400 })
    }

    // Check cache first if sessionId provided
    if (useCache && sessionId) {
      try {
        const { data: cachedData, error: cacheError } = await supabase.rpc('get_ai_analysis_by_session', {
          p_session_id: sessionId
        })

        if (!cacheError && cachedData && cachedData.length > 0) {
          const cached = cachedData[0]
          const analysis: AICompatibilityAnalysis = {
            personalizedInsights: cached.personalized_insights,
            strengthsDescription: cached.strengths_description,
            challengesGuidance: cached.challenges_guidance || '',
            ministryRecommendations: cached.ministry_recommendations || [],
            developmentPlan: cached.development_plan,
            practicalApplications: cached.practical_applications || [],
            confidence: cached.confidence_score
          }

          return NextResponse.json({ 
            analysis,
            cached: true,
            cacheDate: cached.created_at
          })
        }
      } catch (cacheError) {
        console.warn('Cache lookup failed, generating new analysis:', cacheError)
      }
    }

    // Generate new AI analysis
    const analysis = await aiCompatibilityAnalyzer.analyzeCompatibility(profile)

    // Save to cache if sessionId provided
    if (sessionId) {
      try {
        const giftScores = Object.fromEntries([
          [profile.primaryGift.key, profile.primaryGift.score],
          ...profile.secondaryGifts.map(g => [g.key, g.score])
        ])

        const primaryGifts = [
          profile.primaryGift.key,
          ...profile.secondaryGifts.map(g => g.key)
        ]

        await supabase.rpc('save_ai_analysis', {
          p_user_id: session.user.id,
          p_session_id: sessionId,
          p_gift_scores: giftScores,
          p_primary_gifts: primaryGifts,
          p_locale: profile.locale || 'pt',
          p_personalized_insights: analysis.personalizedInsights,
          p_strengths_description: analysis.strengthsDescription,
          p_challenges_guidance: analysis.challengesGuidance,
          p_ministry_recommendations: analysis.ministryRecommendations,
          p_development_plan: analysis.developmentPlan,
          p_practical_applications: analysis.practicalApplications,
          p_confidence_score: analysis.confidence,
          p_ai_service_used: 'server-ai'
        })
      } catch (saveError) {
        console.warn('Failed to save analysis to cache:', saveError)
        // Don't fail the request if caching fails
      }
    }

    return NextResponse.json({ 
      analysis,
      cached: false,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI Analysis API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI analysis' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve cached analysis
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ 
        error: 'sessionId is required' 
      }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('get_ai_analysis_by_session', {
      p_session_id: sessionId
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ 
        error: 'No analysis found for this session' 
      }, { status: 404 })
    }

    const cached = data[0]
    const analysis: AICompatibilityAnalysis = {
      personalizedInsights: cached.personalized_insights,
      strengthsDescription: cached.strengths_description,
      challengesGuidance: cached.challenges_guidance || '',
      ministryRecommendations: cached.ministry_recommendations || [],
      developmentPlan: cached.development_plan,
      practicalApplications: cached.practical_applications || [],
      confidence: cached.confidence_score
    }

    return NextResponse.json({ 
      analysis,
      cached: true,
      cacheDate: cached.created_at
    })

  } catch (error) {
    console.error('AI Analysis GET API Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve analysis' },
      { status: 500 }
    )
  }
}