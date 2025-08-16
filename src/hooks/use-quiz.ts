'use client'

import { useState, useCallback, useEffect } from 'react'
import { useQuizQuestions, useSpiritualGifts, useSubmitQuiz } from './use-quiz-queries'
import type { QuizQuestion } from '@/data/quiz-data'

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

  // Quiz session persistence
  currentQuestionIndex: number
  setCurrentQuestionIndex: (index: number) => void
  hasPersistedState: boolean
}

const QUIZ_STATE_KEY = 'quiz_in_progress'
const QUIZ_QUESTION_ORDER_KEY = 'quiz_question_order'

interface QuizState {
  answers: Record<number, number>
  currentQuestionIndex: number
  startedAt: number
  questionOrder?: number[] // Array of question IDs in backend-defined order
}

export function useQuiz(locale: string = 'pt'): UseQuizReturn {
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, number>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [hasPersistedState, setHasPersistedState] = useState<boolean>(false)
  const [questionOrder, setQuestionOrder] = useState<number[]>([])
  const [orderedQuestions, setOrderedQuestions] = useState<QuizQuestion[]>([])

  const questionsQuery = useQuizQuestions(locale)
  const giftsQuery = useSpiritualGifts(locale)
  const submitQuizMutation = useSubmitQuiz()

  // Backend now handles question ordering - but preserve local state for session persistence
  useEffect(() => {
    if (questionsQuery.data && questionsQuery.data.length > 0) {
      // Backend already provides ordered questions, just use them
      const orderedQuestions = [...questionsQuery.data].sort((a, b) => 
        (a.question_order || 0) - (b.question_order || 0)
      )
      
      setQuestionOrder(orderedQuestions.map(q => q.id))
      setOrderedQuestions(orderedQuestions)
    }
  }, [questionsQuery.data])

  // Load persisted state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const persistedState = localStorage.getItem(QUIZ_STATE_KEY)
      if (persistedState) {
        const state: QuizState = JSON.parse(persistedState)

        // Check if the state is not too old (e.g., 24 hours)
        const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours in ms
        const isStateValid = Date.now() - state.startedAt < MAX_AGE

        if (isStateValid && Object.keys(state.answers).length > 0) {
          setCurrentAnswers(state.answers)
          setCurrentQuestionIndex(state.currentQuestionIndex)
          setHasPersistedState(true)

          // Load question order if available
          if (state.questionOrder) {
            setQuestionOrder(state.questionOrder)
          }
        } else {
          // Clear old/invalid state
          localStorage.removeItem(QUIZ_STATE_KEY)
          localStorage.removeItem(QUIZ_QUESTION_ORDER_KEY)
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted quiz state:', error)
      localStorage.removeItem(QUIZ_STATE_KEY)
    }
  }, [])

  // Save state to localStorage whenever answers or currentQuestionIndex change
  useEffect(() => {
    if (typeof window === 'undefined') return

    const hasAnswers = Object.keys(currentAnswers).length > 0

    if (hasAnswers) {
      const state: QuizState = {
        answers: currentAnswers,
        currentQuestionIndex,
        startedAt: Date.now(),
        questionOrder: questionOrder.length > 0 ? questionOrder : undefined
      }

      try {
        localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(state))
      } catch (error) {
        console.warn('Failed to save quiz state:', error)
      }
    }
  }, [currentAnswers, currentQuestionIndex, questionOrder])

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
      // Backend now handles all the logic - much simpler!
      const result = await submitQuizMutation.mutateAsync({
        userId,
        answers: currentAnswers
        // No need to pass gifts anymore - backend handles everything
      })

      // Clear persisted state after successful submission
      if (typeof window !== 'undefined') {
        localStorage.removeItem(QUIZ_STATE_KEY)
        localStorage.removeItem(QUIZ_QUESTION_ORDER_KEY)
      }

      return result
    } catch (err) {
      console.error('Error submitting quiz:', err)
      return null
    }
  }, [currentAnswers, submitQuizMutation])

  const clearAnswers = useCallback(() => {
    setCurrentAnswers({})
    setCurrentQuestionIndex(0)
    setQuestionOrder([])
    setOrderedQuestions([])

    // Clear persisted state
    if (typeof window !== 'undefined') {
      localStorage.removeItem(QUIZ_STATE_KEY)
      localStorage.removeItem(QUIZ_QUESTION_ORDER_KEY)
    }
  }, [])

  const handleSetCurrentQuestionIndex = useCallback((index: number) => {
    setCurrentQuestionIndex(index)
  }, [])

  const refetch = useCallback(() => {
    questionsQuery.refetch()
    giftsQuery.refetch()
  }, [questionsQuery, giftsQuery])

  return {
    questions: orderedQuestions.length > 0 ? orderedQuestions : questionsQuery.data,
    loading,
    error,
    currentAnswers,
    isSubmitting: submitQuizMutation.isPending,
    updateAnswer,
    submitQuiz,
    clearAnswers,
    refetch,
    currentQuestionIndex,
    setCurrentQuestionIndex: handleSetCurrentQuestionIndex,
    hasPersistedState
  }
}