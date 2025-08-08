'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQuiz } from '@/hooks/use-quiz'
import { useTranslations, useLocale } from 'next-intl'

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const router = useRouter()
  const t = useTranslations('quiz')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  
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

  // Debug logs
  console.log('Quiz Debug:', {
    questions: questions,
    loading,
    error,
    currentQuestionIndex,
    questionsLength: questions?.length
  })

  const currentQuestion = questions && questions.length > 0 ? questions[currentQuestionIndex] : null
  const progress = questions && questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0
  const isLastQuestion = questions ? currentQuestionIndex === questions.length - 1 : false
  const canProceed = currentQuestion ? currentAnswers[currentQuestion.id] !== undefined : false

  const handleAnswer = (score: number) => {
    if (currentQuestion) {
      updateAnswer(currentQuestion.id, score)
      // Auto-advance to next question with a small delay for better UX
      setTimeout(() => {
        if (!isLastQuestion) {
          setCurrentQuestionIndex(prev => prev + 1)
        }
      }, 300)
    }
  }

  const goToNext = async () => {
    if (isLastQuestion) {
      // Submit quiz and navigate to results
      const result = await submitQuiz('mock-user-id') // TODO: Get actual user ID
      if (result) {
        // Store result in localStorage temporarily for the results page
        localStorage.setItem('quizResult', JSON.stringify(result))
        router.push(`/${locale}/quiz/results`)
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <Button onClick={refetch}>{tCommon('tryAgain')}</Button>
        </div>
      </div>
    )
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">{t('noQuestionsFound')}</p>
          <Button onClick={refetch}>{tCommon('reload')}</Button>
        </div>
      </div>
    )
  }

  if (currentQuestionIndex >= questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">{t('errorInvalidIndex')}</p>
          <Button onClick={() => setCurrentQuestionIndex(0)}>{t('restartQuiz')}</Button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('errorCurrentQuestion')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            {t('title')}
          </h1>
          <p className="text-center text-gray-600">
            {t('questionOf', { current: currentQuestionIndex + 1, total: questions?.length || 0 })}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-3" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={currentAnswers[currentQuestion.id]?.toString() || ''}
              onValueChange={(value) => handleAnswer(parseInt(value))}
              className="space-y-4"
            >
              {Object.entries({ 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' }).map(([score, _]) => (
                <div key={score} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={score} id={`score-${score}`} />
                  <Label 
                    htmlFor={`score-${score}`} 
                    className="flex-1 cursor-pointer text-base"
                  >
                    {t(`labels.${score}`)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            {tCommon('previous')}
          </Button>

          <div className="text-sm text-gray-500">
            {t('answeredOf', { answered: Object.keys(currentAnswers).length, total: questions?.length || 0 })}
          </div>

          <Button
            onClick={goToNext}
            disabled={!canProceed || isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? tCommon('processing') : isLastQuestion ? tCommon('finish') : tCommon('next')}
            {!isLastQuestion && !isSubmitting && <ArrowRight size={16} />}
          </Button>
        </div>

        {/* Optional: Question overview */}
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Could implement a question overview modal
              console.log('Show question overview')
            }}
          >
            {t('viewAllQuestions')}
          </Button>
        </div>
      </div>
    </div>
  )
}