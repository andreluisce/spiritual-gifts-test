'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useEffect } from 'react'

export default function AdminResultsPage() {
  const { user, isAdmin, isManager, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || (!isAdmin && !isManager))) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, isManager, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || (!isAdmin && !isManager)) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Resultados dos Testes</h1>
        <p className="text-gray-600">Conteúdo para a página de resultados dos testes.</p>
        {/* Add test results features here */}
      </div>
    </div>
  )
}
