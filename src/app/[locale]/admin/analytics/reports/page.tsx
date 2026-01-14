'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Calendar,
  Download,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { useReports, useQuickReport } from '@/hooks/useReports'
import AnalyticsNavigation from '@/components/AnalyticsNavigation'
import { usePermissions } from '@/hooks/usePermissions'

type DateRange = '7d' | '30d' | '90d' | '1y'

export default function AnalyticsReportsPage() {
  const { user, isAdmin, isManager, loading } = useAuth()
  const { canViewAnalytics } = usePermissions()
  const router = useRouter()
  const t = useTranslations('admin.analytics')
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  
  // Fetch real data
  const { reports, loading: reportsLoading, deleteReport, downloadReport } = useReports()
  const { generateQuickReport, generating } = useQuickReport()

  useEffect(() => {
    const allowed = isAdmin || isManager || canViewAnalytics
    if (!loading && (!user || !allowed)) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, isManager, canViewAnalytics, loading, router])

  if (loading || reportsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !(isAdmin || isManager || canViewAnalytics)) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('tabs.reports')}</h1>
          <p className="text-gray-600 mt-1">
            {t('reports.subtitle')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-3 py-2 border rounded-md text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap"
          >
            <option value="7d">{t('dateRange.7d')}</option>
            <option value="30d">{t('dateRange.30d')}</option>
            <option value="90d">{t('dateRange.90d')}</option>
            <option value="1y">{t('dateRange.1y')}</option>
          </select>
          <Button 
            onClick={() => generateQuickReport('comprehensive', dateRange)}
            disabled={generating}
            className="whitespace-nowrap"
          >
            {generating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            <span className="hidden sm:inline">Gerar Relatório</span>
            <span className="sm:hidden">Gerar</span>
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <AnalyticsNavigation />

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
                onClick={() => generateQuickReport('comprehensive', dateRange)}
                disabled={generating}
                className="whitespace-nowrap"
              >
                {generating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                <span className="hidden sm:inline">Gerar Relatório Rápido</span>
                <span className="sm:hidden">Gerar</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('reports.noReports')}</h3>
              <p className="text-gray-600 mb-4">{t('reports.firstReport')}</p>
              <Button 
                onClick={() => generateQuickReport('comprehensive', dateRange)}
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
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium truncate">{report.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <Badge variant="outline" className="whitespace-nowrap">
                          {report.report_type.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {report.format.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(report.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {report.download_count} downloads
                        </span>
                        {report.file_size && (
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {(report.file_size / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReport(report.id, 'json')}
                        className="whitespace-nowrap flex-1 sm:flex-initial"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        JSON
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReport(report.id, 'csv')}
                        className="whitespace-nowrap flex-1 sm:flex-initial"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReport(report.id, 'txt')}
                        className="whitespace-nowrap flex-1 sm:flex-initial"
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
                        className="whitespace-nowrap"
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

      {/* Report generation stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Relatórios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">Relatórios gerados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Downloads Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.reduce((sum, report) => sum + report.download_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Arquivos baixados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Último Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {reports.length > 0 
                ? new Date(reports[0].created_at).toLocaleDateString('pt-BR')
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">Data de criação</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
