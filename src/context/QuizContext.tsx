'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface Question {
  id: number
  text: string
  giftCategory: string
}

interface QuizAnswer {
  questionId: number
  answer: number
  giftCategory: string
}

interface QuizContextType {
  questions: Question[]
  answers: QuizAnswer[]
  currentQuestionIndex: number
  isCompleted: boolean
  setQuestions: (questions: Question[]) => void
  answerQuestion: (questionId: number, answer: number, giftCategory: string) => void
  nextQuestion: () => void
  previousQuestion: () => void
  goToQuestion: (index: number) => void
  resetQuiz: () => void
  completeQuiz: () => void
  getProgress: () => number
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

export function QuizProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const answerQuestion = (questionId: number, answer: number, giftCategory: string) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId)
      if (existing) {
        return prev.map(a => 
          a.questionId === questionId 
            ? { ...a, answer, giftCategory }
            : a
        )
      }
      return [...prev, { questionId, answer, giftCategory }]
    })
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
    }
  }

  const resetQuiz = () => {
    setAnswers([])
    setCurrentQuestionIndex(0)
    setIsCompleted(false)
  }

  const completeQuiz = () => {
    setIsCompleted(true)
  }

  const getProgress = () => {
    if (questions.length === 0) return 0
    return (answers.length / questions.length) * 100
  }

  const value: QuizContextType = {
    questions,
    answers,
    currentQuestionIndex,
    isCompleted,
    setQuestions,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    resetQuiz,
    completeQuiz,
    getProgress,
  }

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider')
  }
  return context
}