'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import type { QuizQuestion, SpiritualGift } from '@/data/quiz-data'
import { getTopGifts } from '@/data/quiz-data'

type DbAnswer = Database['public']['Tables']['answers']['Insert']

// Query Keys
const QUERY_KEYS = {
  questions: ['quiz', 'questions'] as const,
  gifts: ['gifts'] as const,
  userResults: (userId: string) => ['quiz', 'results', userId] as const,
  latestResult: (userId: string) => ['quiz', 'results', 'latest', userId] as const,
} as const

// Hooks for fetching data

// Fallback questions for when Supabase is not available
const fallbackQuestions: QuizQuestion[] = [
  { id: 1, question: "Eu tenho facilidade para organizar eventos e atividades na igreja.", gift_key: "A_PROPHECY" },
  { id: 2, question: "Sinto-me chamado(a) para plantar novas igrejas ou ministérios.", gift_key: "B_SERVICE" },
  { id: 3, question: "Consigo identificar facilmente quando algo não está certo espiritualmente.", gift_key: "C_TEACHING" },
  { id: 4, question: "Gosto de ensinar e explicar as Escrituras para outros.", gift_key: "D_EXHORTATION" },
  { id: 5, question: "Tenho facilidade para liderar grupos e tomar decisões.", gift_key: "F_LEADERSHIP" }
]

export function useQuizQuestions() {
  return useQuery({
    queryKey: QUERY_KEYS.questions,
    queryFn: async (): Promise<QuizQuestion[]> => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select(
            `
            id,
            text,
            question_gift_map ( gift )
            `
          )
          .order('id')
          .limit(5)

        if (error) {
          console.error("Supabase fetch error:", error);
          throw error;
        }

        if (data && data.length > 0) {
          return data.map(q => ({
            id: q.id,
            question: q.text,
            gift_key: (q.question_gift_map?.gift || '') as QuizQuestion['gift_key']
          }))
        } else {
          // If no data from Supabase, use fallback questions
          return fallbackQuestions
        }
      } catch (error) {
        console.warn('Failed to fetch questions from Supabase, using fallback questions:', error)
        // Return fallback questions if Supabase fails
        return fallbackQuestions
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Extended type for complete gift information from database
export type ExtendedSpiritualGift = {
  key: QuizQuestion['gift_key']
  name: string
  description: string
  biblicalReferences: string[]
  characteristics: string[] // Keep original format for compatibility
  id: number
  category: {
    id: number
    name: string
    greek_term: string | null
    description: string | null
    purpose: string | null
  } | null
  qualities: Array<{
    id: number
    quality_name: string
    description: string | null
    order_sequence: number | null
  }>
  dangers: Array<{
    id: number
    danger: string
    order_sequence: number | null
  }>
  misunderstandings: Array<{
    id: number
    misunderstanding: string
    order_sequence: number | null
  }>
}

export function useGifts() {
  return useQuery({
    queryKey: QUERY_KEYS.gifts,
    queryFn: async (): Promise<SpiritualGift[]> => {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .order('name')

      if (error) throw error

      // For now, merge with static data to get additional info like biblical references
      const { spiritualGifts } = await import('@/data/quiz-data')

      return data.map(dbGift => {
        const staticGift = spiritualGifts.find(g => g.key === dbGift.key)
        return {
          key: dbGift.key,
          name: dbGift.name,
          description: dbGift.description || '',
          biblicalReferences: staticGift?.biblicalReferences || [],
          characteristics: staticGift?.characteristics || []
        }
      })
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// New hook for complete spiritual gifts data
export function useSpiritualGifts() {
  return useQuery({
    queryKey: ['spiritual_gifts', 'complete'],
    queryFn: async (): Promise<ExtendedSpiritualGift[]> => {
      const { data, error } = await supabase
        .from('spiritual_gifts')
        .select(`
          id,
          name,
          definition,
          biblical_references,
          categories (
            id,
            name,
            greek_term,
            description,
            purpose
          ),
          qualities (
            id,
            quality_name,
            description,
            order_sequence
          ),
          characteristics (
            id,
            characteristic,
            order_sequence
          ),
          dangers (
            id,
            danger,
            order_sequence
          ),
          misunderstandings (
            id,
            misunderstanding,
            order_sequence
          )
        `)
        .eq('categories.name', 'MOTIVAÇÕES') // Focus on motivation gifts for quiz
        .order('id')

      if (error) throw error

      return data.map(gift => ({
        key: `GIFT_${gift.id}` as QuizQuestion['gift_key'], // Map to existing enum or create new mapping
        name: gift.name,
        description: gift.definition || '',
        biblicalReferences: gift.biblical_references ? [gift.biblical_references] : [],
        characteristics: gift.characteristics
          ?.sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0))
          .map(c => c.characteristic) || [],
        id: gift.id,
        category: gift.categories,
        qualities: gift.qualities?.sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0)) || [],
        dangers: gift.dangers?.sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0)) || [],
        misunderstandings: gift.misunderstandings?.sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0)) || []
      }))
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Hook for getting single gift with all details
export function useSpiritualGift(giftId: number) {
  return useQuery({
    queryKey: ['spiritual_gift', giftId],
    queryFn: async (): Promise<ExtendedSpiritualGift | null> => {
      const { data, error } = await supabase
        .from('spiritual_gifts')
        .select(`
          id,
          name,
          definition,
          biblical_references,
          categories (
            id,
            name,
            greek_term,
            description,
            purpose
          ),
          qualities (
            id,
            quality_name,
            description,
            order_sequence
          ),
          characteristics (
            id,
            characteristic,
            order_sequence
          ),
          dangers (
            id,
            danger,
            order_sequence
          ),
          misunderstandings (
            id,
            misunderstanding,
            order_sequence
          )
        `)
        .eq('id', giftId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows found
        throw error
      }

      return {
        key: `GIFT_${data.id}` as QuizQuestion['gift_key'],
        name: data.name,
        description: data.definition || '',
        biblicalReferences: data.biblical_references ? [data.biblical_references] : [],
        characteristics: data.characteristics
          ?.sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0))
          .map(c => c.characteristic) || [],
        id: data.id,
        category: data.categories,
        qualities: data.qualities?.sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0)) || [],
        dangers: data.dangers?.sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0)) || [],
        misunderstandings: data.misunderstandings?.sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0)) || []
      }
    },
    enabled: !!giftId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Hook for categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id')

      if (error) throw error
      return data
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

