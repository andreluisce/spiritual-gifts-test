'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import type { QuizQuestion, QuizAnswer, QuizResult, SpiritualGift } from '@/data/quiz-data'
import { calculateScores, getTopGifts } from '@/data/quiz-data'

type DbQuizQuestion = Database['public']['Tables']['quiz_questions']['Row']
type DbQuizAnswer = Database['public']['Tables']['quiz_answers']['Insert']
type DbQuizResult = Database['public']['Tables']['quiz_results']['Insert']
type DbGift = Database['public']['Tables']['gifts']['Row']

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
  { id: 1, question: "Eu tenho facilidade para organizar eventos e atividades na igreja.", gift_key: "administration" },
  { id: 2, question: "Sinto-me chamado(a) para plantar novas igrejas ou ministérios.", gift_key: "apostleship" },
  { id: 3, question: "Consigo identificar facilmente quando algo não está certo espiritualmente.", gift_key: "discernment" },
  { id: 4, question: "Gosto de ensinar e explicar as Escrituras para outros.", gift_key: "teaching" },
  { id: 5, question: "Tenho facilidade para liderar grupos e tomar decisões.", gift_key: "leadership" },
  { id: 6, question: "Sinto compaixão genuína pelos necessitados e busco ajudá-los.", gift_key: "mercy" },
  { id: 7, question: "Prefiro trabalhar nos bastidores apoiando o ministério dos outros.", gift_key: "service" },
  { id: 8, question: "Deus me usa para orar por cura e ver resultados sobrenaturais.", gift_key: "healing" },
  { id: 9, question: "Tenho facilidade para compartilhar o evangelho com não crentes.", gift_key: "evangelism" },
  { id: 10, question: "Sinto-me motivado(a) a dar generosamente para a obra de Deus.", gift_key: "giving" }
]

export function useQuizQuestions() {
  return useQuery({
    queryKey: QUERY_KEYS.questions,
    queryFn: async (): Promise<QuizQuestion[]> => {
      try {
        const { data, error } = await supabase
          .from('quiz_questions')
          .select('*')
          .order('id')

        if (error) throw error

        if (data && data.length > 0) {
          return data.map(question => ({
            id: question.id,
            question: question.question,
            gift_key: question.gift_key
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
          description: dbGift.description,
          biblicalReferences: staticGift?.biblicalReferences || [],
          characteristics: staticGift?.characteristics || []
        }
      })
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useUserResults(userId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.userResults(userId || ''),
    queryFn: async (): Promise<QuizResult[]> => {
      if (!userId) throw new Error('User ID is required')

      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(result => ({
        id: result.id,
        user_id: result.user_id,
        total_score: result.total_score as Record<string, number>,
        top_gifts: result.top_gifts as string[],
        created_at: result.created_at || new Date().toISOString()
      }))
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useLatestResult(userId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.latestResult(userId || ''),
    queryFn: async (): Promise<QuizResult | null> => {
      if (!userId) return null

      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      if (!data) return null

      return {
        id: data.id,
        user_id: data.user_id,
        total_score: data.total_score as Record<string, number>,
        top_gifts: data.top_gifts as string[],
        created_at: data.created_at || new Date().toISOString()
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
    }): Promise<QuizResult> => {
      // Convert answers to QuizAnswer format
      const quizAnswers: QuizAnswer[] = []
      const questions = await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.questions,
        queryFn: async () => {
          const { data, error } = await supabase
            .from('quiz_questions')
            .select('*')
            .order('id')
          if (error) throw error
          return data.map(q => ({
            id: q.id,
            question: q.question,
            gift_key: q.gift_key
          }))
        }
      })

      Object.entries(answers).forEach(([questionId, score]) => {
        const question = questions.find(q => q.id === parseInt(questionId))
        if (question) {
          quizAnswers.push({
            user_id: userId,
            question_id: parseInt(questionId),
            gift_key: question.gift_key,
            score: score
          })
        }
      })

      // Calculate scores
      const totalScore = calculateScores(quizAnswers, gifts)
      const topGifts = getTopGifts(totalScore, gifts, 5)

      // Save quiz result
      const { data: result, error: resultError } = await supabase
        .from('quiz_results')
        .insert({
          user_id: userId,
          total_score: totalScore,
          top_gifts: topGifts
        })
        .select()
        .single()

      if (resultError) throw resultError

      // Save individual answers
      const dbAnswers: DbQuizAnswer[] = quizAnswers.map(answer => ({
        user_id: answer.user_id,
        question_id: answer.question_id,
        gift_key: answer.gift_key,
        score: answer.score
      }))

      const { error: answersError } = await supabase
        .from('quiz_answers')
        .insert(dbAnswers)

      if (answersError) throw answersError

      return {
        id: result.id,
        user_id: result.user_id,
        total_score: result.total_score as Record<string, number>,
        top_gifts: result.top_gifts as string[],
        created_at: result.created_at || new Date().toISOString()
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
      resultId, 
      userId 
    }: { 
      resultId: string
      userId: string 
    }) => {
      // Delete related answers first
      const { error: answersError } = await supabase
        .from('quiz_answers')
        .delete()
        .eq('user_id', userId)
        // Note: We would need quiz_result_id in the answers table to properly filter

      // Delete the result
      const { error } = await supabase
        .from('quiz_results')
        .delete()
        .eq('id', resultId)
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