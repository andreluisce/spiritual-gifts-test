'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuizReport } from '@/hooks/useQuizReport'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  Lightbulb,
  BookOpen,
  Target
} from 'lucide-react'

export default function QuizReportPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const { report, loading, error, fetchReport } = useQuizReport()
  const [isPrinting, setIsPrinting] = useState(false)

  useEffect(() => {
    if (sessionId) {
      fetchReport(sessionId)
    }
  }, [sessionId])

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando relatório...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">Erro ao carregar relatório</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { session_info, spiritual_gifts, questions_and_answers, ai_insights } = report

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className={`flex items-center justify-between ${isPrinting ? 'print:hidden' : ''}`}>
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Imprimir / Salvar PDF
          </Button>
        </div>

        {/* Report Title */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              Relatório Completo - Teste de Dons Espirituais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Usuário:</span>
                <p className="font-medium">{session_info.user_name}</p>
                <p className="text-sm text-gray-600">{session_info.user_email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Data:</span>
                <p className="font-medium">
                  {new Date(session_info.started_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {session_info.duration_minutes && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Duração: {session_info.duration_minutes} minutos
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spiritual Gifts Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Dons Espirituais Descobertos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {spiritual_gifts?.map((gift, index) => (
              <div
                key={gift.gift_key || `gift-${gift.rank || index}`}
                className={`p-4 rounded-lg border-2 ${gift.strength === 'Primário'
                  ? 'bg-yellow-50 border-yellow-300'
                  : gift.strength === 'Secundário'
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-gray-50 border-gray-200'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${gift.strength === 'Primário'
                        ? 'bg-yellow-400 text-yellow-900'
                        : gift.strength === 'Secundário'
                          ? 'bg-blue-400 text-blue-900'
                          : 'bg-gray-300 text-gray-700'
                        }`}
                    >
                      {gift.rank}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{gift.gift_name}</h3>
                      <Badge variant={gift.strength === 'Primário' ? 'default' : 'secondary'}>
                        {gift.strength}
                      </Badge>
                    </div>
                  </div>
                  {gift.rank === 1 && <CheckCircle className="h-8 w-8 text-yellow-600" />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Insights Section */}
        {ai_insights && ai_insights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-purple-600" />
                Insights e Orientações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {ai_insights.map((insight, index) => (
                <div key={`insight-${insight.gift_name || index}`} className="space-y-4 pb-6 border-b last:border-b-0">
                  <h3 className="text-xl font-semibold text-purple-900">{insight.gift_name}</h3>

                  {insight.description && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Descrição:</h4>
                      <p className="text-gray-600 leading-relaxed">{insight.description}</p>
                    </div>
                  )}

                  {insight.biblical_foundation && (
                    <div className="flex gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Fundamento Bíblico:</h4>
                        <p className="text-gray-600 leading-relaxed">{insight.biblical_foundation}</p>
                      </div>
                    </div>
                  )}

                  {insight.practical_applications && (
                    <div className="flex gap-2">
                      <Target className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Aplicações Práticas:</h4>
                        <p className="text-gray-600 leading-relaxed">{insight.practical_applications}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Questions and Answers Section */}
        {questions_and_answers && questions_and_answers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-gray-600" />
                Perguntas e Respostas ({questions_and_answers.length} perguntas)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questions_and_answers.map((qa, index) => (
                  <div key={qa.question_number || `qa-${index}`} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                        {qa.question_number}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">{qa.question_text}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="outline">{qa.gift_category}</Badge>
                          <span className="text-gray-600">
                            Resposta: <span className="font-medium text-blue-600">{qa.answer_label}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>Relatório gerado em {new Date().toLocaleDateString('pt-BR')}</p>
          <p className="mt-1">Teste de Dons Espirituais - Descubra Seu Dom</p>
        </div>
      </div>
    </div>
  )
}
