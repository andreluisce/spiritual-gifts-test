'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ArrowLeft,
  Languages,
  Search,
  Edit,
  Check,
  X,
  Globe,
  BookOpen,
  MessageSquare,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { useTranslations, type Translation } from '@/hooks/useTranslations'

export default function AdminTranslationsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('gifts')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null)
  const [editForm, setEditForm] = useState({
    pt: '',
    en: '',
    es: ''
  })

  const {
    translations,
    loading: translationsLoading,
    updateTranslation,
    updating
  } = useTranslations()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, loading, router])

  if (loading || translationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  const filteredTranslations = translations?.filter(translation =>
    translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    translation.pt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    translation.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    translation.es?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const getCompletionStatus = (translation: Translation) => {
    const languages: (keyof Pick<Translation, 'pt' | 'en' | 'es'>)[] = ['pt', 'en', 'es']
    const completed = languages.filter(lang => translation[lang] && translation[lang]?.trim() !== '').length
    return { completed, total: languages.length, percentage: (completed / languages.length) * 100 }
  }

  const getStatusColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-100 text-green-800'
    if (percentage >= 66) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'gift': return <BookOpen className="h-4 w-4" />
      case 'question': return <MessageSquare className="h-4 w-4" />
      case 'characteristic': return <AlertTriangle className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  const handleEditTranslation = (translation: Translation) => {
    setEditingTranslation(translation)
    setEditForm({
      pt: translation.pt || '',
      en: translation.en || '',
      es: translation.es || ''
    })
  }

  const handleSaveTranslation = async () => {
    if (!editingTranslation) return

    try {
      const result = await updateTranslation(editingTranslation.id, editForm)
      if (result?.success) {
        setEditingTranslation(null)
        setEditForm({ pt: '', en: '', es: '' })
        // Refresh would happen here in a real implementation
      } else {
        alert('Failed to update translation: ' + (result?.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating translation:', error)
      alert('Error updating translation: ' + error)
    }
  }

  const handleCancelEdit = () => {
    setEditingTranslation(null)
    setEditForm({ pt: '', en: '', es: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Languages className="h-8 w-8 text-blue-600" />
              Translation Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage translations for all content across Portuguese, English, and Spanish
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {filteredTranslations.length} items
            </div>
          </div>
        </div>
      </div>

      {/* Translation Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{translations?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Fully Translated</p>
                <p className="text-2xl font-bold">
                  {translations?.filter(t => getCompletionStatus(t).percentage === 100).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Edit className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Partially Translated</p>
                <p className="text-2xl font-bold">
                  {translations?.filter(t => {
                    const status = getCompletionStatus(t)
                    return status.percentage > 0 && status.percentage < 100
                  }).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Missing Translations</p>
                <p className="text-2xl font-bold">
                  {translations?.filter(t => getCompletionStatus(t).percentage === 0).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search translations by key or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="gifts">Spiritual Gifts</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="characteristics">Characteristics</TabsTrigger>
          <TabsTrigger value="ui">UI Elements</TabsTrigger>
        </TabsList>

        <TabsContent value="gifts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spiritual Gifts Translations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTranslations
                  .filter(t => t.type === 'gift')
                  .map((translation) => {
                    const status = getCompletionStatus(translation)
                    return (
                      <div key={translation.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getTypeIcon(translation.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900">{translation.key}</h3>
                            <Badge className={getStatusColor(status.percentage)}>
                              {status.completed}/{status.total} languages
                            </Badge>
                          </div>

                          <div className="space-y-1 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div>
                                <span className="font-medium text-gray-500">PT:</span>
                                <p className="text-gray-700 truncate">{translation.pt || 'Missing'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">EN:</span>
                                <p className="text-gray-700 truncate">{translation.en || 'Missing'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">ES:</span>
                                <p className="text-gray-700 truncate">{translation.es || 'Missing'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" onClick={() => handleEditTranslation(translation)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Questions Translations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTranslations
                  .filter(t => t.type === 'question')
                  .map((translation) => {
                    const status = getCompletionStatus(translation)
                    return (
                      <div key={translation.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                        <div className="p-2 bg-green-100 rounded-lg">
                          {getTypeIcon(translation.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900">{translation.key}</h3>
                            <Badge className={getStatusColor(status.percentage)}>
                              {status.completed}/{status.total} languages
                            </Badge>
                          </div>

                          <div className="space-y-1 text-sm">
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <span className="font-medium text-gray-500">PT:</span>
                                <p className="text-gray-700">{translation.pt || 'Missing'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">EN:</span>
                                <p className="text-gray-700">{translation.en || 'Missing'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">ES:</span>
                                <p className="text-gray-700">{translation.es || 'Missing'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" onClick={() => handleEditTranslation(translation)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="characteristics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Characteristics Translations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTranslations
                  .filter(t => t.type === 'characteristic')
                  .map((translation) => {
                    const status = getCompletionStatus(translation)
                    return (
                      <div key={translation.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          {getTypeIcon(translation.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900">{translation.key}</h3>
                            <Badge className={getStatusColor(status.percentage)}>
                              {status.completed}/{status.total} languages
                            </Badge>
                          </div>

                          <div className="space-y-1 text-sm">
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <span className="font-medium text-gray-500">PT:</span>
                                <p className="text-gray-700">{translation.pt || 'Missing'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">EN:</span>
                                <p className="text-gray-700">{translation.en || 'Missing'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">ES:</span>
                                <p className="text-gray-700">{translation.es || 'Missing'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" onClick={() => handleEditTranslation(translation)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ui" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>UI Elements Translations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTranslations
                  .filter(t => t.type === 'ui')
                  .map((translation) => {
                    const status = getCompletionStatus(translation)
                    return (
                      <div key={translation.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          {getTypeIcon(translation.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900">{translation.key}</h3>
                            <Badge className={getStatusColor(status.percentage)}>
                              {status.completed}/{status.total} languages
                            </Badge>
                          </div>

                          <div className="space-y-1 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div>
                                <span className="font-medium text-gray-500">PT:</span>
                                <p className="text-gray-700 truncate">{translation.pt || 'Missing'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">EN:</span>
                                <p className="text-gray-700 truncate">{translation.en || 'Missing'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">ES:</span>
                                <p className="text-gray-700 truncate">{translation.es || 'Missing'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" onClick={() => handleEditTranslation(translation)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Translation Dialog */}
      <AlertDialog open={!!editingTranslation} onOpenChange={() => editingTranslation && handleCancelEdit()}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Edit Translation: {editingTranslation?.key}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Update the translations for this content item across all supported languages.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Portuguese */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <span className="w-6 h-4 bg-green-500 rounded-sm"></span>
                Portuguese (PT)
              </label>
              <textarea
                value={editForm.pt}
                onChange={(e) => setEditForm(prev => ({ ...prev, pt: e.target.value }))}
                placeholder="Portuguese translation"
                className="w-full px-3 py-2 border rounded-md text-sm min-h-[80px]"
              />
            </div>

            {/* English */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <span className="w-6 h-4 bg-blue-500 rounded-sm"></span>
                English (EN)
              </label>
              <textarea
                value={editForm.en}
                onChange={(e) => setEditForm(prev => ({ ...prev, en: e.target.value }))}
                placeholder="English translation"
                className="w-full px-3 py-2 border rounded-md text-sm min-h-[80px]"
              />
            </div>

            {/* Spanish */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <span className="w-6 h-4 bg-red-500 rounded-sm"></span>
                Spanish (ES)
              </label>
              <textarea
                value={editForm.es}
                onChange={(e) => setEditForm(prev => ({ ...prev, es: e.target.value }))}
                placeholder="Spanish translation"
                className="w-full px-3 py-2 border rounded-md text-sm min-h-[80px]"
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelEdit}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleSaveTranslation}
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updating ? 'Saving...' : 'Save Translations'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}