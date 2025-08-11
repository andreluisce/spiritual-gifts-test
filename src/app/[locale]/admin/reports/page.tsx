'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft,
  Download,
  TrendingUp,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface ReportStats {
  totalUsers: number
  totalTests: number
  testsThisMonth: number
  testsToday: number
  giftDistribution: Record<string, number>
  monthlyGrowth: number
}

export default function AdminReportsPage() {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isAdmin, loading, router])

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchStats()
    }
  }, [isAuthenticated, isAdmin])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })

      // Get total tests (completed sessions)
      const { count: totalTests } = await supabase
        .from('quiz_sessions')
        .select('*', { count: 'exact' })
        .not('completed_at', 'is', null)

      // Get tests this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const { count: testsThisMonth } = await supabase
        .from('quiz_sessions')
        .select('*', { count: 'exact' })
        .not('completed_at', 'is', null)
        .gte('created_at', startOfMonth.toISOString())

      // Get tests today
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      
      const { count: testsToday } = await supabase
        .from('quiz_sessions')
        .select('*', { count: 'exact' })
        .not('completed_at', 'is', null)
        .gte('created_at', startOfDay.toISOString())

      // Get gift distribution (most common top gifts)
      const { data: sessions } = await supabase
        .from('quiz_sessions')
        .select('id')
        .not('completed_at', 'is', null)

      const giftDistribution: Record<string, number> = {}
      
      if (sessions) {
        for (const session of sessions) {
          try {
            const { data: topGift } = await supabase
              .rpc('best_gifts', { p_session_id: session.id, p_limit: 1 })
            
            if (topGift && topGift[0]) {
              const gift = topGift[0].gift
              giftDistribution[gift] = (giftDistribution[gift] || 0) + 1
            }
          } catch (error) {
            console.error('Error getting top gift for session:', session.id, error)
          }
        }
      }

      setStats({
        totalUsers: totalUsers || 0,
        totalTests: totalTests || 0,
        testsThisMonth: testsThisMonth || 0,
        testsToday: testsToday || 0,
        giftDistribution,
        monthlyGrowth: 0 // TODO: Calculate based on previous month
      })

    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateReport = () => {
    if (!stats) return

    const reportData = {
      'Relatório de Uso': '',
      'Data de Geração': new Date().toLocaleDateString('pt-BR'),
      '': '',
      'Estatísticas Gerais': '',
      'Total de Usuários': stats.totalUsers,
      'Total de Testes Realizados': stats.totalTests,
      'Testes Este Mês': stats.testsThisMonth,
      'Testes Hoje': stats.testsToday,
      ' ': '',
      'Distribuição de Dons Principais': '',
      ...stats.giftDistribution
    }

    const reportText = Object.entries(reportData)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')

    const blob = new Blob([reportText], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

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

  const topGifts = stats?.giftDistribution ? 
    Object.entries(stats.giftDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5) : []

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
              Relatórios e Estatísticas
            </h1>
            <p className="text-gray-600">
              Análises detalhadas do uso do sistema
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button onClick={generateReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Baixar Relatório
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Usuários</p>
                  <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Testes</p>
                  <p className="text-2xl font-bold">{stats?.totalTests || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Este Mês</p>
                  <p className="text-2xl font-bold">{stats?.testsThisMonth || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hoje</p>
                  <p className="text-2xl font-bold">{stats?.testsToday || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Gifts */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Dons Mais Identificados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topGifts.map(([gift, count], index) => (
                  <div key={gift} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <span className="font-medium">{gift}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{count}</p>
                      <p className="text-xs text-gray-500">
                        {stats?.totalTests ? Math.round((count / stats.totalTests) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo do Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Crescimento</h4>
                  <p className="text-sm text-blue-600">
                    {stats?.testsThisMonth || 0} testes realizados este mês
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Engajamento</h4>
                  <p className="text-sm text-green-600">
                    Média de {stats?.totalTests && stats?.totalUsers ? 
                      (stats.totalTests / stats.totalUsers).toFixed(1) : 0} testes por usuário
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Dom Mais Popular</h4>
                  <p className="text-sm text-purple-600">
                    {topGifts[0] ? `${topGifts[0][0]} (${topGifts[0][1]} vezes)` : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}