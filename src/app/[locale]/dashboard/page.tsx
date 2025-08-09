'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Award,
  Eye,
  Download,
  RefreshCw,
  Plus,
  AlertCircle,
  Play
} from 'lucide-react'
import Link from 'next/link'
import type { SpiritualGift } from '@/data/quiz-data'
import { useUserResults, useLatestResult, useGifts } from '@/hooks/use-quiz-queries'
import { useAuth } from '@/context/AuthContext'

const QUIZ_STATE_KEY = 'quiz_in_progress'

interface QuizState {
  answers: Record<number, number>
  currentQuestionIndex: number
  startedAt: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: results, isLoading: loadingResults, refetch: refetchResults } = useUserResults(user?.id || null)
  const { data: latestResult, isLoading: loadingLatestResult } = useLatestResult(user?.id || null)
  const { data: gifts, isLoading: loadingGifts } = useGifts()
  const [quizInProgress, setQuizInProgress] = useState<QuizState | null>(null)

  const loading = loadingResults || loadingLatestResult || loadingGifts

  // Check for quiz in progress
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const persistedState = localStorage.getItem(QUIZ_STATE_KEY)
      if (persistedState) {
        const state: QuizState = JSON.parse(persistedState)
        
        // Check if the state is not too old (e.g., 24 hours)
        const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours in ms
        const isStateValid = Date.now() - state.startedAt < MAX_AGE
        
        if (isStateValid && Object.keys(state.answers).length > 0) {
          setQuizInProgress(state)
        } else {
          // Clear old/invalid state
          localStorage.removeItem(QUIZ_STATE_KEY)
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted quiz state:', error)
      localStorage.removeItem(QUIZ_STATE_KEY)
    }
  }, [])

  const getGiftByKey = (key: string): SpiritualGift | undefined => {
    return gifts?.find(gift => gift.key === key)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getGiftEvolution = () => {
    if (!results || results.length < 2) return null

    const latest = results[0]
    const previous = results[1]

    const evolution = Object.entries(latest.totalScore).map(([giftKey, latestScore]) => {
      const previousScore = previous.totalScore[giftKey] || 0
      const change = latestScore - previousScore
      const gift = getGiftByKey(giftKey)

      return {
        giftKey,
        giftName: gift?.name || giftKey,
        latestScore,
        previousScore,
        change,
        percentChange: previousScore > 0 ? ((change / previousScore) * 100) : 0
      }
    }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change))

    return evolution.slice(0, 5) // Top 5 changes
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Meu Dashboard
            </h1>
            <p className="text-gray-600">
              Acompanhe sua jornada de descoberta dos dons espirituais
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Link href="/quiz">
              <Button className="flex items-center gap-2">
                {quizInProgress ? (
                  <>
                    <Play className="h-4 w-4" />
                    Continuar Teste
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Novo Teste
                  </>
                )}
              </Button>
            </Link>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => refetchResults()}>
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Quiz in Progress Alert */}
        {quizInProgress && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">
                    Teste em Progresso
                  </h3>
                  <p className="text-amber-700 mb-4">
                    Você tem um teste em andamento com {Object.keys(quizInProgress.answers).length} resposta(s) salva(s). 
                    Continue de onde parou para não perder seu progresso.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/quiz">
                      <Button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white">
                        <Play className="h-4 w-4" />
                        Continuar Teste
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        localStorage.removeItem(QUIZ_STATE_KEY)
                        setQuizInProgress(null)
                      }}
                      className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      Descartar Teste
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!results || results.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <Award className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
              Bem-vindo à sua jornada espiritual!
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {quizInProgress 
                ? "Você tem um teste em progresso. Continue de onde parou ou comece um novo teste."
                : "Você ainda não fez nenhum teste. Que tal descobrir seus dons espirituais agora?"
              }
            </p>
            <Link href="/quiz">
              <Button size="lg" className="flex items-center gap-2 mx-auto">
                {quizInProgress ? (
                  <>
                    <Play className="h-5 w-5" />
                    Continuar Teste
                  </>
                ) : (
                  <>
                    <Award className="h-5 w-5" />
                    Fazer Meu Primeiro Teste
                  </>
                )}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total de Testes</p>
                      <p className="text-2xl font-bold">{results.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Award className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Dom Principal</p>
                      <p className="text-lg font-bold">{latestResult?.topGifts[0] || 'N/A'}</p>
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
                      <p className="text-sm text-gray-600">Último Teste</p>
                      <p className="text-sm font-semibold">{latestResult ? formatDate(latestResult.createdAt) : 'N/A'}</p>
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
                      <p className="text-sm text-gray-600">Evolução</p>
                      <p className="text-lg font-bold">
                        {results.length > 1 ? 'Crescendo' : 'Primeiro'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Latest Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Resultado Mais Recente</span>
                    <Badge>{latestResult ? formatDate(latestResult.createdAt) : 'N/A'}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">Top 5 Dons</h4>
                      <div className="space-y-3">
                        {latestResult?.topGifts.slice(0, 5).map((giftName, index) => {
                          const giftKey = Object.entries(latestResult.totalScore)
                            .sort(([, a], [, b]) => b - a)[index][0]
                          const score = latestResult.totalScore[giftKey]
                          const maxScore = 25 // Assuming 5 questions per gift with max 5 points each

                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <Badge variant={index === 0 ? "default" : "secondary"}>
                                  #{index + 1}
                                </Badge>
                                <span className="font-medium">{giftName}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-24">
                                  <Progress value={(score / maxScore) * 100} className="h-2" />
                                </div>
                                <span className="text-sm font-semibold w-8">{score}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Link href="/quiz/results">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Ver Detalhes
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Evolution/Change */}
              {(() => {
                const evolution = getGiftEvolution()
                return evolution ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Evolução dos Dons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Comparação com o teste anterior
                        </p>
                        <div className="space-y-3">
                          {evolution.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="font-medium">{item.giftName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                  {item.previousScore} → {item.latestScore}
                                </span>
                                <Badge
                                  variant={item.change > 0 ? "default" : item.change < 0 ? "destructive" : "secondary"}
                                  className="text-xs"
                                >
                                  {item.change > 0 ? '+' : ''}{item.change}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Histórico de Testes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">
                          Faça mais testes para ver sua evolução
                        </p>
                        <Link href="/quiz">
                          <Button size="sm">Fazer Outro Teste</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}
            </div>

            {/* Historical Results */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico Completo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={result.sessionId}>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                        <div>
                          <div className="flex items-center gap-3">
                            <Badge variant={index === 0 ? "default" : "secondary"}>
                              {index === 0 ? 'Mais Recente' : `#${index + 1}`}
                            </Badge>
                            <span className="font-medium">
                              {formatDate(result.createdAt)}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {result.topGifts.slice(0, 3).map((gift, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {gift}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/quiz/results/${result.sessionId}`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Ver
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" className="flex items-center gap-2" disabled>
                            <Download className="h-4 w-4" />
                            PDF
                          </Button>
                        </div>
                      </div>
                      {index < results.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}