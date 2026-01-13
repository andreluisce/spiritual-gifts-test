'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'

export type QuizResult = {
  session_id: string
  started_at: string
  completed_at: string | null
  is_completed: boolean
  total_score: number
  gift_results: Record<string, { score: number; percentage?: number }>
  top_gifts: Array<{
    gift_id: number
    gift_name: string
    score: number
  }>
}

export type QuizSessionDetails = {
  session_id: string
  user_id: string
  user_email: string
  user_name: string
  started_at: string
  completed_at: string | null
  is_completed: boolean
  results: Record<string, { score: number }>
  answers: Array<{
    question_id: number
    answer_value: number
    created_at: string
  }>
}

export function useUserQuizResults() {
  const [results, setResults] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const fetchUserQuizResults = useCallback(async (userId: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching quiz results for user:', userId)

      const { data, error: rpcError } = await supabase.rpc('get_user_quiz_results', {
        p_user_id: userId
      })

      console.log('RPC Response:', { data, error: rpcError })

      if (rpcError) {
        console.error('RPC Error details:', {
          message: rpcError.message,
          details: rpcError.details,
          hint: rpcError.hint,
          code: rpcError.code
        })
        throw rpcError
      }

      setResults(data || [])
      return data || []
    } catch (err) {
      console.error('Error fetching user quiz results:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz results')
      return []
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return { results, loading, error, fetchUserQuizResults }
}

export function useQuizSessionDetails() {
  const [sessionDetails, setSessionDetails] = useState<QuizSessionDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const fetchSessionDetails = useCallback(async (sessionId: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: rpcError } = await supabase.rpc('get_quiz_session_details', {
        p_session_id: sessionId
      })

      if (rpcError) throw rpcError

      const details = data && data.length > 0 ? data[0] : null
      setSessionDetails(details)
      return details
    } catch (err) {
      console.error('Error fetching session details:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch session details')
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return { sessionDetails, loading, error, fetchSessionDetails }
}
