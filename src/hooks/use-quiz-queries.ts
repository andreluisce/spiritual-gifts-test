'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase-client'

const supabase = getSupabaseClient()
import type { Database } from '@/lib/database.types'
import type { QuizQuestion, SpiritualGift } from '@/data/quiz-data'


// Updated interfaces to match new database structure
export interface Category {
  key: string;
  name: string;
  greek_term: string;
  description: string;
  purpose: string;
}

export interface SpiritualGiftData {
  gift_key: string;
  name: string;
  definition: string;
  biblical_references?: string;
  category_name?: string;
  category_key?: string;
  greek_term?: string;
  qualities?: Quality[];
  characteristics?: Characteristic[];
  dangers?: Danger[];
  misunderstandings?: Misunderstanding[];
  orientations?: Orientation[];
  detailed_biblical_references?: DetailedBiblicalReference[];
}

export interface Quality {
  quality_name: string;
  description: string | null;
  order_sequence: number | null;
}

export interface Characteristic {
  characteristic: string;
  order_sequence: number | null;
}

export interface Danger {
  danger: string;
  order_sequence: number | null;
}

export interface Misunderstanding {
  misunderstanding: string;
  order_sequence: number | null;
}

export interface Orientation {
  orientation: string;
  category: string;
  order_sequence: number | null;
}

export interface DetailedBiblicalReference {
  reference: string;
  verse_text: string;
  application: string;
  category: string;
  order_sequence: number | null;
}

export interface Ministry {
  key: string;
  name: string;
  definition: string;
  type: string;
  biblical_references: string;
}

export interface Manifestation {
  key: string;
  name: string;
  definition: string;
  classification: string;
  biblical_references: string;
}

export interface GiftCompleteData {
  gift_key: Database['public']['Enums']['gift_key'];
  gift_name: string;
  definition: string;
  biblical_references: string;
  category_name: string;
  greek_term: string;
  qualities: Quality[];
  characteristics: Characteristic[];
  dangers: Danger[];
  misunderstandings: Misunderstanding[];
}

// Interface for raw gift data from database
interface RawGiftData {
  gift_key: string;
  name: string;
  definition: string;
  biblical_references: string;
  category_key?: string;
  category_name?: string;
  categories?: {
    key: string;
    name: string;
    greek_term: string;
  };
  qualities?: Array<{
    quality_name: string;
    description: string;
    order_sequence: number;
  }>;
  characteristics?: Array<{
    characteristic: string;
    order_sequence: number;
  }>;
  dangers?: Array<{
    danger: string;
    order_sequence: number;
  }>;
  misunderstandings?: Array<{
    misunderstanding: string;
    order_sequence: number;
  }>;
}

// Interface for fallback gift data
interface FallbackGiftData {
  key: string;
  [key: string]: unknown;
}

export interface TopGiftDetail {
  gift_key: Database['public']['Enums']['gift_key'];
  gift_name: string;
  definition: string;
  biblical_references: string;
  total_weighted: number;
  question_count: number;
  category_name: string;
  greek_term: string;
}


// Query Keys
const QUERY_KEYS = {
  questions: ['quiz', 'questions'] as const,
  gifts: ['gifts'] as const,
  userResults: (userId: string) => ['quiz', 'results', userId] as const,
  latestResult: (userId: string) => ['quiz', 'results', 'latest', userId] as const,
}

// Hooks for fetching data

