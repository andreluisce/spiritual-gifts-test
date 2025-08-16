'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import { useAIAnalytics, useAIRecentActivity } from '@/hooks/useAIAnalytics'
import { Sparkles, TrendingUp, Users, Activity, BarChart3, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export default function AIAnalyticsPage() {
  const t = useTranslations('admin.analytics')
  const [refreshing, setRefreshing] = useState(false)
  const { data: allData, loading, error, refetch } = useAIAnalytics('all')
  const { activities, loading: activitiesLoading, refetch: refetchActivities } = useAIRecentActivity(20)

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetch(), refetchActivities()])
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">Erro ao carregar analytics: {error}</p>
          <Button onClick={handleRefresh} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  const overview = allData.overview || {}
  const timeline = allData.timeline || []
  const byGift = allData.byGift || []
  const systemStatus = allData.systemStatus || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics da IA</h1>
          <p className="text-gray-600">Análise detalhada do uso e performance da IA</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Análises</CardTitle>
            <Sparkles className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_analyses || 0}</div>
            <p className="text-xs text-gray-500">
              {overview.analyses_today || 0} hoje, {overview.analyses_this_week || 0} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Cache</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.cache_hit_rate || 0}%</div>
            <p className="text-xs text-gray-500">
              {overview.cache_hits || 0} hits / {overview.api_calls || 0} chamadas API
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Únicos</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.unique_users || 0}</div>
            <p className="text-xs text-gray-500">
              Usuários que utilizaram IA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confiança Média</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.avg_confidence_score || 0}%</div>
            <p className="text-xs text-gray-500">
              Dom popular: {overview.most_analyzed_gift || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Status do Sistema IA
          </CardTitle>
          <CardDescription>
            Configuração atual e saúde do sistema de IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={systemStatus.ai_button_enabled ? "default" : "secondary"}>
                {systemStatus.ai_button_enabled ? "Ativo" : "Inativo"}
              </Badge>
              <span className="text-sm text-gray-600">Botão IA</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={systemStatus.auto_generate_enabled ? "default" : "secondary"}>
                {systemStatus.auto_generate_enabled ? "Ativo" : "Inativo"}
              </Badge>
              <span className="text-sm text-gray-600">Auto-geração</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {systemStatus.cache_strategy || 'gift_scores'}
              </Badge>
              <span className="text-sm text-gray-600">Estratégia Cache</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={
                  (systemStatus.system_health_score || 0) > 80 ? "default" : 
                  (systemStatus.system_health_score || 0) > 60 ? "secondary" : "destructive"
                }
              >
                {systemStatus.system_health_score || 0}%
              </Badge>
              <span className="text-sm text-gray-600">Saúde Sistema</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown by Gift */}
      {byGift.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Análises por Dom Espiritual</CardTitle>
            <CardDescription>
              Distribuição de análises por tipo de dom principal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {byGift.slice(0, 7).map((gift: any) => (
                <div key={gift.gift_key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="font-medium">{gift.gift_key}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{gift.analysis_count} análises</span>
                    <span>{gift.avg_confidence}% confiança</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            Atividade Recente
          </CardTitle>
          <CardDescription>
            Últimas análises de IA geradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : activities.length === 0 ? (
            <p className="text-gray-500 text-center py-6">Nenhuma atividade recente encontrada</p>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 10).map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {activity.is_cached ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-blue-600" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{activity.user_email}</p>
                      <p className="text-xs text-gray-500">
                        Dom: {activity.primary_gift} • {activity.confidence_score}% confiança
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={activity.is_cached ? "secondary" : "default"}>
                      {activity.is_cached ? "Cache" : "Nova IA"}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline Chart Placeholder */}
      {timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline de Uso (Últimos 30 dias)</CardTitle>
            <CardDescription>
              Análises geradas por dia nos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 mb-4">
                Total nos últimos 30 dias: {timeline.reduce((sum: number, day: any) => sum + day.daily_analyses, 0)} análises
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {timeline.slice(-7).map((day: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className="text-gray-500">
                      {new Date(day.analysis_date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </div>
                    <div className="bg-blue-100 rounded p-2 mt-1">
                      <div className="font-medium">{day.daily_analyses}</div>
                      <div className="text-gray-600">análises</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}