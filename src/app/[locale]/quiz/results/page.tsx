'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Gift, Download, Share2, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SpiritualGift, QuizResult } from '@/data/quiz-data'
import { spiritualGifts } from '@/data/quiz-data'

export default function ResultsPage() {
  const [results, setResults] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      // Try to get results from localStorage first
      const storedResults = localStorage.getItem('quizResult')
      
      if (storedResults) {
        const parsedResults = JSON.parse(storedResults) as QuizResult
        setResults(parsedResults)
      } else {
        // TODO: Fetch most recent results from Supabase for logged-in user
        // For now, show mock data if no localStorage data
        const mockResults: QuizResult = {
          id: '123',
          user_id: '456',
          total_score: {
            'teaching': 23,
            'leadership': 21,
            'prophecy': 19,
            'knowledge': 18,
            'evangelism': 17,
            'administration': 15,
            'faith': 14,
            'pastoring': 13,
            'wisdom': 12,
            'service': 11
          },
          top_gifts: ['Ensino', 'Liderança', 'Profecia', 'Conhecimento', 'Evangelismo'],
          created_at: new Date().toISOString()
        }
        setResults(mockResults)
      }
    } catch (error) {
      console.error('Error loading quiz results:', error)
      // Set empty results to show error state
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const getGiftByKey = (key: string): SpiritualGift | undefined => {
    return spiritualGifts.find(gift => gift.key === key)
  }

  const getScorePercentage = (score: number, maxPossibleScore: number = 25): number => {
    return (score / maxPossibleScore) * 100
  }

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    console.log('Download PDF')
  }

  const handleShare = () => {
    // TODO: Implement sharing functionality
    console.log('Share results')
  }

  const retakeQuiz = () => {
    router.push('/quiz')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Nenhum resultado encontrado</p>
          <Button onClick={() => router.push('/quiz')}>
            Fazer o Teste
          </Button>
        </div>
      </div>
    )
  }

  const sortedScores = Object.entries(results.total_score)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10) // Top 10 gifts

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Gift className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Seus Dons Espirituais
          </h1>
          <p className="text-gray-600">
            Resultado do teste realizado em {new Date(results.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Top Gifts Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Seus 5 Principais Dons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {results.top_gifts.map((giftName, index) => (
                <div key={index} className="text-center">
                  <Badge 
                    variant={index === 0 ? "default" : "secondary"}
                    className="text-sm px-3 py-1"
                  >
                    #{index + 1}
                  </Badge>
                  <p className="font-semibold mt-2">{giftName}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Scores */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pontuação Detalhada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {sortedScores.map(([giftKey, score], index) => {
              const gift = getGiftByKey(giftKey)
              if (!gift) return null
              
              const percentage = getScorePercentage(score)
              
              return (
                <div key={giftKey}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{gift.name}</h3>
                      <p className="text-sm text-gray-600">{gift.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{score}</div>
                      <div className="text-sm text-gray-500">pontos</div>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-3 mb-2" />
                  <div className="text-sm text-gray-500 mb-4">
                    {percentage.toFixed(0)}% de afinidade
                  </div>
                  {index < sortedScores.length - 1 && <Separator />}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Top Gift Details */}
        {(() => {
          const topGiftKey = sortedScores[0]?.[0]
          const topGift = getGiftByKey(topGiftKey)
          
          if (!topGift) return null
          
          return (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Seu Dom Principal: {topGift.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{topGift.description}</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Características:</h4>
                    <ul className="space-y-2">
                      {topGift.characteristics.map((characteristic, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{characteristic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Referências Bíblicas:</h4>
                    <ul className="space-y-2">
                      {topGift.biblicalReferences.map((reference, index) => (
                        <li key={index} className="text-blue-600 font-medium">
                          {reference}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })()}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
            <Download size={16} />
            Baixar PDF
          </Button>
          
          <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
            <Share2 size={16} />
            Compartilhar
          </Button>
          
          <Button variant="outline" onClick={retakeQuiz} className="flex items-center gap-2">
            <RotateCcw size={16} />
            Refazer Teste
          </Button>
          
          <Link href="/gifts">
            <Button variant="outline">
              Ver Todos os Dons
            </Button>
          </Link>
          
          <Link href="/dashboard">
            <Button variant="outline">
              Meu Histórico
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}