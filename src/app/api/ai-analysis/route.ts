import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { aiCompatibilityAnalyzer, type UserGiftProfile, type AICompatibilityAnalysis } from '@/lib/ai-compatibility-analyzer'
import type { Database } from '@/lib/database.types'

// Force Node.js runtime for Supabase compatibility
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
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

    if (authError) {
      console.error('❌ AI Analysis API: Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }


    const body = await request.json()
    const { profile, sessionId, useCache = true, clientAnalysis, locale = 'pt' } = body as {
      profile: UserGiftProfile
      sessionId?: string
      useCache?: boolean
      clientAnalysis?: AICompatibilityAnalysis
      locale?: string
    }

    // Debug logging to identify the UUID issue
    console.log('🔍 AI Analysis API Debug:', {
      hasProfile: !!profile,
      sessionId: sessionId,
      sessionIdType: typeof sessionId,
      locale: locale,
      localeType: typeof locale,
      profileLocale: profile?.locale
    })

    // Validate required fields
    if (!profile?.primaryGift?.key) {
      console.error('❌ AI Analysis API: Missing profile data')
      return NextResponse.json({
        error: 'Missing required profile data'
      }, { status: 400 })
    }

    // Validate sessionId format if provided
    if (sessionId !== undefined && sessionId !== null && sessionId !== '') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (typeof sessionId !== 'string' || !uuidRegex.test(sessionId)) {
        console.error('❌ AI Analysis API: Invalid sessionId format:', sessionId)
        return NextResponse.json({
          error: 'Invalid sessionId format - must be a valid UUID'
        }, { status: 400 })
      }
    }

    // Prepare gift scores for cache lookup
    const giftScores = Object.fromEntries([
      [profile.primaryGift.key, profile.primaryGift.score],
      ...profile.secondaryGifts.map(g => [g.key, g.score])
    ])

    // Check cache first - use gift_scores based cache for users with same results
    if (useCache) {
      console.log('🔍 AI Analysis API: Checking cache with useCache=true')
      try {
        const { data: cachedByScores, error: cacheByScoresError } = await supabase.rpc('get_ai_analysis_by_user_and_scores', {
          p_user_id: user.id,
          p_gift_scores: giftScores
        })

        if (cacheByScoresError) {
          console.warn('⚠️ AI Analysis API: Cache lookup by scores failed:', cacheByScoresError)
        }

        if (!cacheByScoresError && cachedByScores && cachedByScores.length > 0) {
          const cached = cachedByScores[0]
          console.log('✅ AI Analysis API: CACHE HIT by gift_scores!', {
            cacheDate: cached.created_at,
            userId: user.id
          })
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
        } else {
          console.log('❌ AI Analysis API: CACHE MISS by gift_scores')
        }

        // Fallback to session-based cache if available
        if (sessionId) {
          const { data: cachedBySession, error: cacheBySessionError } = await supabase.rpc('get_ai_analysis_by_session', {
            p_session_id: sessionId
          })

          if (cacheBySessionError) {
            console.warn('⚠️ AI Analysis API: Cache lookup by session failed:', cacheBySessionError)
          }

          if (!cacheBySessionError && cachedBySession && cachedBySession.length > 0) {
            const cached = cachedBySession[0]
            console.log('✅ AI Analysis API: CACHE HIT by session_id!', {
              cacheDate: cached.created_at,
              sessionId: sessionId
            })
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
          } else {
            console.log('❌ AI Analysis API: CACHE MISS by session_id')
          }
        }
      } catch (cacheError) {
        console.warn('❌ AI Analysis API: Cache lookup failed:', cacheError)
      }
    } else {
      console.log('⚠️ AI Analysis API: Cache disabled (useCache=false)')
    }

    // Use client analysis if provided, otherwise generate new AI analysis
    console.log('🤖 AI Analysis API: Generating NEW AI analysis (cache miss or disabled)')
    let analysis
    if (clientAnalysis) {
      console.log('📥 AI Analysis API: Using client-provided analysis')
      analysis = clientAnalysis
    } else {
      console.log('🔮 AI Analysis API: Calling AI service to generate analysis')
      analysis = await aiCompatibilityAnalyzer.analyzeCompatibility(profile, locale)
    }


    // Save to cache (always save, even without sessionId for future cache by gift_scores)
    try {
      const primaryGifts = [
        profile.primaryGift.key,
        ...profile.secondaryGifts.map(g => g.key)
      ]

      // Log insert data for debugging
      const insertData = {
        user_id: user.id,
        ...(sessionId && { session_id: sessionId }), // Only include session_id if it exists
        gift_scores: giftScores,
        primary_gifts: primaryGifts,
        locale: profile.locale || locale || 'pt',
        personalized_insights: analysis.personalizedInsights,
        strengths_description: analysis.strengthsDescription,
        challenges_guidance: analysis.challengesGuidance,
        ministry_recommendations: analysis.ministryRecommendations,
        development_plan: analysis.developmentPlan,
        practical_applications: analysis.practicalApplications,
        confidence_score: analysis.confidence,
        ai_service_used: clientAnalysis ? 'client-ai' : 'server-ai',
        analysis_version: '2.0'
      }

      console.log('🔍 AI Analysis API: Attempting insert with data:', {
        user_id: insertData.user_id,
        session_id: insertData.session_id || 'not provided',
        session_id_type: typeof insertData.session_id,
        locale: insertData.locale,
        locale_type: typeof insertData.locale,
        primaryGiftsCount: insertData.primary_gifts.length
      })

      const { error: insertError } = await supabase
        .from('ai_analysis_cache')
        .insert(insertData)
        .select()

      if (insertError) {
        // If conflict on session_id, update existing record
        if (insertError.code === '23505' && sessionId) {
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
          }
        } else {
          console.warn('⚠️ AI Analysis API: Insert failed:', insertError)
        }
      } else {
      }
    } catch (saveError) {
      console.warn('❌ AI Analysis API: Failed to save analysis to cache:', saveError)
      // Don't fail the request if caching fails
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