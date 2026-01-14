'use client'

import { useAuth } from '@/context/AuthContext'
import { usePublicSettings } from './usePublicSettings'
import { useLatestResult } from './use-quiz-queries'

// Centralized helper to decide if the user can start the quiz again.
// Centralized helper to decide if the user can start the quiz again.
export function useQuizAccess() {
  const { user, isAdmin, isManager, isApproved } = useAuth()
  const { allowRetake, loading: settingsLoading } = usePublicSettings()
  const { data: latestResult, isLoading: latestResultLoading } = useLatestResult(user?.id || null)

  const isPrivileged = isAdmin || isManager
  const hasCompletedQuiz = !!latestResult

  // User must be approved (or privileged) to take the quiz
  // AND either allowRetake is on OR they haven't completed it yet
  const canTakeQuiz = (isPrivileged || isApproved) && (isPrivileged || allowRetake || !hasCompletedQuiz)
  const loading = settingsLoading || latestResultLoading

  return {
    canTakeQuiz,
    hasCompletedQuiz,
    loading
  }
}