// Hook for ministries
export function useMinistries() {
  return useQuery({
    queryKey: ['ministries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ministries')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

// Hook for manifestations
export function useManifestations() {
  return useQuery({
    queryKey: ['manifestations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manifestations')
        .select('*')
        .order('classification', { ascending: true })
        .order('name')

      if (error) throw error
      return data
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

// Hook for biblical activities
export function useBiblicalActivities() {
  return useQuery({
    queryKey: ['biblical_activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('biblical_activities')
        .select('*')
        .order('id')

      if (error) throw error
      return data
    },
    staleTime: 60 * 60 * 1000, // 1 hour
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
      if (!userId) throw new Error('User ID is required')

      const { data: sessions, error: sessionsError } = await supabase
        .from('quiz_sessions')
        .select('id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (sessionsError) throw sessionsError

      const results = await Promise.all(sessions.map(async (session) => {
        const { data: rpcResult, error: rpcError } = await supabase.rpc('calculate_quiz_result', {
          p_session_id: session.id,
        })

        if (rpcError) throw rpcError

        const totalScore: Record<string, number> = {};
        rpcResult.forEach(item => {
          if (item.gift) {
            totalScore[item.gift] = item.total || 0;
          }
        });

        const { spiritualGifts } = await import('@/data/quiz-data')
        const topGifts = getTopGifts(totalScore, spiritualGifts, 5);

        return {
          sessionId: session.id,
          totalScore,
          topGifts,
          createdAt: session.created_at,
        }
      }))

      return results
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
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
      if (!userId) return null

      const { data: session, error: sessionError } = await supabase
        .from('quiz_sessions')
        .select('id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (sessionError) throw sessionError
      if (!session) return null

      const { data: rpcResult, error: rpcError } = await supabase.rpc('calculate_quiz_result', {
        p_session_id: session.id,
      })

      if (rpcError) throw rpcError

      const totalScore: Record<string, number> = {};
      rpcResult.forEach(item => {
        if (item.gift) {
          totalScore[item.gift] = item.total || 0;
        }
      });

      const { spiritualGifts } = await import('@/data/quiz-data')
      const topGifts = getTopGifts(totalScore, spiritualGifts, 5);

      return {
        sessionId: session.id,
        totalScore,
        topGifts,
        createdAt: session.created_at,
      }
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Mutations for creating/updating data

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
    }): Promise<{ sessionId: string; topGifts: string[]; totalScore: Record<string, number> }> => {
      // 1. Create a new quiz session
      const { data: sessionData, error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert({ user_id: userId })
        .select('id')
        .single()

      if (sessionError) throw sessionError
      const sessionId = sessionData.id

      // 2. Fetch questions to get gift_key for each question
      const questions = await queryClient.fetchQuery<QuizQuestion[]>({
        queryKey: QUERY_KEYS.questions,
      })

      // 3. Prepare answers for batch insert
      const dbAnswers: DbAnswer[] = Object.entries(answers).map(([questionId, score]) => {
        const question = questions.find(q => q.id === parseInt(questionId))
        if (!question) {
          throw new Error(`Question with ID ${questionId} not found.`);
        }
        return {
          session_id: sessionId,
          question_id: parseInt(questionId),
          score: score,
        }
      })

      // 4. Save individual answers
      const { error: answersError } = await supabase
        .from('answers')
        .insert(dbAnswers)

      if (answersError) throw answersError

      // 5. Call RPC to calculate results
      const { data: rpcResult, error: rpcError } = await supabase.rpc('calculate_quiz_result', {
        p_session_id: sessionId,
      })

      if (rpcError) throw rpcError

      const totalScore: Record<string, number> = {};
      rpcResult.forEach(item => {
        if (item.gift) {
          totalScore[item.gift] = item.total || 0;
        }
      });

      const topGifts = getTopGifts(totalScore, gifts, 5);

      return {
        sessionId,
        topGifts,
        totalScore,
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userResults(variables.userId)
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.latestResult(variables.userId)
      })
    },
  })
}

export function useDeleteResult() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      sessionId,
      userId
    }: {
      sessionId: string
      userId: string
    }) => {
      // Delete the session, which should cascade to answers
      const { error } = await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId) // Extra security check

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userResults(variables.userId)
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.latestResult(variables.userId)
      })
    },
  })
}

// Hook to seed initial data (for development/admin)
export function useSeedGiftsData() {
  return useMutation({
    mutationFn: async () => {
      const { spiritualGifts } = await import('@/data/quiz-data')

      const dbGifts: Database['public']['Tables']['gifts']['Insert'][] = spiritualGifts.map(gift => ({
        key: gift.key,
        name: gift.name,
        description: gift.description
      }))

      const { error } = await supabase
        .from('gifts')
        .upsert(dbGifts, { onConflict: 'key' })

      if (error) throw error
    },
  })
}