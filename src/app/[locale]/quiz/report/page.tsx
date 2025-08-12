'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { useQuizQuestions, useLatestResult } from '@/hooks/use-quiz-queries'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { spiritualGifts } from '@/data/quiz-data'

// Import print styles
import '@/styles/print.css'

export default function QuizReportPage() {
  const router = useRouter()
  const locale = useLocale()
  const { user } = useAuth()
  const printRef = useRef<HTMLDivElement>(null)

  const { data: questions, isLoading, error } = useQuizQuestions()
  const { data: latestResult } = useLatestResult(user?.id || null)
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({})

  // Buscar respostas do usuário da sessão mais recente
  useEffect(() => {
    async function fetchUserAnswers() {
      if (!latestResult?.sessionId || !questions) return
      
      try {
        const { data, error } = await createSupabaseBrowserClient()
          .from('answers')
          .select('question_id, score')
          .eq('session_id', latestResult.sessionId)
        
        if (!error && data) {
          const answersMap: Record<number, number> = {}
          data.forEach(answer => {
            answersMap[answer.question_id] = answer.score
          })
          setUserAnswers(answersMap)
        }
      } catch (err) {
        console.warn('Erro ao buscar respostas:', err)
      }
    }
    
    fetchUserAnswers()
  }, [latestResult?.sessionId, questions])

  // Agrupar perguntas por dons e calcular pontuações
  const getQuestionsByGift = () => {
    if (!questions || !Object.keys(userAnswers).length) return []

    const giftGroups = spiritualGifts.map(gift => {
      const questionsForGift = questions.filter(q => q.gift_key === gift.key)
      const totalScore = questionsForGift.reduce((sum, q) => {
        return sum + (userAnswers[q.id] || 0)
      }, 0)
      
      return {
        gift,
        questions: questionsForGift,
        totalScore,
        questionsCount: questionsForGift.length
      }
    }).filter(group => group.questionsCount > 0)

    return giftGroups.sort((a, b) => b.totalScore - a.totalScore)
  }

  const giftGroups = getQuestionsByGift()
  
  // Dados para o gráfico de pizza
  const pieChartData = giftGroups.map(group => ({
    name: group.gift.name,
    value: group.totalScore,
    percentage: giftGroups.reduce((sum, g) => sum + g.totalScore, 0) > 0 
      ? ((group.totalScore / giftGroups.reduce((sum, g) => sum + g.totalScore, 0)) * 100).toFixed(1)
      : 0
  }))

  // Cores para o gráfico
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347']

  const handleDownloadPDF = () => {
    // Implementação simples usando window.print() que permite salvar como PDF
    window.print()
  }

  useEffect(() => {
    if (!user) {
      router.replace(`/${locale}/login?from=quiz-report`)
    }
  }, [user, router, locale])

  const getScoreLabel = (score: number) => {
    // Opções mais suaves e graduais
    const labels = ['Não me identifico', 'Identifico-me pouco', 'Identifico-me bem', 'Identifico-me muito']
    return labels[score] || ''
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12"
        >
          <FileText className="w-12 h-12 text-slate-600" />
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <FileText className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700 mb-4">Erro ao carregar relatório</p>
          <Button onClick={() => router.back()} className="bg-slate-700 hover:bg-slate-800 text-white">
            Voltar
          </Button>
        </motion.div>
      </div>
    )
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <p className="text-lg text-gray-600 mb-4">Nenhuma pergunta encontrada</p>
          <Button onClick={() => router.back()} className="bg-slate-700 hover:bg-slate-800">
            Voltar
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          @page { 
            margin: 1.5cm; 
            size: A4 portrait; 
            orphans: 2;
            widows: 2;
          }
          
          /* Reset and base layout */
          html, body {
            background: white !important;
            color: black !important;
            font-family: Arial, sans-serif !important;
            line-height: 1.3 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
          
          /* Hide elements for print */
          .print\\:hidden,
          button,
          .print\\:block { display: none !important; }
          
          /* Main container */
          .min-h-screen {
            min-height: auto !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          
          .max-w-4xl {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          
          /* Typography */
          h1 { 
            font-size: 16px !important; 
            margin: 0 0 15px 0 !important; 
            text-align: center !important;
            font-weight: bold !important;
          }
          h2 { 
            font-size: 14px !important; 
            margin: 0 0 10px 0 !important; 
            font-weight: bold !important;
          }
          h3, h4 { 
            font-size: 12px !important; 
            margin: 0 0 8px 0 !important; 
            font-weight: bold !important;
          }
          
          .text-xl, .text-2xl { 
            font-size: 14px !important; 
            font-weight: bold !important; 
            margin: 0 0 8px 0 !important;
          }
          .text-lg { 
            font-size: 12px !important; 
            font-weight: bold !important; 
            margin: 0 0 6px 0 !important;
          }
          .text-sm { font-size: 10px !important; }
          .text-xs { font-size: 9px !important; }
          
          /* Card styling */
          .shadow-lg {
            box-shadow: none !important;
            border: 1.5px solid #333 !important;
            margin: 0 0 20px 0 !important;
            padding: 12px !important;
            page-break-inside: avoid !important;
            background: white !important;
            border-radius: 4px !important;
            width: 100% !important;
            position: relative !important;
          }
          
          /* Card content spacing */
          .p-6, .p-4, .p-3 { 
            padding: 8px !important; 
            margin: 0 !important;
          }
          
          /* Page break logic - every 3rd group starts new page */
          .space-y-6 > div:nth-child(3n+1) {
            page-break-before: always !important;
          }
          .space-y-6 > div:first-child {
            page-break-before: auto !important;
          }
          
          /* Flex layouts */
          .flex { display: flex !important; }
          .justify-between { justify-content: space-between !important; }
          .items-center { align-items: center !important; }
          .gap-3, .gap-2 { gap: 8px !important; }
          
          /* Backgrounds */
          .bg-blue-100 { background: #f0f0f0 !important; }
          .bg-slate-50 { background: #f8f8f8 !important; }
          .text-blue-600, .text-green-600 { color: #000 !important; font-weight: bold !important; }
          .text-slate-800, .text-slate-700, .text-slate-600 { color: #333 !important; }
          .text-gray-600, .text-gray-500 { color: #666 !important; }
          
          /* Grid layouts */
          .grid-cols-2 { 
            display: grid !important; 
            grid-template-columns: 1fr 1fr !important; 
            gap: 8px !important; 
            margin: 0 !important;
          }
          
          /* Space control */
          .space-y-2 > * + * { margin-top: 6px !important; }
          .space-y-4 > * + * { margin-top: 10px !important; }
          .space-y-6 > * + * { margin-top: 0 !important; } /* Reset for main container */
          
          /* Ensure proper spacing for questions list */
          .border-l-4 {
            border-left: 3px solid #ddd !important;
            padding-left: 8px !important;
            margin: 0 0 6px 0 !important;
          }
          
          /* Hide chart for print but show summary at end */
          .print-page-break.hidden.print\\:block {
            display: block !important;
            page-break-before: always !important;
            margin: 20px 0 !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100 p-4">
        <div className="max-w-4xl mx-auto py-4 md:py-8" ref={printRef}>
        
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-6 md:mb-8"
        >
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white rounded-full p-4 shadow-lg"
            >
              <FileText className="h-8 w-8 md:h-10 md:w-10 text-slate-600" />
            </motion.div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 print-compact-title">
            Relatório de Dons Espirituais
          </h1>
          <p className="text-slate-600 mb-4">
            Análise detalhada das {questions?.length || 0} perguntas agrupadas por dons espirituais
            {latestResult && (
              <span className="block text-sm">
                Resultado de: {new Date(latestResult.createdAt).toLocaleDateString('pt-BR')}
              </span>
            )}
          </p>

          {/* Navigation buttons */}
          <div className="flex justify-center gap-4 mb-6 print:hidden">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Voltar
            </Button>
            
            <Button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download size={16} />
              Baixar PDF
            </Button>
          </div>
        </motion.div>

        {/* Gráfico de Pizza */}
        {giftGroups.length > 0 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8 print:hidden"
          >
            <Card className="shadow-lg border border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-800 text-center">
                  Distribuição de Pontuação por Dom Espiritual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percentage}) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Dons Espirituais Agrupados */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-6"
        >
          {giftGroups.map((group, groupIndex) => (
            <Card key={group.gift.key} className="shadow-lg border border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[groupIndex % COLORS.length] }}
                    />
                    {group.gift.name}
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{group.totalScore}</div>
                    <div className="text-sm text-gray-500">pontos</div>
                  </div>
                </CardTitle>
                <p className="text-gray-600">
                  {group.gift.description}
                </p>
              </CardHeader>
              <CardContent>
                {/* Lista de perguntas do dom */}
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-700 mb-3">
                    Perguntas ({group.questions.length}):
                  </h4>
                  {group.questions.map((question, questionIndex) => {
                    const userAnswer = userAnswers[question.id]
                    const hasAnswer = userAnswer !== undefined
                    
                    return (
                      <div key={question.id} className="border-l-4 border-gray-200 pl-4 py-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <span className="font-medium text-sm text-slate-600">
                              {questionIndex + 1}.
                            </span>
                            <span className="text-sm text-slate-800 ml-2">
                              {question.question}
                            </span>
                          </div>
                          {hasAnswer && (
                            <div className="flex-shrink-0 bg-blue-100 px-3 py-1 rounded-full">
                              <span className="text-sm font-bold text-blue-800">
                                {getScoreLabel(userAnswer)} ({userAnswer})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Pontuação detalhada */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-600">Total de Perguntas:</span>
                      <span className="ml-2 font-bold">{group.questions.length}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Pontuação Total:</span>
                      <span className="ml-2 font-bold text-blue-600">{group.totalScore}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Média por Pergunta:</span>
                      <span className="ml-2 font-bold">
                        {(group.totalScore / group.questions.length).toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">% do Total:</span>
                      <span className="ml-2 font-bold text-green-600">
                        {pieChartData.find(p => p.name === group.gift.name)?.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Gráfico no final para impressão */}
        {giftGroups.length > 0 && (
          <div className="print-page-break mt-8 hidden print:block">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Gráfico de Distribuição dos Dons</h2>
            </div>
            <div className="w-full flex justify-center">
              <div className="text-center max-w-md">
                <h3 className="text-lg font-semibold mb-4">Distribuição de Pontuação por Dom Espiritual</h3>
                {giftGroups.map((group, index) => (
                  <div key={group.gift.key} className="flex items-center justify-between py-2 border-b text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{group.gift.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{group.totalScore} pts</span>
                      <span className="text-gray-600 ml-2 text-xs">
                        ({pieChartData.find(p => p.name === group.gift.name)?.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Total de Perguntas
            </h3>
            <p className="text-3xl font-bold text-slate-700 mb-2">
              {questions.length}
            </p>
            <p className="text-sm text-slate-600">
              Perguntas organizadas para avaliar os 7 dons espirituais principais
            </p>
          </div>
        </motion.div>
        </div>
      </div>
    </>
  )
}