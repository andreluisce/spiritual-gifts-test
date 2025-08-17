'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Mail,
  Send,
  Settings,
  TestTube,
  AlertCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'
import { useEmailTest } from '@/hooks/useEmail'
import { useToast } from '@/components/ui/toast'

export default function AdminEmailSettingsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [showApiKey, setShowApiKey] = useState(false)
  const { testEmailService, testing, testResult, clearTestResult } = useEmailTest()
  const { addToast } = useToast()

  // Email configuration state
  const [emailConfig, setEmailConfig] = useState({
    resendApiKey: '',
    fromEmail: '',
    adminEmails: '',
    enableWelcomeEmail: true,
    enableResultsEmail: true,
    enableAdminNotifications: true
  })

  // Email service status
  const [emailStatus, setEmailStatus] = useState({
    isConfigured: false,
    loading: true
  })

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    // Load current email configuration from API
    const loadEmailStatus = async () => {
      try {
        const response = await fetch('/api/email/config/status')
        const result = await response.json()
        
        if (result.success) {
          setEmailStatus({
            isConfigured: result.config.isConfigured,
            loading: false
          })
          setEmailConfig(prev => ({
            ...prev,
            fromEmail: result.config.fromEmail,
            adminEmails: 'andreluisce@gmail.com'
          }))
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        console.error('Failed to load email status:', error)
        setEmailStatus({
          isConfigured: false,
          loading: false
        })
        addToast({
          type: 'error',
          title: 'Erro ao carregar configurações',
          description: 'Não foi possível verificar o status do serviço de email'
        })
      }
    }

    loadEmailStatus()
  }, [addToast])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  const handleTestEmail = async () => {
    clearTestResult()
    await testEmailService()
  }

  const handleSaveConfig = async () => {
    // In a real implementation, this would save to database/environment
    addToast({
      type: 'info',
      title: 'Configuração salva!',
      description: 'Em uma implementação real, isso salvaria no banco de dados'
    })
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      addToast({
        type: 'success',
        title: 'Copiado!',
        description: 'Texto copiado para área de transferência'
      })
    } catch {
      addToast({
        type: 'error',
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o texto'
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações de Email</h1>
            <p className="text-gray-600 mt-1">
              Configure o sistema de emails usando Resend
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Service Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Status do Serviço de Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Provedor de Email</span>
              <Badge variant="secondary">Resend</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status da Configuração</span>
              {emailStatus.loading ? (
                <Badge variant="secondary">Carregando...</Badge>
              ) : (
                <Badge variant={emailStatus.isConfigured ? "default" : "destructive"}>
                  {emailStatus.isConfigured ? "Configurado" : "Não Configurado"}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email de Origem</span>
              <span className="text-sm text-gray-600">{emailConfig.fromEmail}</span>
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={handleTestEmail} 
                disabled={testing || !emailStatus.isConfigured || emailStatus.loading}
                className="w-full"
              >
                {testing ? (
                  <>
                    <TestTube className="h-4 w-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Testar Serviço de Email
                  </>
                )}
              </Button>
              
              {testResult && (
                <div className={`mt-3 p-3 rounded-md text-sm ${
                  testResult.includes('✅') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {testResult}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração do Resend
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resend-api-key">Chave da API Resend</Label>
              <div className="flex gap-2">
                <Input
                  id="resend-api-key"
                  type={showApiKey ? "text" : "password"}
                  value={emailConfig.resendApiKey}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, resendApiKey: e.target.value }))}
                  placeholder="re_..."
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(emailConfig.resendApiKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Obtenha sua chave API em{' '}
                <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  resend.com/api-keys
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="from-email">Email de Origem</Label>
              <Input
                id="from-email"
                type="email"
                value={emailConfig.fromEmail}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                placeholder="noreply@seudominio.com"
              />
              <p className="text-xs text-gray-500">
                Deve ser um domínio verificado no Resend
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-emails">Emails dos Administradores</Label>
              <Textarea
                id="admin-emails"
                value={emailConfig.adminEmails}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, adminEmails: e.target.value }))}
                placeholder="admin1@exemplo.com, admin2@exemplo.com"
                rows={3}
              />
              <p className="text-xs text-gray-500">
                Emails separados por vírgula para receber notificações
              </p>
            </div>

            <Button onClick={handleSaveConfig} className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Salvar Configuração
            </Button>
          </CardContent>
        </Card>

        {/* Email Types Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Tipos de Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Email de Boas-vindas</p>
                  <p className="text-xs text-gray-500">Enviado quando usuário se registra</p>
                </div>
                <Badge variant={emailConfig.enableWelcomeEmail ? "default" : "secondary"}>
                  {emailConfig.enableWelcomeEmail ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Resultados do Quiz</p>
                  <p className="text-xs text-gray-500">Enviado após completar o teste</p>
                </div>
                <Badge variant={emailConfig.enableResultsEmail ? "default" : "secondary"}>
                  {emailConfig.enableResultsEmail ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Notificações Admin</p>
                  <p className="text-xs text-gray-500">Alertas para administradores</p>
                </div>
                <Badge variant={emailConfig.enableAdminNotifications ? "default" : "secondary"}>
                  {emailConfig.enableAdminNotifications ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Instruções de Configuração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                <div>
                  <p className="font-medium">Criar conta no Resend</p>
                  <p className="text-gray-600">Acesse resend.com e crie uma conta gratuita</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                <div>
                  <p className="font-medium">Verificar domínio</p>
                  <p className="text-gray-600">Configure e verifique seu domínio no painel do Resend</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                <div>
                  <p className="font-medium">Obter chave da API</p>
                  <p className="text-gray-600">Gere uma chave API no painel de configurações</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                <div>
                  <p className="font-medium">Configurar variáveis</p>
                  <p className="text-gray-600">Adicione as variáveis RESEND_API_KEY e RESEND_FROM_EMAIL ao .env.local</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">5</span>
                <div>
                  <p className="font-medium">Testar configuração</p>
                  <p className="text-gray-600">Use o botão &quot;Testar Serviço de Email&quot; para verificar se tudo está funcionando</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Nota sobre Desenvolvimento</p>
                  <p>No ambiente de desenvolvimento, certifique-se de ter as variáveis de ambiente configuradas no arquivo .env.local</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}