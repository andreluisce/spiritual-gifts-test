import { useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

interface EmailResult {
  success: boolean
  message: string
  emailId?: string
  error?: string
}

export function useEmail() {
  const { user } = useAuth()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendQuizResultsEmail = useCallback(async (sessionId: string): Promise<EmailResult> => {
    if (!user) {
      const errorMsg = 'User must be authenticated to send results email'
      setError(errorMsg)
      return { success: false, message: errorMsg }
    }

    setSending(true)
    setError(null)

    try {
      
      const response = await fetch('/api/email/send-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ sessionId })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return {
          success: true,
          message: 'Email enviado com sucesso!',
          emailId: result.emailId
        }
      } else {
        const errorMsg = result.error || 'Falha ao enviar email'
        setError(errorMsg)
        return { success: false, message: errorMsg, error: errorMsg }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('❌ useEmail: Error sending quiz results email:', err)
      setError(errorMsg)
      return { success: false, message: errorMsg, error: errorMsg }
    } finally {
      setSending(false)
    }
  }, [user])

  const sendWelcomeEmail = useCallback(async (): Promise<EmailResult> => {
    if (!user) {
      const errorMsg = 'User must be authenticated to send welcome email'
      setError(errorMsg)
      return { success: false, message: errorMsg }
    }

    setSending(true)
    setError(null)

    try {
      
      const response = await fetch('/api/email/welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({})
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return {
          success: true,
          message: 'Email de boas-vindas enviado com sucesso!',
          emailId: result.emailId
        }
      } else {
        const errorMsg = result.error || 'Falha ao enviar email'
        setError(errorMsg)
        return { success: false, message: errorMsg, error: errorMsg }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('❌ useEmail: Error sending welcome email:', err)
      setError(errorMsg)
      return { success: false, message: errorMsg, error: errorMsg }
    } finally {
      setSending(false)
    }
  }, [user])

  const sendAdminNotification = useCallback(async (
    type: 'new_user' | 'quiz_completed' | 'report_generated' | 'system_alert',
    userName: string,
    userEmail: string,
    details?: Record<string, unknown>
  ): Promise<EmailResult> => {
    setSending(true)
    setError(null)

    try {
      
      const response = await fetch('/api/email/admin-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ type, userName, userEmail, details })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return {
          success: true,
          message: 'Notificação enviada aos administradores',
          emailId: result.emailId
        }
      } else {
        const errorMsg = result.error || 'Falha ao enviar notificação'
        setError(errorMsg)
        return { success: false, message: errorMsg, error: errorMsg }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('❌ useEmail: Error sending admin notification:', err)
      setError(errorMsg)
      return { success: false, message: errorMsg, error: errorMsg }
    } finally {
      setSending(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    sendQuizResultsEmail,
    sendWelcomeEmail,
    sendAdminNotification,
    sending,
    error,
    clearError
  }
}

// Hook for testing email functionality (admin only)
export function useEmailTest() {
  const { user, isAdmin } = useAuth()
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const testEmailService = useCallback(async (): Promise<EmailResult> => {
    if (!user || !isAdmin) {
      return { success: false, message: 'Admin access required' }
    }

    setTesting(true)
    setTestResult(null)

    try {
      
      // Send a test welcome email to the admin
      const response = await fetch('/api/email/welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({})
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const successMsg = `✅ Teste de email realizado com sucesso! Email enviado para ${user.email}`
        setTestResult(successMsg)
        return { success: true, message: successMsg, emailId: result.emailId }
      } else {
        const errorMsg = `❌ Teste falhou: ${result.error || 'Erro desconhecido'}`
        setTestResult(errorMsg)
        return { success: false, message: errorMsg }
      }
    } catch (err) {
      const errorMsg = `❌ Erro no teste: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
      console.error('❌ useEmailTest: Error testing email service:', err)
      setTestResult(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setTesting(false)
    }
  }, [user, isAdmin])

  return {
    testEmailService,
    testing,
    testResult,
    clearTestResult: () => setTestResult(null)
  }
}