export function useQuizQuestions(locale: string = 'pt') {
  return useQuery({
    queryKey: [...QUERY_KEYS.questions, locale],
    queryFn: async (): Promise<QuizQuestion[]> => {
      // Get questions per gift from settings
      let questionsPerGift = 5; // default

      try {
        // Get system settings to determine questions per gift
        const { data: settings } = await supabase.rpc('get_system_settings')


        if (settings && settings.quiz && typeof settings.quiz.questionsPerGift === 'number') {
          questionsPerGift = settings.quiz.questionsPerGift;
        }

        // Use the existing balanced quiz generation function
        const { data, error } = await supabase.rpc('generate_balanced_quiz', {
          target_locale: locale,
          questions_per_gift: questionsPerGift,
          user_id_param: null
        })

        if (error) {
          console.warn('Balanced quiz generation failed, trying fallback:', error.message)
          throw error
        }

        if (!data || data.length === 0) {
          throw new Error(`No questions generated for locale: ${locale}`)
        }

        // Map the comprehensive response to QuizQuestion format
        const questions: QuizQuestion[] = data.map((item: {
          quiz_id: string;
          question_id: number;
          question_text: string;
          gift_key: string;
          weight_class: string;
          question_order: number;
          reverse_scored: boolean;
          default_weight: number;
        }) => ({
          id: item.question_id,
          question: item.question_text,
          gift_key: item.gift_key as Database['public']['Enums']['gift_key'],
          // Additional metadata from backend
          weight_class: item.weight_class,
          question_order: item.question_order,
          quiz_id: item.quiz_id,
          reverse_scored: item.reverse_scored,
          default_weight: item.default_weight
        }))

        const expectedTotal = questionsPerGift * 7; // 7 spiritual gifts
        console.log(`Generated balanced quiz with ${questions.length} questions (${questionsPerGift} per gift, expected: ${expectedTotal})`)
        return questions
      } catch {
        console.warn('Questions RPC not available, trying direct table query')

        try {
          // Try direct table query as fallback - limit to configured questions per gift
          console.warn(`Table fallback: getting ${questionsPerGift} questions per gift`)

          // Get limited questions per gift from table
          const giftKeys = ["A_PROPHECY", "B_SERVICE", "C_TEACHING", "D_EXHORTATION", "E_GIVING", "F_LEADERSHIP", "G_MERCY"]
          const allQuestions: QuizQuestion[] = []

          for (const giftKey of giftKeys) {
            const { data: giftQuestions, error: giftError } = await supabase
              .from('question_pool')
              .select('*')
              .eq('gift_key', giftKey)
              .limit(questionsPerGift)
              .order('id')

            if (giftError) {
              console.warn(`Error getting questions for ${giftKey}:`, giftError.message)
              continue
            }

            if (giftQuestions) {
              const mappedQuestions = giftQuestions.map((item: {
                id: number;
                question_text: string;
                gift_key: Database['public']['Enums']['gift_key'];
              }) => ({
                id: item.id,
                question: item.question_text || `Question ${item.id}`,
                gift_key: item.gift_key as Database['public']['Enums']['gift_key'],
              }))

              allQuestions.push(...mappedQuestions)
            }
          }

          console.log(`Table fallback generated ${allQuestions.length} questions`)
          return allQuestions

        } catch {
          console.warn('All database queries failed, using hardcoded fallback questions')

          // Hardcoded fallback questions - generate proper set for testing
          const giftKeys = ["A_PROPHECY", "B_SERVICE", "C_TEACHING", "D_EXHORTATION", "E_GIVING", "F_LEADERSHIP", "G_MERCY"]
          const fallbackQuestions: QuizQuestion[] = []

          giftKeys.forEach((giftKey, giftIndex) => {
            for (let i = 1; i <= questionsPerGift; i++) {
              fallbackQuestions.push({
                id: giftIndex * questionsPerGift + i,
                question: `Pergunta ${i} para o dom ${giftKey.replace(/^[A-Z]_/, '')}`,
                gift_key: giftKey as Database['public']['Enums']['gift_key']
              })
            }
          })

          return fallbackQuestions
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export type ExtendedSpiritualGift = SpiritualGift

// Hook to get categories by locale with fallback
export function useCategories(locale: string = 'pt') {
  return useQuery({
    queryKey: ['categories', locale],
    queryFn: async (): Promise<Category[]> => {
      try {
        const { data, error } = await supabase.rpc('get_categories_by_locale', {
          p_locale: locale
        });

        if (error) {
          console.warn('Categories RPC failed, using fallback:', error.message);
          throw error;
        }

        return data || [];
      } catch {
        console.warn('Categories function not available, using static fallback');

        // Fallback categories
        return [
          {
            key: 'motivational',
            name: 'Motivações',
            greek_term: 'Karismata',
            description: 'Dons básicos motivacionais dados por Deus',
            purpose: 'Impulsos básicos para servir'
          },
          {
            key: 'ministries',
            name: 'Ministérios',
            greek_term: 'Diakoniai',
            description: 'Formas de serviço cristão',
            purpose: 'Canais de ministério'
          },
          {
            key: 'manifestations',
            name: 'Manifestações',
            greek_term: 'Phanerosis',
            description: 'Manifestações visíveis do Espírito',
            purpose: 'Demonstrações do poder de Deus'
          }
        ] as Category[];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get ministries by locale with fallback
export function useMinistries(locale: string = 'pt') {
  return useQuery({
    queryKey: ['ministries', locale],
    queryFn: async (): Promise<Ministry[]> => {
      try {
        const { data, error } = await supabase.rpc('get_ministries_by_locale', {
          p_locale: locale
        });

        if (error) {
          console.warn('Ministries RPC failed, using fallback:', error.message);
          throw error;
        }

        return data || [];
      } catch {
        console.warn('Ministries function not available, using static fallback');
        return [] as Ministry[];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get manifestations by locale with fallback
export function useManifestations(locale: string = 'pt') {
  return useQuery({
    queryKey: ['manifestations', locale],
    queryFn: async (): Promise<Manifestation[]> => {
      try {
        const { data, error } = await supabase.rpc('get_manifestations_by_locale', {
          p_locale: locale
        });

        if (error) {
          console.warn('Manifestations RPC failed, using fallback:', error.message);
          throw error;
        }

        return data || [];
      } catch {
        console.warn('Manifestations function not available, using static fallback');
        return [] as Manifestation[];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get spiritual gifts from database with rich data
export function useSpiritualGifts(locale: string = 'pt') {
  return useQuery({
    queryKey: [...QUERY_KEYS.gifts, locale],
    queryFn: async (): Promise<SpiritualGiftData[]> => {
      try {
        // First, let's try a direct query to get the gifts with category information
        const { data: directData, error: directError } = await supabase
          .from('spiritual_gifts')
          .select(`
            gift_key,
            name,
            definition,
            biblical_references,
            category_key,
            categories!inner (
              key,
              name,
              greek_term,
              description,
              purpose
            ),
            qualities (
              quality_name,
              description,
              order_sequence
            ),
            characteristics (
              characteristic,
              order_sequence
            ),
            dangers (
              danger,
              order_sequence
            ),
            misunderstandings (
              misunderstanding,
              order_sequence
            )
          `)
          .eq('locale', locale)
          .eq('categories.locale', locale)
          .order('gift_key')

        if (directError) {
          console.error('❌ Direct query error:', directError)
        }

        if (!directError && directData && directData.length > 0) {
          console.log('✅ Direct query successful, found gifts:', directData.length)

          return directData.map((gift: RawGiftData) => ({
            gift_key: gift.gift_key,
            name: gift.name,
            definition: gift.definition,
            biblical_references: gift.biblical_references,
            category_key: gift.category_key || gift.categories?.key || 'motivations',
            category_name: gift.categories?.name || 'Unknown Category',
            greek_term: gift.categories?.greek_term || '',
            qualities: (gift.qualities || []).map((q) => ({
              quality_name: q.quality_name,
              description: q.description,
              order_sequence: q.order_sequence
            })),
            characteristics: (gift.characteristics || []).map((c) => ({
              characteristic: c.characteristic,
              order_sequence: c.order_sequence
            })),
            dangers: (gift.dangers || []).map((d) => ({
              danger: d.danger,
              order_sequence: d.order_sequence
            })),
            misunderstandings: (gift.misunderstandings || []).map((m) => ({
              misunderstanding: m.misunderstanding,
              order_sequence: m.order_sequence
            }))
          }))
        }

        // Fallback to RPC function if direct query fails
        console.log('⚠️ Direct query failed or returned no data, trying RPC function')
        const { data, error } = await supabase.rpc('get_all_gifts_with_data', {
          p_locale: locale
        })

        if (error) {
          console.error('Error fetching spiritual gifts from database:', error.message)
          throw error
        }

        if (!data) {
          console.error('No spiritual gifts data returned from database')
          throw new Error('No spiritual gifts data available')
        }

        console.log('RPC function returned data:', data?.length, 'gifts')
        if (data && data.length > 0) {
          console.log('First gift from RPC:', data[0])
          console.log('Category from first RPC gift:', data[0]?.category)
        }

        // If not Portuguese and some data is empty, get Portuguese fallback
        let fallbackData = null
        if (locale !== 'pt') {
          try {
            const { data: ptData } = await supabase.rpc('get_all_gifts_with_data', {
              p_locale: 'pt'
            })
            fallbackData = ptData
          } catch (fallbackError) {
            console.warn('Failed to fetch Portuguese fallback data:', fallbackError)
          }
        }

        // Parse JSON response from database function
        interface DatabaseGiftData {
          key: Database['public']['Enums']['gift_key']
          name: string
          definition: string
          biblical_references: string
          category: {
            key: string
            name: string
            greek_term: string
            description: string
            purpose: string
          }
          characteristics: string[]
          qualities: {
            id: number
            quality_name: string
            description: string
          }[]
          dangers: string[]
          misunderstandings: string[]
        }

        // data is a JSON array
        const gifts = Array.isArray(data) ? data : (data ? [data] : [])
        console.log('🔍 DEBUG - Raw spiritual gifts data from database:', gifts)
        console.log('🔍 DEBUG - First gift characteristics:', gifts[0]?.characteristics)
        console.log('🔍 DEBUG - First gift dangers:', gifts[0]?.dangers)
        console.log('🔍 DEBUG - First gift misunderstandings:', gifts[0]?.misunderstandings)

        return gifts.map((gift: DatabaseGiftData) => {
          // Find corresponding Portuguese gift for fallback
          const ptGift = fallbackData ?
            (Array.isArray(fallbackData) ? fallbackData : [fallbackData]).find((ptGift: FallbackGiftData) => ptGift.key === gift.key) :
            null

          return {
            gift_key: gift.key,
            name: gift.name,
            definition: gift.definition,
            biblical_references: gift.biblical_references,
            category_name: gift.category?.name,
            category_key: gift.category?.key,
            greek_term: gift.category?.greek_term,
            qualities: (gift.qualities || []).map(q => ({
              quality_name: q.quality_name,
              description: q.description,
              order_sequence: q.id
            })),
            characteristics: (gift.characteristics && gift.characteristics.length > 0
              ? gift.characteristics
              : (ptGift?.characteristics || [])
            ).map((char: string | { characteristic: string; order_sequence?: number }, index: number) => ({
              characteristic: typeof char === 'string' ? char : char.characteristic,
              order_sequence: typeof char === 'string' ? index + 1 : (char.order_sequence || index + 1)
            })),
            dangers: (gift.dangers && gift.dangers.length > 0
              ? gift.dangers
              : (ptGift?.dangers || [])
            ).map((danger: string | { danger: string; order_sequence?: number }, index: number) => ({
              danger: typeof danger === 'string' ? danger : danger.danger,
              order_sequence: typeof danger === 'string' ? index + 1 : (danger.order_sequence || index + 1)
            })),
            misunderstandings: (gift.misunderstandings && gift.misunderstandings.length > 0
              ? gift.misunderstandings
              : (ptGift?.misunderstandings || [])
            ).map((misunderstanding: string | { misunderstanding: string; order_sequence?: number }, index: number) => ({
              misunderstanding: typeof misunderstanding === 'string' ? misunderstanding : misunderstanding.misunderstanding,
              order_sequence: typeof misunderstanding === 'string' ? index + 1 : (misunderstanding.order_sequence || index + 1)
            }))
          }
        }) as SpiritualGiftData[]

      } catch (error) {
        console.error('Failed to fetch spiritual gifts from database:', error)
        throw new Error('Unable to load spiritual gifts data from database. Please check your connection.')
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to get gift bridge mapping (maps gift_key enum to spiritual_gifts)
export function useGiftBridge() {
  return useQuery({
    queryKey: ['gift_bridge'],
    queryFn: async () => {
      // Returning empty array directly as the table is not in database.types.ts
      return [];
    },
    staleTime: Infinity, // Static data, never stale
  })
}

export function useUserResults(userId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.userResults(userId || ''),
    queryFn: async (): Promise<{
      sessionId: string;
      totalScore: Record<string, number>;
      topGifts: string[];
      createdAt: string;
    }[]> => {
      if (!userId) return [];

      try {
        // Use the new RPC function that respects RLS
        const { data: results, error } = await supabase.rpc('get_user_results_with_scores', {
          p_user_id: userId,
        })

        if (error) {
          console.warn('Error fetching user results:', error);
          return [];
        }

        if (!results || results.length === 0) {
          return [];
        }

        return results.map((result: {
          session_id: string;
          created_at: string;
          total_scores: Record<string, number>;
          top_gifts_keys: string[];
          top_gifts_names: string[];
        }) => ({
          sessionId: result.session_id,
          totalScore: result.total_scores,
          topGifts: result.top_gifts_names,
          createdAt: result.created_at
        }));
      } catch (error) {
        console.error('Error fetching user results:', error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useLatestResult(userId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.latestResult(userId || ''),
    queryFn: async (): Promise<{
      sessionId: string;
      totalScore: Record<string, number>;
      topGifts: string[];
      createdAt: string;
    } | null> => {
      if (!userId) return null;

      try {
        // Use the new RPC function that respects RLS
        const { data: results, error } = await supabase.rpc('get_latest_user_result', {
          p_user_id: userId,
        })

        if (error) {
          console.warn('Error fetching latest result:', error);
          return null;
        }

        if (!results || results.length === 0) {
          return null;
        }

        const result = results[0];
        return {
          sessionId: result.session_id,
          totalScore: result.total_scores,
          topGifts: result.top_gifts_names,
          createdAt: result.created_at
        };
      } catch (error) {
        console.error('Error fetching latest result:', error);
        return null;
      }
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      answers,
    }: {
      userId: string
      answers: Record<number, number>
    }) => {
      // Use the comprehensive backend function
      const { data, error } = await supabase.rpc('submit_complete_quiz', {
        p_user_id: userId,
        p_answers: answers, // Direct JSONB format
        p_quiz_id: null
      })

      if (error) {
        console.error('Quiz submission error:', error)
        throw error
      }

      if (!data || data.length === 0) {
        throw new Error('No result returned from quiz submission')
      }

      const result = data[0]

      return {
        sessionId: result.session_id,
        topGifts: result.top_gifts_names || [],
        topGiftKeys: result.top_gifts_keys || [],
        totalScore: result.total_scores || {},
        completedAt: result.completed_at
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch user results
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userResults(data.sessionId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.latestResult(data.sessionId) })
    }
  })
}

export function useDeleteResult() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ sessionId, userId }: { sessionId: string; userId: string }) => {
      console.log('🗑️ Attempting to delete session:', { sessionId, userId })

      // First, delete all answers for this session
      const { error: answersError, count: answersCount } = await supabase
        .from('answers')
        .delete()
        .eq('session_id', sessionId)

      if (answersError) {
        console.error('❌ Error deleting answers:', answersError)
        throw new Error(`Failed to delete answers: ${answersError.message}`)
      }
      console.log('✅ Deleted answers count:', answersCount)

      // Then, delete the session
      const { error: sessionError, count: sessionCount } = await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId) // Extra safety check

      if (sessionError) {
        console.error('❌ Error deleting session:', sessionError)
        throw new Error(`Failed to delete session: ${sessionError.message}`)
      }
      console.log('✅ Deleted session count:', sessionCount)

      return { sessionId, userId }
    },
    onSuccess: (data) => {
      // Invalidate user results cache
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userResults(data.userId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.latestResult(data.userId) })
    }
  })
}


// Hook to get specific quiz result by session ID
export function useResultBySessionId(sessionId: string) {
  return useQuery({
    queryKey: ['quiz', 'result', sessionId],
    queryFn: async (): Promise<{
      sessionId: string;
      totalScore: Record<string, number>;
      topGifts: string[];
      createdAt: string;
    } | null> => {
      if (!sessionId) return null

      try {
        // First get session info
        const { data: session, error: sessionError } = await supabase
          .from('quiz_sessions')
          .select('id, created_at')
          .eq('id', sessionId)
          .single()

        if (sessionError) {
          console.warn('Session not found:', sessionError)
          return null
        }

        // Calculate result using RPC
        const { data: rpcResult, error: rpcError } = await supabase.rpc('calculate_quiz_result', {
          p_session_id: sessionId,
        })

        if (rpcError) {
          console.warn('Error calculating result:', rpcError)
          return null
        }

        const totalScore: Record<string, number> = {}
        rpcResult.forEach((item: { gift?: string; total_weighted?: number }) => {
          if (item.gift) {
            totalScore[item.gift] = item.total_weighted || 0
          }
        })

        // Get gift names from the database instead of static data
        const spiritualGiftsData = await supabase.rpc('get_all_gifts_with_data', { p_locale: 'pt' })
        const gifts = spiritualGiftsData.data || []
        const topGifts = Object.entries(totalScore)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([giftKey]) => {
            const gift = gifts.find((g: { key: string }) => g.key === giftKey)
            return gift?.name || giftKey
          })

        return {
          sessionId: session.id,
          totalScore,
          topGifts,
          createdAt: session.created_at
        }
      } catch (error) {
        console.error('Error fetching result by session ID:', error)
        return null
      }
    },
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to get complete gift data by gift key
export function useGiftCompleteData(giftKey: Database['public']['Enums']['gift_key'], locale: string = 'pt') {
  return useQuery({
    queryKey: ['gift_complete_data', giftKey, locale],
    queryFn: async (): Promise<GiftCompleteData | null> => {
      const { data, error } = await supabase.rpc('get_gift_complete_data', {
        p_gift_key: giftKey,
        p_locale: locale
      });

      if (error) {
        throw new Error(`Failed to fetch gift complete data: ${error.message}`);
      }

      return data || null;
    },
    enabled: !!giftKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get top gift details for a session
export function useTopGiftDetails(sessionId: string, locale: string = 'pt') {
  return useQuery({
    queryKey: ['top_gift_details', sessionId, locale],
    queryFn: async (): Promise<TopGiftDetail[]> => {
      const { data, error } = await supabase.rpc('get_top_gift_details', {
        p_session_id: sessionId,
        p_locale: locale
      });

      if (error) {
        throw new Error(`Failed to fetch top gift details: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Helper functions moved to backend

export function getTopGifts(totalScore: Record<string, number>, gifts: { key: string; name: string }[]): string[] {
  return Object.entries(totalScore)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([giftKey]) => {
      const gift = gifts.find(g => g.key === giftKey)
      return gift?.name || giftKey
    })
}