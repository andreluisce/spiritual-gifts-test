'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase-client'

const supabase = createClient()
import type { Database } from '@/lib/database.types'
import type { QuizQuestion, SpiritualGift } from '@/data/quiz-data'


export interface Manifestation {
  id: number;
  name: string;
  definition: string;
  classification: 'DISCERNIMENTO' | 'PODER' | 'DECLARACAO';
  biblical_references: string;
}

export interface Ministry {
  id: number;
  name: string;
  definition: string;
  type: 'PRIMARY' | 'OTHER';
  biblical_references: string;
}

export interface Manifestation {
  id: number;
  name: string;
  definition: string;
  classification: 'DISCERNIMENTO' | 'PODER' | 'DECLARACAO';
  biblical_references: string;
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

// Hook to get spiritual gifts
export function useSpiritualGifts() {
  return useQuery({
    queryKey: QUERY_KEYS.gifts,
    queryFn: async () => {
      const { spiritualGifts } = await import('@/data/quiz-data')
      return spiritualGifts
    },
    staleTime: Infinity, // Static data, never stale
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

        const { spiritualGifts } = await import('@/data/quiz-data')
        const topGifts = getTopGifts(totalScore, spiritualGifts);

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

// Hook to get categories (static data)
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      return [
        {
          id: 'motivations',
          name: 'MOTIVAÇÕES',
          greek_term: 'Charisma',
          description: 'Dons motivacionais que impulsionam o serviço cristão',
          purpose: 'Capacitam para ação e liderança'
        },
        {
          id: 'ministries',
          name: 'MINISTÉRIOS',
          greek_term: 'Diakonia',
          description: 'Dons de serviço para edificação do corpo de Cristo',
          purpose: 'Direcionam o chamado específico'
        },
        {
          id: 'manifestations',
          name: 'MANIFESTAÇÕES',
          greek_term: 'Phanerosis',
          description: 'Manifestações sobrenaturais do Espírito Santo',
          purpose: 'Demonstram o poder divino'
        }
      ]
    },
    staleTime: Infinity, // Static data
  })
}

// Hook to get ministries (returns empty for now)
export function useMinistries() {
  return useQuery({
    queryKey: ['ministries'],
    queryFn: async (): Promise<Ministry[]> => {
      // Return empty array as ministries table doesn't exist yet
      return []
    },
    staleTime: Infinity,
  })
}

// Hook to get manifestations (returns empty for now)
export function useManifestations() {
  return useQuery({
    queryKey: ['manifestations'],
    queryFn: async (): Promise<Manifestation[]> => {
      // Return empty array as manifestations table doesn't exist yet
      return []
    },
    staleTime: Infinity,
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

// Helper function to get top gifts from total score
function getTopGifts(totalScore: Record<string, number>, gifts: SpiritualGift[]): string[] {
  return Object.entries(totalScore)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([giftKey]) => {
      const gift = gifts.find(g => g.key === giftKey)
      return gift?.name || giftKey
    })
}