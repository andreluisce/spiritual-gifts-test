'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase-client'

const supabase = createClient()
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
  gift_key: Database['public']['Enums']['gift_key'];
  name: string;
  definition: string;
  biblical_references: string;
  category_name: string;
  category_key: string;
  greek_term: string;
  qualities: Quality[];
  characteristics: Characteristic[];
  dangers: Danger[];
  misunderstandings: Misunderstanding[];
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

type DbAnswer = Database['public']['Tables']['answers']['Insert']

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
      const { data, error } = await supabase.rpc('get_questions_by_locale', { 
        target_locale: locale 
      })

      if (error) {
        throw new Error(`Failed to fetch questions: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error(`No questions found for locale: ${locale}`)
      }

      const questions: QuizQuestion[] = data.map((item: { id: number; text: string; gift: string }) => ({
        id: item.id,
        question: item.text,
        gift_key: item.gift as Database['public']['Enums']['gift_key'],
      }))
      
      return questions
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export type ExtendedSpiritualGift = SpiritualGift

// Hook to get spiritual gifts from database with rich data
export function useSpiritualGifts(locale: string = 'pt') {
  return useQuery({
    queryKey: [...QUERY_KEYS.gifts, locale],
    queryFn: async (): Promise<SpiritualGiftData[]> => {
      const { data, error } = await supabase.rpc('get_all_gifts_with_data', {
        p_locale: locale
      })

      if (error) {
        throw new Error(`Failed to fetch spiritual gifts: ${error.message}`)
      }

      // Parse JSON response from database function
      interface RawGiftData {
        gift_key: Database['public']['Enums']['gift_key']
        gift_name: string
        definition: string
        biblical_references: string
        category_name: string
        category_key: string
        greek_term: string
        qualities?: Quality[]
        characteristics?: Characteristic[]
        dangers?: Danger[]
        misunderstandings?: Misunderstanding[]
      }
      
      const gifts = Array.isArray(data) ? data : []
      return gifts.map((gift: unknown) => {
        const giftData = gift as RawGiftData
        return {
          gift_key: giftData.gift_key,
          name: giftData.gift_name,
          definition: giftData.definition,
          biblical_references: giftData.biblical_references,
          category_name: giftData.category_name,
          category_key: giftData.category_key,
          greek_term: giftData.greek_term,
          qualities: giftData.qualities || [],
          characteristics: giftData.characteristics || [],
          dangers: giftData.dangers || [],
          misunderstandings: giftData.misunderstandings || []
        }
      }) as SpiritualGiftData[]
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
        const { data: sessions, error: sessionsError } = await supabase
          .from('quiz_sessions')
          .select('id, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (sessionsError) {
          console.warn('No quiz sessions found for user:', sessionsError);
          return [];
        }

        const results = await Promise.all(sessions.map(async (session) => {
          try {
            const { data: rpcResult, error: rpcError } = await supabase.rpc('calculate_quiz_result', {
              p_session_id: session.id,
            })

            if (rpcError) {
              console.warn('Error calculating quiz result:', rpcError);
              return null;
            }

            const totalScore: Record<string, number> = {};
            rpcResult.forEach((item: { gift?: string; total_weighted?: number }) => {
              if (item.gift) {
                totalScore[item.gift] = item.total_weighted || 0;
              }
            });

            const { spiritualGifts } = await import('@/data/quiz-data')
            const topGifts = getTopGifts(totalScore, spiritualGifts);

            return {
              sessionId: session.id,
              totalScore,
              topGifts,
              createdAt: session.created_at
            };
          } catch (error) {
            console.error('Error processing session result:', error);
            return null;
          }
        }));

        return results.filter(result => result !== null) as {
          sessionId: string;
          totalScore: Record<string, number>;
          topGifts: string[];
          createdAt: string;
        }[];
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
        const { data: session, error: sessionError } = await supabase
          .from('quiz_sessions')
          .select('id, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (sessionError) {
          console.warn('No latest session found for user:', sessionError);
          return null;
        }

        const { data: rpcResult, error: rpcError } = await supabase.rpc('calculate_quiz_result', {
          p_session_id: session.id,
        })

        if (rpcError) {
          console.warn('Error calculating latest result:', rpcError);
          return null;
        }

        const totalScore: Record<string, number> = {};
        rpcResult.forEach((item: { gift?: string; total_weighted?: number }) => {
          if (item.gift) {
            totalScore[item.gift] = item.total_weighted || 0;
          }
        });

        const topGifts = getTopGiftsFromScores(totalScore);

        return {
          sessionId: session.id,
          totalScore,
          topGifts,
          createdAt: session.created_at
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
      gifts
    }: {
      userId: string
      answers: Record<number, number>
      gifts: SpiritualGift[]
    }) => {
      // Create session
      const sessionId = crypto.randomUUID()
      
      const { error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert({
          id: sessionId,
          user_id: userId,
          is_completed: true,
          completed_at: new Date().toISOString()
        })

      if (sessionError) throw sessionError

      // Submit answers
      const dbAnswers: DbAnswer[] = Object.entries(answers).map(([questionId, score]) => ({
        session_id: sessionId,
        pool_question_id: parseInt(questionId),
        score
      }))

      const { error: answersError } = await supabase
        .from('answers')
        .insert(dbAnswers)

      if (answersError) throw answersError

      // Calculate result using RPC
      const { data: rpcResult, error: rpcError } = await supabase.rpc('calculate_quiz_result', {
        p_session_id: sessionId,
      })

      if (rpcError) throw rpcError

      const totalScore: Record<string, number> = {};
      rpcResult.forEach((item: { gift?: string; total_weighted?: number }) => {
        if (item.gift) {
          totalScore[item.gift] = item.total_weighted || 0;
        }
      });

      const topGifts = getTopGifts(totalScore, gifts);

      return {
        sessionId,
        topGifts,
        totalScore
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
      // First, delete all answers for this session
      const { error: answersError } = await supabase
        .from('answers')
        .delete()
        .eq('session_id', sessionId)

      if (answersError) throw answersError

      // Then, delete the session
      const { error: sessionError } = await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId) // Extra safety check

      if (sessionError) throw sessionError

      return { sessionId, userId }
    },
    onSuccess: (data) => {
      // Invalidate user results cache
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userResults(data.userId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.latestResult(data.userId) })
    }
  })
}

// Hook to get categories by locale
export function useCategories(locale: string = 'pt') {
  return useQuery({
    queryKey: ['categories', locale],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase.rpc('get_categories_by_locale', {
        p_locale: locale
      });

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get ministries by locale
export function useMinistries(locale: string = 'pt') {
  return useQuery({
    queryKey: ['ministries', locale],
    queryFn: async (): Promise<Ministry[]> => {
      const { data, error } = await supabase.rpc('get_ministries_by_locale', {
        p_locale: locale
      });

      if (error) {
        throw new Error(`Failed to fetch ministries: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get manifestations by locale
export function useManifestations(locale: string = 'pt') {
  return useQuery({
    queryKey: ['manifestations', locale],
    queryFn: async (): Promise<Manifestation[]> => {
      const { data, error } = await supabase.rpc('get_manifestations_by_locale', {
        p_locale: locale
      });

      if (error) {
        throw new Error(`Failed to fetch manifestations: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
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

        const { spiritualGifts } = await import('@/data/quiz-data')
        const topGifts = getTopGifts(totalScore, spiritualGifts)

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

// Helper function to get top gifts from total score (without needing gifts array)
function getTopGiftsFromScores(totalScore: Record<string, number>): string[] {
  return Object.entries(totalScore)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([giftKey]) => giftKey)
}

// Helper function for backward compatibility
export function getTopGifts(totalScore: Record<string, number>, gifts: { key: string; name: string }[]): string[] {
  return Object.entries(totalScore)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([giftKey]) => {
      const gift = gifts.find(g => g.key === giftKey)
      return gift?.name || giftKey
    })
}