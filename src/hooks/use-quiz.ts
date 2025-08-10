'use client'

import { useState, useCallback, useEffect } from 'react'
import { useQuizQuestions, useGifts, useSubmitQuiz } from './use-quiz-queries'
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
const QUIZ_ANSWERS_KEY = 'quiz_answers'
const QUIZ_QUESTION_INDEX_KEY = 'quiz_question_index'
const QUIZ_QUESTION_ORDER_KEY = 'quiz_question_order'

interface QuizState {
  answers: Record<number, number>
  currentQuestionIndex: number
  startedAt: number
  questionOrder?: number[] // Array of original question IDs in shuffled order
}

// Fisher-Yates shuffle algorithm for array randomization
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function useQuiz(): UseQuizReturn {
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, number>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [hasPersistedState, setHasPersistedState] = useState<boolean>(false)
  const [questionOrder, setQuestionOrder] = useState<number[]>([])
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([])

  const questionsQuery = useQuizQuestions()
  const giftsQuery = useGifts()
  const submitQuizMutation = useSubmitQuiz()

  // Shuffle questions when they are first loaded
  useEffect(() => {
    if (questionsQuery.data && questionsQuery.data.length > 0 && shuffledQuestions.length === 0) {
      let newQuestionOrder: number[]
      let newShuffledQuestions: QuizQuestion[]

      // Try to load existing order from localStorage first
      const savedOrder = localStorage.getItem(QUIZ_QUESTION_ORDER_KEY)
      if (savedOrder) {
        try {
          const parsedOrder = JSON.parse(savedOrder)
          if (Array.isArray(parsedOrder) && parsedOrder.length === questionsQuery.data.length) {
            // Use saved order
            newQuestionOrder = parsedOrder
            newShuffledQuestions = newQuestionOrder.map(id => 
              questionsQuery.data!.find(q => q.id === id)
            ).filter((q): q is QuizQuestion => q !== undefined)
          } else {
            throw new Error('Invalid saved order')
          }
        } catch {
          // If parsing fails, create new shuffle
          newShuffledQuestions = shuffleArray([...questionsQuery.data])
          newQuestionOrder = newShuffledQuestions.map(q => q.id)
          localStorage.setItem(QUIZ_QUESTION_ORDER_KEY, JSON.stringify(newQuestionOrder))
        }
      } else {
        // No saved order, create new shuffle
        newShuffledQuestions = shuffleArray([...questionsQuery.data])
        newQuestionOrder = newShuffledQuestions.map(q => q.id)
        localStorage.setItem(QUIZ_QUESTION_ORDER_KEY, JSON.stringify(newQuestionOrder))
      }

      setQuestionOrder(newQuestionOrder)
      setShuffledQuestions(newShuffledQuestions)
    }
  }, [questionsQuery.data, shuffledQuestions.length])

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
      if (!giftsQuery.data) {
        throw new Error('Dados dos dons não carregados')
      }

      const result = await submitQuizMutation.mutateAsync({
        userId,
        answers: currentAnswers,
        gifts: giftsQuery.data
      })

      // Clear persisted state after successful submission
      if (typeof window !== 'undefined') {
        localStorage.removeItem(QUIZ_STATE_KEY)
      }

      return result
    } catch (err) {
      console.error('Error submitting quiz:', err)
      return null
    }
  }, [currentAnswers, giftsQuery.data, submitQuizMutation])

  const clearAnswers = useCallback(() => {
    setCurrentAnswers({})
    setCurrentQuestionIndex(0)
    setQuestionOrder([])
    setShuffledQuestions([])
    
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
    questions: shuffledQuestions.length > 0 ? shuffledQuestions : questionsQuery.data,
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