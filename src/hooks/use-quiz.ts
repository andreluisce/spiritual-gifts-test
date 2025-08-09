'use client'

import { useState, useCallback } from 'react'
import { useQuizQuestions, useGifts, useSubmitQuiz } from './use-quiz-queries'

interface UseQuizReturn {
  // Quiz state from React Query
  questions: ReturnType<typeof useQuizQuestions>['data']
  loading: boolean
  error: string | null
  
  // Current quiz session
  currentAnswers: Record<number, number>
  isSubmitting: boolean
  
  // Actions
  updateAnswer: (questionId: number, score: number) => void
  submitQuiz: (userId: string) => Promise<{ sessionId: string; topGifts: string[]; totalScore: Record<string, number> } | null>
  clearAnswers: () => void
  refetch: () => void
}

export function useQuiz(): UseQuizReturn {
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, number>>({})

  const questionsQuery = useQuizQuestions()
  const giftsQuery = useGifts()
  const submitQuizMutation = useSubmitQuiz()

  const loading = questionsQuery.isLoading || giftsQuery.isLoading
  const error = questionsQuery.error?.message || 
               giftsQuery.error?.message || 
               submitQuizMutation.error?.message || 
               null

  const updateAnswer = useCallback((questionId: number, score: number) => {
    setCurrentAnswers(prev => ({
      ...prev,
      [questionId]: score
    }))
  }, [])

  const submitQuiz = useCallback(async (userId: string): Promise<{ sessionId: string; topGifts: string[]; totalScore: Record<string, number> } | null> => {
    try {
      if (!giftsQuery.data) {
        throw new Error('Dados dos dons não carregados')
      }

      const result = await submitQuizMutation.mutateAsync({
        userId,
        answers: currentAnswers,
        gifts: giftsQuery.data
      })

      return result
    } catch (err) {
      console.error('Error submitting quiz:', err)
      return null
    }
  }, [currentAnswers, giftsQuery.data, submitQuizMutation])

  const clearAnswers = useCallback(() => {
    setCurrentAnswers({})
  }, [])

  const refetch = useCallback(() => {
    questionsQuery.refetch()
    giftsQuery.refetch()
  }, [questionsQuery, giftsQuery])

  return {
    questions: questionsQuery.data,
    loading,
    error,
    currentAnswers,
    isSubmitting: submitQuizMutation.isPending,
    updateAnswer,
    submitQuiz,
    clearAnswers,
    refetch
  }
}