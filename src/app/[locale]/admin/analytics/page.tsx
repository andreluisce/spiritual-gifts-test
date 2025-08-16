'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  Users,
  FileText,
  Calendar,
  Download,
  ArrowLeft,
  Globe,
  Brain,
  Plus,
  ExternalLink,
  Trash2,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { formatScore, formatPercentage } from '@/data/quiz-data'
import { 
  useAnalyticsData, 
  useGiftDistribution, 
  useAdminStats,
  useAgeDemographics,
  useGeographicDistribution 
} from '@/hooks/useAdminData'
import { useReports, useQuickReport } from '@/hooks/useReports'

// All data comes from the database - no mock data

export default function AdminAnalyticsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const t = useTranslations('admin.analytics')
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30d')
  
  // Fetch real data
  const { analytics: realAnalytics, loading: analyticsLoading } = useAnalyticsData(dateRange)
  const { distribution: realGifts, loading: giftsLoading } = useGiftDistribution()
  const { stats: realStats, loading: statsLoading } = useAdminStats()
  const { demographics: ageDemographics, loading: ageLoading } = useAgeDemographics()
  const { distribution: geoDistribution, loading: geoLoading } = useGeographicDistribution()
  const { reports, loading: reportsLoading, generateReport, deleteReport, downloadReport } = useReports()
  const { generateQuickReport, generating } = useQuickReport()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, loading, router])

  if (loading || analyticsLoading || giftsLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  // Utility functions removed as they were using mock data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">{t('dateRange.7d')}</option>
            <option value="30d">{t('dateRange.30d')}</option>
            <option value="90d">{t('dateRange.90d')}</option>
            <option value="1y">{t('dateRange.1y')}</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t('exportData')}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="spiritual-gifts">{t('tabs.spiritualGifts')}</TabsTrigger>
          <TabsTrigger value="demographics">{t('tabs.demographics')}</TabsTrigger>
          <TabsTrigger value="reports">{t('tabs.reports')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('overview.totalQuizzes')}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(realAnalytics?.overview?.totalQuizzes || realStats?.totalQuizzes || 0).toLocaleString()}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  {t('overview.totalCompleted')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('overview.avgCompletionTime')}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatScore(realAnalytics?.overview?.avgCompletionTime || 0, 1)} min</div>
                <p className="text-xs text-muted-foreground">
                  {t('overview.optimalEngagement')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('overview.averageScore')}</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatScore(realAnalytics?.overview?.avgScore || realStats?.averageScore || 0, 1)}</div>
                <p className="text-xs text-muted-foreground">
                  {t('overview.outOfPossible')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('overview.completionRate')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(realAnalytics?.overview?.completionRate || 0, 1)}</div>
                <p className="text-xs text-muted-foreground">
                  {t('overview.usersComplete')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('overview.returningUsers')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(realAnalytics?.overview?.returningUsers || 0, 1)}</div>
                <p className="text-xs text-muted-foreground">
                  {t('overview.retentionRate')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('overview.mobileUsers')}</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(realAnalytics?.overview?.mobileUsers || 0, 1)}</div>
                <p className="text-xs text-muted-foreground">
                  {t('overview.viaMobile')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Real Analytics Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('overview.analyticsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('overview.analyticsDescription')}</p>
                <p className="text-xs text-gray-400 mt-2">{t('overview.chartsComingSoon')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Real Growth Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('overview.totalUsersCard')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{realStats?.totalUsers?.toLocaleString() || '0'}</p>
                    <p className="text-sm text-gray-500">{t('overview.registeredUsers')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('overview.activeUsersCard')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{realStats?.activeUsers?.toLocaleString() || '0'}</p>
                    <p className="text-sm text-gray-500">{t('overview.haveCompleted')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('overview.mostPopularGift')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Brain className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-lg font-bold text-purple-600">{realStats?.mostPopularGift || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{t('overview.topSpiritualGift')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="spiritual-gifts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {t('spiritualGifts.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {realGifts && realGifts.length > 0 ? (
                  realGifts.slice(0, 5).map((gift, index) => (
                    <div key={gift.gift_name} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <h3 className="font-medium">{gift.gift_name}</h3>
                            <p className="text-sm text-gray-500">{gift.count} {t('spiritualGifts.identifications')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">
                            {formatPercentage(gift.percentage, 1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${gift.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{t('spiritualGifts.noData')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Age Groups */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('demographics.ageDistribution.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ageLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : ageDemographics && ageDemographics.length > 0 ? (
                  <div className="space-y-4">
                    {ageDemographics.map((group: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{group.age_range}</span>
                          <span className="text-sm text-gray-500">
                            {group.count} ({formatPercentage(group.percentage)})
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${group.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{t('demographics.ageDistribution.description')}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Nenhum dado demográfico disponível ainda.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Countries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t('demographics.geographicDistribution.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {geoLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : geoDistribution && geoDistribution.length > 0 ? (
                  <div className="space-y-4">
                    {geoDistribution.map((location: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{location.country}</span>
                          <span className="text-sm text-gray-500">
                            {location.count} ({formatPercentage(location.percentage)})
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${location.percentage}%` }}
                          />
                        </div>
                        {location.cities && location.cities.length > 0 && (
                          <div className="pl-4">
                            <p className="text-xs text-gray-500">
                              Cidades: {location.cities.slice(0, 3).join(', ')}
                              {location.cities.length > 3 && ` +${location.cities.length - 3} mais`}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{t('demographics.geographicDistribution.description')}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Nenhum dado geográfico disponível ainda.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('reports.title')}
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => generateQuickReport('comprehensive', dateRange as any)}
                    disabled={generating}
                  >
                    {generating ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Gerar Relatório Rápido
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('reports.noReports')}</h3>
                  <p className="text-gray-600 mb-4">{t('reports.firstReport')}</p>
                  <Button 
                    onClick={() => generateQuickReport('comprehensive', dateRange as any)}
                    disabled={generating}
                  >
                    {generating ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Calendar className="h-4 w-4 mr-2" />
                    )}
                    {t('reports.generateReport')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-medium">{report.title}</h4>
                              <p className="text-sm text-gray-600">{report.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline">
                              {report.report_type.replace('_', ' ')}
                            </Badge>
                            <Badge variant="secondary">
                              {report.format.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(report.created_at).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {report.download_count} downloads
                            </span>
                            {report.file_size && (
                              <span className="text-xs text-gray-500">
                                {(report.file_size / 1024).toFixed(1)} KB
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(report.id, 'json')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            JSON
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(report.id, 'csv')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            CSV
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(report.id, 'txt')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            TXT
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja deletar este relatório?')) {
                                deleteReport(report.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
