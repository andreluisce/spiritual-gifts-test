'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Eye, 
  Download, 
  Calendar,
  User,
  ArrowLeft,
  Filter
} from 'lucide-react'
import Link from 'next/link'

interface TestResult {
  id: string
  user_id: string
  created_at: string
  completed_at: string | null
  user_profile?: {
    full_name?: string | null
    avatar_url?: string | null
  }
  top_gifts?: string[]
}

export default function AdminResultsPage() {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [results, setResults] = useState<TestResult[]>([])
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const resultsPerPage = 10

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isAdmin, loading, router])

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchAllResults()
    }
  }, [isAuthenticated, isAdmin])

  useEffect(() => {
    // Filter results based on search term
    const filtered = results.filter(result => 
      result.user_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.top_gifts?.some(gift => gift.toLowerCase().includes(searchTerm.toLowerCase())) ||
      result.id.includes(searchTerm)
    )
    setFilteredResults(filtered)
    setCurrentPage(1)
  }, [searchTerm, results])

  const fetchAllResults = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select(`
          id,
          user_id,
          created_at,
          completed_at
        `)
        .not('completed_at', 'is', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get user profiles and top gifts for each session
      const resultsWithGifts = await Promise.all(
        data.map(async (session) => {
          try {
            // Get user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', session.user_id)
              .single()

            // Get top gifts
            const { data: topGifts } = await supabase
              .rpc('best_gifts', { p_session_id: session.id, p_limit: 3 })
            
            return {
              ...session,
              user_profile: profile || undefined,
              top_gifts: topGifts?.map(g => g.gift) || []
            }
          } catch (error) {
            console.error('Error getting data for session:', session.id, error)
            return {
              ...session,
              user_profile: undefined,
              top_gifts: []
            }
          }
        })
      )

      setResults(resultsWithGifts)
      setFilteredResults(resultsWithGifts)
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportToCSV = () => {
    const headers = ['Data', 'Usuário', 'Session ID', 'Top 3 Dons', 'Pontuações']
    const csvData = filteredResults.map(result => [
      formatDate(result.created_at),
      result.user_profile?.full_name || 'Usuário Anônimo',
      result.id,
      result.top_gifts?.slice(0, 3).join('; ') || '',
      'Ver detalhes no sistema'
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resultados-testes-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage)
  const startIndex = (currentPage - 1) * resultsPerPage
  const endIndex = startIndex + resultsPerPage
  const currentResults = filteredResults.slice(startIndex, endIndex)

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Resultados dos Testes
            </h1>
            <p className="text-gray-600">
              {filteredResults.length} resultado(s) encontrado(s)
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por usuário, dons ou session ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados ({filteredResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {result.user_profile?.full_name || 'Usuário Anônimo'}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {result.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {result.top_gifts?.slice(0, 3).map((gift, index) => (
                          <Badge key={index} variant={index === 0 ? "default" : "secondary"}>
                            #{index + 1} {gift}
                          </Badge>
                        )) || <span className="text-xs text-gray-500">Sem resultados</span>}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(result.created_at)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/quiz/results/${result.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredResults.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Nenhum resultado encontrado.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}