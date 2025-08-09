'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Book, BookOpen, Star, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuiz } from '@/hooks/use-quiz'
import { useTranslations, useLocale } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [progressValue, setProgressValue] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const router = useRouter()
  const t = useTranslations('quiz')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const { user } = useAuth()

  const {
    questions,
    loading,
    error,
    currentAnswers,
    isSubmitting,
    updateAnswer,
    submitQuiz,
    refetch
  } = useQuiz()

  // Preview mode: only 3 questions for non-logged users
  const isPreviewMode = !user
  const maxQuestions = isPreviewMode ? 3 : (questions?.length || 0)
  const availableQuestions = questions ? questions.slice(0, maxQuestions) : []

  const currentQuestion = availableQuestions && availableQuestions.length > 0 ? availableQuestions[currentQuestionIndex] : null
  const answeredCount = Object.keys(currentAnswers).length
  const progress = availableQuestions && availableQuestions.length > 0 ? (answeredCount / availableQuestions.length) * 100 : 0
  const isLastQuestion = availableQuestions ? currentQuestionIndex === availableQuestions.length - 1 : false
  const canProceed = currentQuestion ? currentAnswers[currentQuestion.id] !== undefined : false

  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressValue(progress)
    }, 300)
    return () => clearTimeout(timer)
  }, [progress])

  // Set initial selected answer when question changes
  useEffect(() => {
    if (currentQuestion) {
      setSelectedAnswer(currentAnswers[currentQuestion.id] ?? null)
    }
  }, [currentQuestion, currentAnswers])

  const handleAnswer = (score: number) => {
    if (currentQuestion && !isTransitioning) {
      setSelectedAnswer(score)
      updateAnswer(currentQuestion.id, score)

      // Small delay then auto-advance
      setIsTransitioning(true)
      setTimeout(() => {
        if (!isLastQuestion) {
          goToNext()
        }
        setIsTransitioning(false)
      }, 800)
    }
  }

  const goToNext = async () => {
    if (isLastQuestion) {
      if (isPreviewMode) {
        router.push(`/${locale}/login?from=quiz-preview`)
        return
      }

      if (!user || !user.id) {
        console.error("User not logged in or user ID not available.")
        router.push(`/${locale}/login`)
        return
      }

      // Submit quiz and navigate to results
      const result = await submitQuiz(user.id)
      if (result) {
        localStorage.setItem('quizResult', JSON.stringify(result))
        router.push(`/${locale}/quiz/results`)
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
    }
  }

  const goToPrevious = () => {
    if (currentQuestionIndex > 0 && !isTransitioning) {
      setCurrentQuestionIndex(prev => prev - 1)
      setSelectedAnswer(null)
    }
  }

  const getScoreLabel = (score: number) => {
    const labels = ['Nunca', 'Raramente', 'Às vezes', 'Sempre']
    return labels[score] || ''
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12"
        >
          <BookOpen className="w-12 h-12 text-slate-600" />
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
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700 mb-4">{error}</p>
          <Button onClick={refetch} className="bg-slate-700 hover:bg-slate-800 text-white">
            {tCommon('tryAgain')}
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
          <p className="text-lg text-gray-600 mb-4">{t('noQuestionsFound')}</p>
          <Button onClick={refetch} className="bg-slate-700 hover:bg-slate-800">
            {tCommon('reload')}
          </Button>
        </motion.div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">{t('errorCurrentQuestion')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100 p-4">
      <div className="max-w-4xl mx-auto py-4 md:py-8">

        {/* User Header — visível apenas em md+ */}
        {user && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <User className="h-5 w-5 text-slate-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs text-slate-500">Teste Completo</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="text-slate-600 border-slate-300">
                Dashboard
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Header principal — compacto no mobile */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-4 md:mb-8"
        >
          <div className="hidden md:flex justify-center mb-6">
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white rounded-full p-4 shadow-lg"
            >
              <Book className="h-10 w-10 text-slate-600" />
            </motion.div>
          </div>

          <h1 className="text-xl md:text-3xl font-bold text-slate-800 mb-2 md:mb-3">
            {isPreviewMode ? "Preview - Dons Espirituais" : "Teste de Dons Espirituais"}
          </h1>

          <div className="flex items-center justify-center gap-2 text-slate-600 text-sm md:text-base">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden md:block" />
            <span className="font-medium">
              Pergunta {currentQuestionIndex + 1} de {availableQuestions?.length || 0}
              {isPreviewMode && <span className="text-amber-600 ml-2">(Preview)</span>}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden md:block" />
          </div>
        </motion.div>

        {/* Barra de progresso — mais fina no mobile */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-4 md:mb-8"
        >
          <div className="flex justify-between items-center mb-2 md:mb-3">
            <span className="text-xs md:text-sm font-medium text-slate-600">Progresso</span>
            <span className="text-xs md:text-sm font-semibold text-slate-700">
              {Math.round(progressValue)}%
            </span>
          </div>
          <div className="relative bg-gray-200 rounded-full h-2 md:h-3 overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-slate-600 to-slate-700 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressValue}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-[10px] md:text-xs text-slate-500 mt-1 md:mt-2">
            <span>Início</span>
            <span>{answeredCount}/{availableQuestions.length} respondidas</span>
            <span>Concluído</span>
          </div>
        </motion.div>

        {/* Card da pergunta — sem CardHeader no mobile */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Card className="mb-6 md:mb-8 shadow-lg border border-slate-200 bg-white">
              <div className="px-4 pt-4 md:px-6 md:pt-6">
                <h2 className="text-base md:text-xl leading-relaxed text-slate-800 text-center line-clamp-3">
                  {currentQuestion.question}
                </h2>
              </div>
              <CardContent className="p-4 md:p-6">
                <RadioGroup
                  value={selectedAnswer?.toString() || ''}
                  onValueChange={(value) => handleAnswer(parseInt(value))}
                  className="space-y-2 md:space-y-3"
                >
                  {[0, 1, 2, 3].map((score) => (
                    <motion.div
                      key={score}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`relative rounded-lg border transition-all duration-200 ${selectedAnswer === score
                        ? 'border-slate-400 shadow bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div className="p-3 md:p-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value={score.toString()}
                            id={`score-${score}`}
                            className="h-4 w-4 md:h-5 md:w-5 border-slate-300 text-slate-700 data-[state=checked]:border-slate-600 data-[state=checked]:bg-slate-600"
                          />
                          <Label
                            htmlFor={`score-${score}`}
                            className="flex-1 cursor-pointer text-sm md:text-base font-medium text-slate-700"
                          >
                            <div className="flex items-center justify-between">
                              <span>{getScoreLabel(score)}</span>
                              {selectedAnswer === score && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: "spring", stiffness: 400 }}
                                >
                                  <CheckCircle2 className="ml-2 h-4 w-4 md:h-5 md:w-5 text-slate-600" />
                                </motion.div>
                              )}
                            </div>
                          </Label>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navegação — sticky no mobile */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="sticky bottom-0 left-0 right-0 bg-[rgba(250,250,250,0.85)] supports-[backdrop-filter]:backdrop-blur md:bg-transparent md:static flex justify-between items-center py-2 md:py-0"
        >
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentQuestionIndex === 0 || isTransitioning}
            className="flex items-center gap-2 px-4 py-2 border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 text-sm md:text-base"
          >
            <ArrowLeft size={16} className="md:hidden" />
            <span className="hidden md:inline">Anterior</span>
          </Button>

          <div className="text-center">
            <div className="text-xs md:text-sm text-slate-600 font-medium">
              {answeredCount} de {availableQuestions.length} questões
              {isPreviewMode && (
                <div className="text-[10px] md:text-xs text-amber-600 mt-1">
                  Preview • Faça login para o teste completo
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={goToNext}
            disabled={!canProceed || isSubmitting || isTransitioning}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white disabled:opacity-50 text-sm md:text-base"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <BookOpen size={16} className="md:!hidden" />
                  <BookOpen size={18} className="hidden md:block" />
                </motion.div>
                Processando...
              </>
            ) : isLastQuestion ? (
              <>
                {isPreviewMode ? "Ver Teste Completo" : "Finalizar"}
                <CheckCircle2 size={16} className="md:size-[18px]" />
              </>
            ) : (
              <>
                Próxima
                <ArrowRight size={16} className="md:size-[18px]" />
              </>
            )}
          </Button>
        </motion.div>


        {/* Banner de upgrade — mantém, mas abaixo */}
        {isPreviewMode && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6"
          >
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
                  <Star className="h-4 w-4" />
                  <span className="text-sm font-medium">Desbloqueie o Potencial Completo</span>
                </div>
                <p className="text-amber-700 text-sm mb-3">
                  • Teste completo com todas as perguntas<br />
                  • Análise detalhada dos seus dons<br />
                  • Histórico de resultados<br />
                  • Recomendações personalizadas
                </p>
                <Link href={`/${locale}/login?from=quiz-preview`}>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                    Fazer Login e Continuar
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
