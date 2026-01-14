'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useLocale } from 'next-intl'

export type QuizReport = {
  session_info: {
    session_id: string
    user_id: string
    user_email: string
    user_name: string
    started_at: string
    completed_at: string | null
    is_completed: boolean
    duration_minutes: number | null
  }
  spiritual_gifts: Array<{
    rank: number
    gift_key: string
    gift_name: string
    score: number
    strength: 'Primário' | 'Secundário' | 'Presente'
  }>
  questions_and_answers: Array<{
    question_number: number
    question_text: string
    gift_category: string
    answer_value: number
    answer_label: string
  }>
  ai_insights: Array<{
    gift_name: string
    description: string
    biblical_foundation: string
    practical_applications: string
  }>
}

export function useQuizReport() {
  const [report, setReport] = useState<QuizReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())
  const locale = useLocale()

  const fetchReport = useCallback(async (sessionId: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: rpcError } = await supabase.rpc('get_quiz_report', {
        p_session_id: sessionId,
        p_locale: locale
      })

      if (rpcError) {
        console.error('RPC Error details (FULL):', rpcError)
        console.error('RPC Error message:', rpcError.message)
        throw rpcError
      }

      setReport(data || null)
      return data || null
    } catch (err) {
      console.error('Error fetching quiz report:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz report')
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, locale])

  return { report, loading, error, fetchReport }
}
