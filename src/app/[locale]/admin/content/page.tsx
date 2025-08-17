'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Brain,
  HelpCircle,
  Database,
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Book,
  MessageSquare,
  AlertTriangle,
  Target,
  Globe,
  FileText,
  Flame,
  Heart,
  HandHeart,
  GraduationCap,
  Crown,
  Zap,
  Gift as GiftIcon
} from 'lucide-react'
import Link from 'next/link'
import { 
  useSpiritualGifts, useQuestions, useCharacteristics, 
  useUpdateGift, useUpdateQuestion, useUpdateCharacteristic,
  useCreateGift, useCreateQuestion, useCreateCharacteristic,
  useDeleteGift, useDeleteQuestion, useDeleteCharacteristic,
  type Gift, type Question, type Characteristic
} from '@/hooks/useContentData'

// All data comes from the database - no mock data

export default function AdminContentPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const t = useTranslations('admin.content')
  const tCommon = useTranslations('admin.content.common')
  const [activeTab, setActiveTab] = useState('gifts')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGift, setSelectedGift] = useState('all')
  const [editingItem, setEditingItem] = useState<Gift | Question | Characteristic | null>(null)
  const [editingType, setEditingType] = useState<'gift' | 'question' | 'characteristic' | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    isActive: true,
    questionPt: '',
    questionEn: '',
    contentPt: '',
    contentEn: '',
    selectedGift: '',
    giftKey: '',
    category: 'KARISMATA',
    characteristicType: 'characteristic' as 'characteristic' | 'danger' | 'misunderstanding'
  })

  // Fetch real data
  const { gifts: realGifts, loading: giftsLoading } = useSpiritualGifts()
  const { questions: realQuestions, loading: questionsLoading } = useQuestions()
  const { characteristics: realCharacteristics, loading: characteristicsLoading } = useCharacteristics()
  const { updateGift, updating } = useUpdateGift()
  const { updateQuestion, updating: updatingQuestion } = useUpdateQuestion()
  const { updateCharacteristic, updating: updatingCharacteristic } = useUpdateCharacteristic()
  const { createGift, creating: creatingGift } = useCreateGift()
  const { createQuestion, creating: creatingQuestion } = useCreateQuestion()
  const { createCharacteristic, creating: creatingCharacteristic } = useCreateCharacteristic()
  const { deleteGift, deleting: deletingGift } = useDeleteGift()
  const { deleteQuestion, deleting: deletingQuestion } = useDeleteQuestion()
  const { deleteCharacteristic, deleting: deletingCharacteristic } = useDeleteCharacteristic()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, loading, router])

  if (loading || giftsLoading || questionsLoading || characteristicsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  // Use only real data from database
  const giftsData = realGifts
  const questionsData = realQuestions
  const characteristicsData = realCharacteristics

  const filteredGifts = giftsData.filter(gift =>
    gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gift.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredQuestions = questionsData.filter(question => {
    const matchesSearch = question.questionPt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.questionEn.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGift = selectedGift === 'all' || question.giftName === selectedGift
    return matchesSearch && matchesGift
  })

  const filteredCharacteristics = characteristicsData.filter(char => {
    const matchesSearch = char.contentPt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      char.contentEn.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGift = selectedGift === 'all' || char.giftName === selectedGift
    return matchesSearch && matchesGift
  })

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getCharacteristicColor = (type: string) => {
    switch (type) {
      case 'characteristic': return 'bg-blue-100 text-blue-800'
      case 'danger': return 'bg-red-100 text-red-800'
      case 'misunderstanding': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCharacteristicIcon = (type: string) => {
    switch (type) {
      case 'characteristic': return <Target className="h-4 w-4" />
      case 'danger': return <AlertTriangle className="h-4 w-4" />
      case 'misunderstanding': return <HelpCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getGiftIconAndColor = (giftName: string) => {
    // Map gift names to icons and colors based on their spiritual meaning
    switch (giftName?.toUpperCase()) {
      case 'PROFECIA':
        return {
          icon: <Flame className="h-6 w-6" />,
          bgColor: 'bg-orange-100',
          iconColor: 'text-orange-600',
          borderColor: 'border-orange-200'
        }
      case 'MINISTÉRIO':
        return {
          icon: <HandHeart className="h-6 w-6" />,
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          borderColor: 'border-red-200'
        }
      case 'ENSINO':
        return {
          icon: <GraduationCap className="h-6 w-6" />,
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200'
        }
      case 'EXORTAÇÃO':
        return {
          icon: <Zap className="h-6 w-6" />,
          bgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          borderColor: 'border-yellow-200'
        }
      case 'CONTRIBUIÇÃO':
        return {
          icon: <GiftIcon className="h-6 w-6" />,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          borderColor: 'border-green-200'
        }
      case 'LIDERANÇA':
        return {
          icon: <Crown className="h-6 w-6" />,
          bgColor: 'bg-purple-100',
          iconColor: 'text-purple-600',
          borderColor: 'border-purple-200'
        }
      case 'MISERICÓRDIA':
        return {
          icon: <Heart className="h-6 w-6" />,
          bgColor: 'bg-pink-100',
          iconColor: 'text-pink-600',
          borderColor: 'border-pink-200'
        }
      default:
        return {
          icon: <Brain className="h-6 w-6" />,
          bgColor: 'bg-gray-100',
          iconColor: 'text-gray-600',
          borderColor: 'border-gray-200'
        }
    }
  }

  const handleEditGift = (gift: Gift) => {
    setEditingItem(gift)
    setEditingType('gift')
    setEditForm({
      name: gift.name,
      nameEn: gift.nameEn || '',
      description: gift.description,
      descriptionEn: gift.descriptionEn || '',
      isActive: gift.isActive,
      questionPt: '',
      questionEn: '',
      contentPt: '',
      contentEn: '',
      selectedGift: '',
      giftKey: gift.giftKey || '',
      category: 'KARISMATA',
      characteristicType: 'characteristic' as 'characteristic' | 'danger' | 'misunderstanding' as 'characteristic' | 'danger' | 'misunderstanding'
    })
  }

  const handleEditQuestion = (question: Question) => {
    setEditingItem(question)
    setEditingType('question')
    setEditForm({
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      isActive: question.isActive,
      questionPt: question.questionPt,
      questionEn: question.questionEn,
      contentPt: '',
      contentEn: '',
      selectedGift: question.giftName,
      giftKey: question.giftKey || '',
      category: 'KARISMATA',
      characteristicType: 'characteristic' as 'characteristic' | 'danger' | 'misunderstanding' as 'characteristic' | 'danger' | 'misunderstanding'
    })
  }

  const handleEditCharacteristic = (characteristic: Characteristic) => {
    setEditingItem(characteristic)
    setEditingType('characteristic')
    setEditForm({
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      isActive: characteristic.isActive,
      questionPt: '',
      questionEn: '',
      contentPt: characteristic.contentPt,
      contentEn: characteristic.contentEn,
      selectedGift: characteristic.giftName,
      giftKey: characteristic.giftKey || '',
      category: 'KARISMATA',
      characteristicType: characteristic.type || 'characteristic'
    })
  }

  const handleSaveEdit = async () => {
    if (!editingItem || !editingType) return

    try {
      let result

      if (editingType === 'gift') {
        const giftItem = editingItem as Gift
        result = await updateGift(giftItem.id, {
          name: editForm.name,
          nameEn: editForm.nameEn,
          description: editForm.description,
          descriptionEn: editForm.descriptionEn,
          isActive: editForm.isActive
        })
      } else if (editingType === 'question') {
        // Find the gift key for the selected gift
        const questionItem = editingItem as Question
        const selectedGiftData = giftsData.find(gift => gift.name === editForm.selectedGift)
        result = await updateQuestion(questionItem.id, {
          questionPt: editForm.questionPt,
          questionEn: editForm.questionEn,
          isActive: editForm.isActive,
          giftKey: selectedGiftData?.giftKey
        })
      } else if (editingType === 'characteristic') {
        // Find the gift key for the selected gift
        const characteristicItem = editingItem as Characteristic
        const selectedGiftData = giftsData.find(gift => gift.name === editForm.selectedGift)
        result = await updateCharacteristic(characteristicItem.id, characteristicItem.type, {
          contentPt: editForm.contentPt,
          contentEn: editForm.contentEn,
          isActive: editForm.isActive,
          giftKey: selectedGiftData?.giftKey
        })
      }

      if (result?.success) {
        setEditingItem(null)
        setEditingType(null)
        setEditForm({
          name: '',
          nameEn: '',
          description: '',
          descriptionEn: '',
          isActive: true,
          questionPt: '',
          questionEn: '',
          contentPt: '',
          contentEn: '',
          selectedGift: '',
          giftKey: '',
          category: 'KARISMATA',
          characteristicType: 'characteristic' as 'characteristic' | 'danger' | 'misunderstanding' as 'characteristic' | 'danger' | 'misunderstanding'
        })
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        alert('Failed to update: ' + (result?.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating:', error)
      alert('Error updating: ' + error)
    }
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditingType(null)
    setIsCreating(false)
    setEditForm({
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      isActive: true,
      questionPt: '',
      questionEn: '',
      contentPt: '',
      contentEn: '',
      selectedGift: '',
      giftKey: '',
      category: 'KARISMATA',
      characteristicType: 'characteristic' as 'characteristic' | 'danger' | 'misunderstanding'
    })
  }

  const handleCreateNew = (type: 'gift' | 'question' | 'characteristic') => {
    setIsCreating(true)
    setEditingType(type)
    setEditForm({
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      isActive: true,
      questionPt: '',
      questionEn: '',
      contentPt: '',
      contentEn: '',
      selectedGift: '',
      giftKey: '',
      category: 'KARISMATA',
      characteristicType: 'characteristic' as 'characteristic' | 'danger' | 'misunderstanding'
    })
  }

  const handleCreate = async () => {
    if (!editingType) return

    try {
      let result
      
      if (editingType === 'gift') {
        result = await createGift({
          name: editForm.name,
          nameEn: editForm.nameEn,
          description: editForm.description,
          descriptionEn: editForm.descriptionEn,
          giftKey: editForm.giftKey,
          category: editForm.category
        })
      } else if (editingType === 'question') {
        const selectedGiftData = giftsData.find(gift => gift.name === editForm.selectedGift)
        result = await createQuestion({
          questionPt: editForm.questionPt,
          questionEn: editForm.questionEn,
          giftKey: selectedGiftData?.giftKey || '',
          isActive: editForm.isActive
        })
      } else if (editingType === 'characteristic') {
        const selectedGiftData = giftsData.find(gift => gift.name === editForm.selectedGift)
        result = await createCharacteristic({
          type: editForm.characteristicType,
          contentPt: editForm.contentPt,
          contentEn: editForm.contentEn,
          giftKey: selectedGiftData?.giftKey || ''
        })
      }

      if (result?.success) {
        handleCancelEdit()
        window.location.reload()
      } else {
        alert('Failed to create: ' + (result?.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating:', error)
      alert('Error creating: ' + error)
    }
  }

  const handleDelete = async (item: Gift | Question | Characteristic, type: 'gift' | 'question' | 'characteristic') => {
    try {
      let result
      
      if (type === 'gift') {
        const giftItem = item as Gift
        result = await deleteGift(giftItem.giftKey)
      } else if (type === 'question') {
        const questionItem = item as Question
        result = await deleteQuestion(questionItem.id)
      } else if (type === 'characteristic') {
        const characteristicItem = item as Characteristic
        result = await deleteCharacteristic(characteristicItem.id, characteristicItem.type)
      }

      if (result?.success) {
        window.location.reload()
      } else {
        alert('Failed to delete: ' + (result?.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Error deleting: ' + error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600 mt-1">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Import Content
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New Content
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="gifts">{t('gifts.title')}</TabsTrigger>
          <TabsTrigger value="questions">{t('questions.title')}</TabsTrigger>
          <TabsTrigger value="characteristics">{t('characteristics.title')}</TabsTrigger>
          <TabsTrigger value="content">Other Content</TabsTrigger>
        </TabsList>

        <TabsContent value="gifts" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder={t('gifts.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button onClick={() => handleCreateNew('gift')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('gifts.addNew')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Gifts List */}
          <Card>
            <CardHeader>
              <CardTitle>{t('gifts.count', { count: filteredGifts.length })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredGifts.map((gift) => {
                  const { icon, bgColor, iconColor, borderColor } = getGiftIconAndColor(gift.name)
                  return (
                    <div key={gift.id} className={`flex items-center gap-4 p-4 border-2 ${borderColor} rounded-lg hover:bg-gray-50 transition-all duration-200`}>
                      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
                        <span className={iconColor}>{icon}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{gift.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            {gift.nameEn}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{gift.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>{gift.questionsCount} {tCommon('questions')}</span>
                          <span>{tCommon('updated')}: {new Date(gift.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(gift.isActive)}>
                          {gift.isActive ? tCommon('active') : tCommon('inactive')}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditGift(gift)}>
                          <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Spiritual Gift</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the gift &quot;{gift.name}&quot;? This will also delete all related questions and content. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(gift, 'gift')}
                              disabled={deletingGift}
                            >
                              {deletingGift ? 'Deleting...' : 'Delete Gift'}
                            </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredGifts.length === 0 && (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No spiritual gifts found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder={t('questions.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <select
                  value={selectedGift}
                  onChange={(e) => setSelectedGift(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">{t('questions.allGifts')}</option>
                  {giftsData.map(gift => (
                    <option key={gift.id} value={gift.name}>{gift.name}</option>
                  ))}
                </select>

                <Button onClick={() => handleCreateNew('question')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('questions.addNew')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <Card>
            <CardHeader>
              <CardTitle>{t('questions.count', { count: filteredQuestions.length })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredQuestions.map((question) => {
                  const { icon, bgColor, iconColor, borderColor } = getGiftIconAndColor(question.giftName)
                  return (
                    <div key={question.id} className={`flex items-start gap-4 p-4 border-2 ${borderColor} rounded-lg hover:bg-gray-50 transition-all duration-200`}>
                      <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center mt-1`}>
                        <span className={iconColor}>{icon}</span>
                      </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {question.giftName}
                        </Badge>
                        <Badge className={getStatusColor(question.isActive)}>
                          {question.isActive ? tCommon('active') : tCommon('inactive')}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-gray-500 font-medium">PT:</span>
                          <p className="text-sm text-gray-900">{question.questionPt}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 font-medium">EN:</span>
                          <p className="text-sm text-gray-600">{question.questionEn}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <span>{tCommon('updated')}: {new Date(question.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditQuestion(question)}>
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Question</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this question? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(question, 'question')}
                              disabled={deletingQuestion}
                            >
                              {deletingQuestion ? 'Deleting...' : 'Delete Question'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  )
                })}
              </div>

              {filteredQuestions.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t('questions.noResults')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="characteristics" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder={t('characteristics.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <select
                  value={selectedGift}
                  onChange={(e) => setSelectedGift(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">{t('questions.allGifts')}</option>
                  {giftsData.map(gift => (
                    <option key={gift.id} value={gift.name}>{gift.name}</option>
                  ))}
                </select>

                <Button onClick={() => handleCreateNew('characteristic')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('characteristics.addNew')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Characteristics List */}
          <Card>
            <CardHeader>
              <CardTitle>{t('characteristics.count', { count: filteredCharacteristics.length })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCharacteristics.map((item) => {
                  const { icon, bgColor, iconColor, borderColor } = getGiftIconAndColor(item.giftName)
                  return (
                    <div key={item.id} className={`flex items-start gap-4 p-4 border-2 ${borderColor} rounded-lg hover:bg-gray-50 transition-all duration-200`}>
                      <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center mt-1`}>
                        <span className={iconColor}>{icon}</span>
                      </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {item.giftName}
                        </Badge>
                        <Badge className={getCharacteristicColor(item.type)} variant="outline">
                          {getCharacteristicIcon(item.type)}
                          {item.type}
                        </Badge>
                        <Badge className={getStatusColor(item.isActive)}>
                          {item.isActive ? tCommon('active') : tCommon('inactive')}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-xs text-gray-500 font-medium">PT:</span>
                          <p className="text-sm text-gray-900">{item.contentPt}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 font-medium">EN:</span>
                          <p className="text-sm text-gray-600">{item.contentEn}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditCharacteristic(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Content</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this {item.type}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(item, 'characteristic')}
                              disabled={deletingCharacteristic}
                            >
                              {deletingCharacteristic ? 'Deleting...' : 'Delete Content'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  )
                })}
              </div>

              {filteredCharacteristics.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t('characteristics.noResults')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Additional Content Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6">
                  <div className="text-center">
                    <Globe className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Translations</h3>
                    <p className="text-gray-600 mb-4">Manage multilingual content and translations</p>
                    <Link href="/admin/translations">
                      <Button variant="outline" className="w-full">
                        Manage Translations
                      </Button>
                    </Link>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Templates</h3>
                    <p className="text-gray-600 mb-4">Email templates and notification content</p>
                    <Button variant="outline" className="w-full">
                      Edit Templates
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Help Content</h3>
                    <p className="text-gray-600 mb-4">FAQ, help articles, and support content</p>
                    <Button variant="outline" className="w-full">
                      Manage Help
                    </Button>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit/Create Item Dialog */}
      <AlertDialog open={!!editingItem || isCreating} onOpenChange={() => (editingItem || isCreating) && handleCancelEdit()}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isCreating ? 'Create New' : 'Edit'} {editingType === 'gift' ? 'Spiritual Gift' : 
                   editingType === 'question' ? 'Question' : 
                   'Characteristic'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isCreating ? 'Create a new content item.' : 'Update the information for this content item.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Gift Edit Fields */}
            {editingType === 'gift' && (
              <>
                {/* Gift Key (for new gifts only) */}
                {isCreating && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gift Key*</label>
                    <Input
                      value={editForm.giftKey}
                      onChange={(e) => setEditForm(prev => ({ ...prev, giftKey: e.target.value.toUpperCase() }))}
                      placeholder="e.g., PROPHECY, MINISTRY"
                      className="w-full"
                      required
                    />
                    <p className="text-xs text-gray-500">Unique identifier for the gift (uppercase, no spaces)</p>
                  </div>
                )}

                {/* Category (for new gifts only) */}
                {isCreating && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category*</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      required
                    >
                      <option value="KARISMATA">Karismata (Motivations)</option>
                      <option value="DIAKONION">Diakonion (Ministries)</option>
                      <option value="PHANEROSIS">Phanerosis (Manifestations)</option>
                    </select>
                  </div>
                )}

                {/* Name (Portuguese) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name (Portuguese)*</label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Portuguese name"
                    className="w-full"
                    required
                  />
                </div>

                {/* Name (English) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name (English)</label>
                  <Input
                    value={editForm.nameEn}
                    onChange={(e) => setEditForm(prev => ({ ...prev, nameEn: e.target.value }))}
                    placeholder="English name"
                    className="w-full"
                  />
                </div>

                {/* Description (Portuguese) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (Portuguese)*</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Portuguese description"
                    className="w-full px-3 py-2 border rounded-md text-sm min-h-[80px]"
                    required
                  />
                </div>

                {/* Description (English) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (English)</label>
                  <textarea
                    value={editForm.descriptionEn}
                    onChange={(e) => setEditForm(prev => ({ ...prev, descriptionEn: e.target.value }))}
                    placeholder="English description"
                    className="w-full px-3 py-2 border rounded-md text-sm min-h-[80px]"
                  />
                </div>
              </>
            )}

            {/* Question Edit Fields */}
            {editingType === 'question' && (
              <>
                {/* Spiritual Gift Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Spiritual Gift</label>
                  <select
                    value={editForm.selectedGift}
                    onChange={(e) => setEditForm(prev => ({ ...prev, selectedGift: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="">Select a spiritual gift...</option>
                    {giftsData.map(gift => (
                      <option key={gift.id} value={gift.name}>{gift.name}</option>
                    ))}
                  </select>
                </div>

                {/* Question (Portuguese) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question (Portuguese)</label>
                  <textarea
                    value={editForm.questionPt}
                    onChange={(e) => setEditForm(prev => ({ ...prev, questionPt: e.target.value }))}
                    placeholder="Portuguese question"
                    className="w-full px-3 py-2 border rounded-md text-sm min-h-[80px]"
                  />
                </div>

                {/* Question (English) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question (English)</label>
                  <textarea
                    value={editForm.questionEn}
                    onChange={(e) => setEditForm(prev => ({ ...prev, questionEn: e.target.value }))}
                    placeholder="English question"
                    className="w-full px-3 py-2 border rounded-md text-sm min-h-[80px]"
                  />
                </div>
              </>
            )}

            {/* Characteristic Edit Fields */}
            {editingType === 'characteristic' && (
              <>
                {/* Type Selection (for new characteristics only) */}
                {isCreating && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content Type*</label>
                    <select
                      value={editForm.characteristicType}
                      onChange={(e) => setEditForm(prev => ({ ...prev, characteristicType: e.target.value as 'characteristic' | 'danger' | 'misunderstanding' }))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      required
                    >
                      <option value="characteristic">Characteristic</option>
                      <option value="danger">Danger</option>
                      <option value="misunderstanding">Misunderstanding</option>
                    </select>
                  </div>
                )}

                {/* Spiritual Gift Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Spiritual Gift*</label>
                  <select
                    value={editForm.selectedGift}
                    onChange={(e) => setEditForm(prev => ({ ...prev, selectedGift: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    required
                  >
                    <option value="">Select a spiritual gift...</option>
                    {giftsData.map(gift => (
                      <option key={gift.id} value={gift.name}>{gift.name}</option>
                    ))}
                  </select>
                </div>

                {/* Content (Portuguese) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content (Portuguese)*</label>
                  <textarea
                    value={editForm.contentPt}
                    onChange={(e) => setEditForm(prev => ({ ...prev, contentPt: e.target.value }))}
                    placeholder="Portuguese content"
                    className="w-full px-3 py-2 border rounded-md text-sm min-h-[80px]"
                    required
                  />
                </div>

                {/* Content (English) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content (English)</label>
                  <textarea
                    value={editForm.contentEn}
                    onChange={(e) => setEditForm(prev => ({ ...prev, contentEn: e.target.value }))}
                    placeholder="English content"
                    className="w-full px-3 py-2 border rounded-md text-sm min-h-[80px]"
                  />
                </div>
              </>
            )}

            {/* Status - Common for all types */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={editForm.isActive ? 'active' : 'inactive'}
                onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="active">{tCommon('active')}</option>
                <option value="inactive">{tCommon('inactive')}</option>
              </select>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelEdit}>{tCommon('cancel')}</AlertDialogCancel>
            <Button 
              onClick={isCreating ? handleCreate : handleSaveEdit}
              disabled={
                isCreating 
                  ? (creatingGift || creatingQuestion || creatingCharacteristic)
                  : (updating || updatingQuestion || updatingCharacteristic)
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating 
                ? (creatingGift || creatingQuestion || creatingCharacteristic) 
                  ? tCommon('creating') 
                  : tCommon('create')
                : (updating || updatingQuestion || updatingCharacteristic) 
                  ? tCommon('saving') 
                  : tCommon('save')
              }
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}