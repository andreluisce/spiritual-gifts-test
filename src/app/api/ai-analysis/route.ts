import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { aiCompatibilityAnalyzer, type UserGiftProfile, type AICompatibilityAnalysis } from '@/lib/ai-compatibility-analyzer'
import type { Database } from '@/lib/database.types'

export async function POST(request: NextRequest) {
  console.log('🚀 AI Analysis API: POST request received')
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Check authentication
    console.log('🔐 AI Analysis API: Checking authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('❌ AI Analysis API: Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user) {
      console.log('❌ AI Analysis API: No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ AI Analysis API: User authenticated:', user.id)

    console.log('📥 AI Analysis API: Reading request body...')
    const body = await request.json()
    console.log('📥 AI Analysis API: Body received:', { hasProfile: !!body.profile, sessionId: body.sessionId, hasClientAnalysis: !!body.clientAnalysis })
    const { profile, sessionId, useCache = true, clientAnalysis } = body as {
      profile: UserGiftProfile
      sessionId?: string
      useCache?: boolean
      clientAnalysis?: AICompatibilityAnalysis
    }

    // Validate required fields
    console.log('🔍 AI Analysis API: Validating profile data...')
    if (!profile?.primaryGift?.key) {
      console.error('❌ AI Analysis API: Missing profile data')
      return NextResponse.json({
        error: 'Missing required profile data'
      }, { status: 400 })
    }
    console.log('✅ AI Analysis API: Profile validated, primary gift:', profile.primaryGift.key)

    // Prepare gift scores for cache lookup
    const giftScores = Object.fromEntries([
      [profile.primaryGift.key, profile.primaryGift.score],
      ...profile.secondaryGifts.map(g => [g.key, g.score])
    ])

    // Check cache first - use gift_scores based cache for users with same results
    if (useCache) {
      try {
        console.log('🔍 AI Analysis API: Checking cache for user and gift scores...')
        const { data: cachedByScores, error: cacheByScoresError } = await supabase.rpc('get_ai_analysis_by_user_and_scores', {
          p_user_id: user.id,
          p_gift_scores: giftScores
        })

        if (!cacheByScoresError && cachedByScores && cachedByScores.length > 0) {
          console.log('✅ AI Analysis API: Found cached analysis based on gift scores')
          const cached = cachedByScores[0]
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
            cacheType: 'gift_scores',
            cacheDate: cached.created_at
          })
        }

        // Fallback to session-based cache if available
        if (sessionId) {
          console.log('🔍 AI Analysis API: Checking session-based cache...')
          const { data: cachedBySession, error: cacheBySessionError } = await supabase.rpc('get_ai_analysis_by_session', {
            p_session_id: sessionId
          })

          if (!cacheBySessionError && cachedBySession && cachedBySession.length > 0) {
            console.log('✅ AI Analysis API: Found cached analysis based on session')
            const cached = cachedBySession[0]
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
              cacheType: 'session',
              cacheDate: cached.created_at
            })
          }
        }
      } catch (cacheError) {
        console.warn('❌ AI Analysis API: Cache lookup failed:', cacheError)
      }
    }

    // Use client analysis if provided, otherwise generate new AI analysis
    let analysis
    if (clientAnalysis) {
      console.log('📦 AI Analysis API: Using pre-computed client analysis')
      analysis = clientAnalysis
    } else {
      console.log('🤖 AI Analysis API: Starting AI analysis generation...')
      analysis = await aiCompatibilityAnalyzer.analyzeCompatibility(profile)
      console.log('✅ AI Analysis API: AI analysis completed successfully')
    }

    // Save to cache (always save, even without sessionId for future cache by gift_scores)
    try {
      console.log('💾 AI Analysis API: Saving analysis to cache...')
      const primaryGifts = [
        profile.primaryGift.key,
        ...profile.secondaryGifts.map(g => g.key)
      ]

      const { error: insertError } = await supabase
        .from('ai_analysis_cache')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          gift_scores: giftScores,
          primary_gifts: primaryGifts,
          locale: profile.locale || 'pt',
          personalized_insights: analysis.personalizedInsights,
          strengths_description: analysis.strengthsDescription,
          challenges_guidance: analysis.challengesGuidance,
          ministry_recommendations: analysis.ministryRecommendations,
          development_plan: analysis.developmentPlan,
          practical_applications: analysis.practicalApplications,
          confidence_score: analysis.confidence,
          ai_service_used: clientAnalysis ? 'client-ai' : 'server-ai',
          analysis_version: '2.0'
        })
        .select()

      if (insertError) {
        // If conflict on session_id, update existing record
        if (insertError.code === '23505' && sessionId) {
          console.log('🔄 AI Analysis API: Updating existing session cache...')
          const { error: updateError } = await supabase
            .from('ai_analysis_cache')
            .update({
              gift_scores: giftScores,
              primary_gifts: primaryGifts,
              personalized_insights: analysis.personalizedInsights,
              strengths_description: analysis.strengthsDescription,
              challenges_guidance: analysis.challengesGuidance,
              ministry_recommendations: analysis.ministryRecommendations,
              development_plan: analysis.developmentPlan,
              practical_applications: analysis.practicalApplications,
              confidence_score: analysis.confidence,
              ai_service_used: clientAnalysis ? 'client-ai' : 'server-ai',
              analysis_version: '2.0',
              updated_at: new Date().toISOString()
            })
            .eq('session_id', sessionId)

          if (updateError) {
            console.warn('⚠️ AI Analysis API: Update failed:', updateError)
          } else {
            console.log('✅ AI Analysis API: Cache updated successfully')
          }
        } else {
          console.warn('⚠️ AI Analysis API: Insert failed:', insertError)
        }
      } else {
        console.log('✅ AI Analysis API: Analysis saved to cache successfully')
      }
    } catch (saveError) {
      console.warn('❌ AI Analysis API: Failed to save analysis to cache:', saveError)
      // Don't fail the request if caching fails
    }

    console.log('📤 AI Analysis API: Returning successful response')
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
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
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