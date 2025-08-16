'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  useEffect(() => {
    // Redirect to overview tab by default
    router.push(`/quiz/results/${sessionId}/overview`)
  }, [router, sessionId])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}