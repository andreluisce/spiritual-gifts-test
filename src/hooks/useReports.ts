import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

export interface AnalyticsReport {
  id: string
  title: string
  description: string | null
  report_type: 'overview' | 'spiritual_gifts' | 'demographics' | 'ai_analytics' | 'comprehensive'
  format: 'pdf' | 'csv' | 'json'
  date_range: '7d' | '30d' | '90d' | '1y' | 'all'
  data: Record<string, unknown>
  file_path: string | null
  file_size: number | null
  generated_by: string
  status: 'generating' | 'completed' | 'failed' | 'expired'
  error_message: string | null
  created_at: string
  completed_at: string | null
  expires_at: string
  download_count: number
  last_downloaded_at: string | null
}

export interface CreateReportRequest {
  title: string
  description?: string
  reportType?: 'overview' | 'spiritual_gifts' | 'demographics' | 'ai_analytics' | 'comprehensive'
  format?: 'pdf' | 'csv' | 'json'
  dateRange?: '7d' | '30d' | '90d' | '1y' | 'all'
}

export function useReports() {
  const { user } = useAuth()
  const [reports, setReports] = useState<AnalyticsReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      console.log('📊 useReports: Fetching reports...')
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/reports', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ useReports: Reports fetched successfully')
        setReports(result.reports)
      } else {
        throw new Error(result.error || 'Failed to fetch reports')
      }
    } catch (err) {
      console.error('❌ useReports: Error fetching reports:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [user])

  const generateReport = useCallback(async (reportRequest: CreateReportRequest) => {
    try {
      console.log('📊 useReports: Generating report...', reportRequest)
      setError(null)

      const response = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(reportRequest)
      })

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ useReports: Report generated successfully')
        // Refresh reports list
        await fetchReports()
        return result.report
      } else {
        throw new Error(result.error || 'Failed to generate report')
      }
    } catch (err) {
      console.error('❌ useReports: Error generating report:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }, [fetchReports])

  const deleteReport = useCallback(async (reportId: string) => {
    try {
      console.log('🗑️ useReports: Deleting report...', reportId)
      setError(null)

      const response = await fetch(`/api/admin/reports?id=${reportId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to delete report: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ useReports: Report deleted successfully')
        // Remove from local state
        setReports(prev => prev.filter(report => report.id !== reportId))
        return true
      } else {
        throw new Error(result.error || 'Failed to delete report')
      }
    } catch (err) {
      console.error('❌ useReports: Error deleting report:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }, [])

  const downloadReport = useCallback(async (reportId: string, format: string = 'json') => {
    try {
      console.log('📥 useReports: Downloading report...', reportId, format)
      
      const response = await fetch(`/api/admin/reports/download?id=${reportId}&format=${format}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to download report: ${response.status}`)
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Get filename from response headers
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || `report-${reportId}.${format}`
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log('✅ useReports: Report downloaded successfully')
      
      // Refresh reports to update download count
      await fetchReports()
      
      return true
    } catch (err) {
      console.error('❌ useReports: Error downloading report:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }, [fetchReports])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  return {
    reports,
    loading,
    error,
    generateReport,
    deleteReport,
    downloadReport,
    refetch: fetchReports
  }
}

// Hook for quick report generation
export function useQuickReport() {
  const { generateReport } = useReports()
  const [generating, setGenerating] = useState(false)

  const generateQuickReport = useCallback(async (
    type: 'overview' | 'spiritual_gifts' | 'ai_analytics' | 'comprehensive' = 'comprehensive',
    dateRange: '7d' | '30d' | '90d' | '1y' = '30d'
  ) => {
    setGenerating(true)
    try {
      const report = await generateReport({
        title: `${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} Report`,
        description: `Automatically generated ${type} report for ${dateRange}`,
        reportType: type,
        format: 'json',
        dateRange
      })
      return report
    } finally {
      setGenerating(false)
    }
  }, [generateReport])

  return {
    generateQuickReport,
    generating
  }
}