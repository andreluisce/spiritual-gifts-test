'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useLocale } from 'next-intl'

// Types
export type Gift = {
  id: number
  name: string
  nameEn: string
  nameEs: string
  description: string
  descriptionEn: string
  descriptionEs: string
  isActive: boolean
  questionsCount: number
  lastUpdated: string
  giftKey: string
}

export type Question = {
  id: string
  giftId: number
  giftName: string
  giftKey: string
  questionPt: string
  questionEn: string
  questionEs: string
  isActive: boolean
  lastUpdated: string
}

interface RawGiftData {
  id: number
  name: string
  definition: string | null
  gift_key: string
  locale: string
}

interface RawQuestionData {
  id: number
  gift: string
  text: string
  is_active: boolean
  updated_at: string
  question_pool: {
    gift: string
  }
}

interface RawCharacteristicData {
  id: number
  gift_key: string
  characteristic: string
  locale: string
  order_sequence?: number
}

interface RawDangerData {
  id: number
  gift_key: string
  danger: string
  locale: string
}

interface RawMisunderstandingData {
  id: number
  gift_key: string
  misunderstanding: string
  locale: string
}

export type Characteristic = {
  id: string
  giftId: number
  giftName: string
  giftKey: string
  type: 'characteristic' | 'danger' | 'misunderstanding'
  contentPt: string
  contentEn: string
  contentEs: string
  isActive: boolean
  ids?: {
    pt?: number
    en?: number
    es?: number
  }
}

// Hook for fetching spiritual gifts
export function useSpiritualGifts() {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        setLoading(true)

        // Get spiritual gifts from database (all locales)
        const { data: giftsData, error: giftsError } = await supabase
          .from('spiritual_gifts')
          .select('*')
          .order('name')

        if (giftsError) throw giftsError

        if (giftsData) {
          // Count questions for each gift
          const { data: questionCounts, error: questionsError } = await supabase
            .from('question_pool')
            .select('gift')

          const questionsPerGift: Record<string, number> = {}
          if (!questionsError && questionCounts) {
            questionCounts.forEach((q: { gift: string }) => {
              questionsPerGift[q.gift] = (questionsPerGift[q.gift] || 0) + 1
            })
          }

          // Group gifts by gift_key
          const giftsMap: Record<string, Gift> = {}

          giftsData.forEach((gift: RawGiftData) => {
            if (!giftsMap[gift.gift_key]) {
              giftsMap[gift.gift_key] = {
                id: gift.id, // Note: This ID might be different per locale, we use the first one encountered
                giftKey: gift.gift_key,
                name: '',
                nameEn: '',
                nameEs: '',
                description: '',
                descriptionEn: '',
                descriptionEs: '',
                isActive: true,
                questionsCount: questionsPerGift[gift.gift_key] || 0,
                lastUpdated: new Date().toISOString().split('T')[0]
              }
            }

            if (gift.locale === 'pt') {
              giftsMap[gift.gift_key].name = gift.name
              giftsMap[gift.gift_key].description = gift.definition || ''
            } else if (gift.locale === 'en') {
              giftsMap[gift.gift_key].nameEn = gift.name
              giftsMap[gift.gift_key].descriptionEn = gift.definition || ''
            } else if (gift.locale === 'es') {
              giftsMap[gift.gift_key].nameEs = gift.name
              giftsMap[gift.gift_key].descriptionEs = gift.definition || ''
            }
          })

          setGifts(Object.values(giftsMap))
        }
      } catch (err) {
        console.error('Error fetching gifts:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch gifts')
      } finally {
        setLoading(false)
      }
    }

    fetchGifts()
  }, [supabase])

  return { gifts, loading, error }
}

// Hook for fetching questions
export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())
  const locale = useLocale()

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)

        // Get questions from database with gift names
        const { data: questionsData, error: questionsError } = await supabase
          .from('question_pool')
          .select('*')
          .eq('is_active', true)
          .order('gift', { ascending: true })
          .order('id', { ascending: true })

        if (questionsError) throw questionsError

        // Get gift names mapping
        const { data: giftsData, error: giftsError } = await supabase
          .from('spiritual_gifts')
          .select('gift_key, name')
          .eq('locale', locale)

        const giftNames: Record<string, string> = {}
        if (!giftsError && giftsData) {
          giftsData.forEach((gift: { gift_key: string; name: string }) => {
            giftNames[gift.gift_key] = gift.name
          })
        }

        // Get translations
        const { data: translationsData, error: translationsError } = await supabase
          .from('question_translations')
          .select('*')
          .in('locale', ['pt', 'en', 'es'])

        const translations: Record<string, Record<string, string>> = {}
        if (!translationsError && translationsData) {
          translationsData.forEach((trans: { question_id: string; field: string; text: string; locale: string }) => {
            if (!translations[trans.question_id]) {
              translations[trans.question_id] = {}
            }
            translations[trans.question_id][trans.locale] = trans.text
          })
        }

        if (questionsData) {
          const mappedQuestions: Question[] = questionsData.map((question: RawQuestionData) => ({
            id: question.id.toString(),
            giftId: question.id,
            giftName: giftNames[question.gift] || question.gift,
            giftKey: question.gift,
            questionPt: translations[question.id]?.['pt'] || question.text,
            questionEn: translations[question.id]?.['en'] || question.text,
            questionEs: translations[question.id]?.['es'] || '',
            isActive: question.is_active,
            lastUpdated: new Date(question.updated_at).toISOString().split('T')[0]
          }))

          setQuestions(mappedQuestions)
        }
      } catch (err) {
        console.error('Error fetching questions:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch questions')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [supabase, locale])

  return { questions, loading, error }
}

// Hook for fetching characteristics
export function useCharacteristics() {
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())
  const locale = useLocale()

  useEffect(() => {
    const fetchCharacteristics = async () => {
      try {
        setLoading(true)

        // Get gift names mapping
        const { data: giftsData, error: giftsError } = await supabase
          .from('spiritual_gifts')
          .select('gift_key, name')
          .eq('locale', locale)

        const giftNames: Record<string, string> = {}
        if (!giftsError && giftsData) {
          giftsData.forEach((gift: { gift_key: string; name: string }) => {
            giftNames[gift.gift_key] = gift.name
          })
        }

        const allCharacteristics: Characteristic[] = []

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processData = (data: any[], type: 'characteristic' | 'danger' | 'misunderstanding') => {
          // Group by Gift Key
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const byGift: Record<string, any[]> = {}
          data.forEach(item => {
            const key = item.gift_key
            if (!byGift[key]) byGift[key] = []
            byGift[key].push(item)
          })

          // For each gift
          Object.keys(byGift).forEach(key => {
            const items = byGift[key]
            // Split by locale and sort by order_sequence (fallback to ID for dangers/misunderstandings)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sorter = (a: any, b: any) => (a.order_sequence || 0) - (b.order_sequence || 0) || (a.id - b.id)
            const pt = items.filter(i => i.locale === 'pt').sort(sorter)
            const en = items.filter(i => i.locale === 'en').sort(sorter)
            const es = items.filter(i => i.locale === 'es').sort(sorter)

            // Max length (usually they should be equal)
            const maxLen = Math.max(pt.length, en.length, es.length)

            for (let i = 0; i < maxLen; i++) {
              const rowPt = pt[i]
              const rowEn = en[i]
              const rowEs = es[i]

              // We need at least one row to exist
              if (!rowPt && !rowEn && !rowEs) continue

              // Use PT ID as primary reference if available, else first available
              const primaryId = rowPt?.id || rowEn?.id || rowEs?.id

              // We construct content
              let contentPt = '', contentEn = '', contentEs = ''
              if (type === 'characteristic') {
                contentPt = rowPt?.characteristic || ''
                contentEn = rowEn?.characteristic || ''
                contentEs = rowEs?.characteristic || ''
              } else if (type === 'danger') {
                contentPt = rowPt?.danger || ''
                contentEn = rowEn?.danger || ''
                contentEs = rowEs?.danger || ''
              } else if (type === 'misunderstanding') {
                contentPt = rowPt?.misunderstanding || ''
                contentEn = rowEn?.misunderstanding || ''
                contentEs = rowEs?.misunderstanding || ''
              }

              allCharacteristics.push({
                id: `${type === 'characteristic' ? 'char' : type === 'danger' ? 'danger' : 'misund'}-${primaryId}`,
                giftId: primaryId,
                giftName: giftNames[key] || key,
                giftKey: key,
                type: type,
                contentPt,
                contentEn,
                contentEs,
                isActive: true,
                ids: {
                  pt: rowPt?.id,
                  en: rowEn?.id,
                  es: rowEs?.id
                }
              })
            }
          })
        }

        // Fetch ALL data
        const [charRes, dangerRes, misundRes] = await Promise.all([
          supabase.from('characteristics').select('*'),
          supabase.from('dangers').select('*'),
          supabase.from('misunderstandings').select('*')
        ])

        if (charRes.data) processData(charRes.data, 'characteristic')
        if (dangerRes.data) processData(dangerRes.data, 'danger')
        if (misundRes.data) processData(misundRes.data, 'misunderstanding')

        setCharacteristics(allCharacteristics)
      } catch (err) {
        console.error('Error fetching characteristics:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch characteristics')
      } finally {
        setLoading(false)
      }
    }

    fetchCharacteristics()
  }, [supabase, locale])

  return { characteristics, loading, error }
}

// Hook for deleting a user (admin only)
export function useDeleteUser() {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const deleteUser = async (userId: string) => {
    try {
      setDeleting(true)
      setError(null)

      // First delete all quiz results for this user
      const { error: quizError } = await supabase
        .from('quiz_results')
        .delete()
        .eq('user_id', userId)

      if (quizError) throw quizError

      // Then delete the user from the users table
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (userError) throw userError

      return { success: true }
    } catch (err) {
      console.error('Error deleting user:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete user')
      return { success: false, error: err }
    } finally {
      setDeleting(false)
    }
  }

  return { deleteUser, deleting, error }
}

// Hook for updating user role
export function useUpdateUserRole() {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const updateUserRole = async (userId: string, role: 'user' | 'admin') => {
    try {
      setUpdating(true)
      setError(null)

      // Update the user's role in metadata
      const { error: updateError } = await supabase
        .from('users')
        .update({
          raw_user_meta_data: {
            role
          }
        })
        .eq('id', userId)

      if (updateError) throw updateError

      return { success: true }
    } catch (err) {
      console.error('Error updating user role:', err)
      setError(err instanceof Error ? err.message : 'Failed to update user role')
      return { success: false, error: err }
    } finally {
      setUpdating(false)
    }
  }

  return { updateUserRole, updating, error }
}

// Hook for updating spiritual gifts
export function useUpdateGift() {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const updateGift = async (
    giftId: number,
    giftKey: string,
    updates: {
      name?: string
      nameEn?: string
      nameEs?: string
      description?: string
      descriptionEn?: string
      descriptionEs?: string
      isActive?: boolean
    }
  ) => {
    try {
      setUpdating(true)
      setError(null)

      // Update Portuguese (default/primary)
      if (updates.name || updates.description) {
        const { error: updateError } = await supabase
          .from('spiritual_gifts')
          .update({
            name: updates.name,
            definition: updates.description
          })
          .eq('gift_key', giftKey)
          .eq('locale', 'pt')

        if (updateError) throw updateError
      }

      // Update English
      if (updates.nameEn || updates.descriptionEn) {
        const { error: enError } = await supabase
          .from('spiritual_gifts')
          .upsert({
            gift_key: giftKey,
            locale: 'en',
            name: updates.nameEn,
            definition: updates.descriptionEn,
            category: 'KARISMATA' // Fallback
          }, { onConflict: 'gift_key, locale' })

        if (enError) throw enError
      }

      // Update Spanish
      if (updates.nameEs || updates.descriptionEs) {
        const { error: esError } = await supabase
          .from('spiritual_gifts')
          .upsert({
            gift_key: giftKey,
            locale: 'es',
            name: updates.nameEs,
            definition: updates.descriptionEs,
            category: 'KARISMATA' // Fallback
          }, { onConflict: 'gift_key, locale' })

        if (esError) throw esError
      }

      return { success: true }
    } catch (err) {
      console.error('Error updating gift:', err)
      setError(err instanceof Error ? err.message : 'Failed to update gift')
      return { success: false, error: err }
    } finally {
      setUpdating(false)
    }
  }

  return { updateGift, updating, error }
}

// Hook for updating questions
export function useUpdateQuestion() {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const updateQuestion = async (
    questionId: string,
    updates: {
      questionPt?: string
      questionEn?: string
      questionEs?: string
      isActive?: boolean
      giftKey?: string
    }
  ) => {
    try {
      setUpdating(true)
      setError(null)

      // Update the question text and gift assignment
      const updateData: {
        text: string
        is_active: boolean
        gift?: string
      } = {
        text: updates.questionPt || '',
        is_active: updates.isActive ?? true
      }

      if (updates.giftKey) {
        updateData.gift = updates.giftKey
      }

      const { error: updateError } = await supabase
        .from('question_pool')
        .update(updateData)
        .eq('id', questionId)

      if (updateError) throw updateError

      // Update translations if provided
      if (updates.questionPt) {
        await supabase
          .from('question_translations')
          .upsert({
            question_id: questionId,
            locale: 'pt',
            text: updates.questionPt
          })
      }

      if (updates.questionEn) {
        await supabase
          .from('question_translations')
          .upsert({
            question_id: questionId,
            locale: 'en',
            text: updates.questionEn
          })
      }

      if (updates.questionEs) {
        await supabase
          .from('question_translations')
          .upsert({
            question_id: questionId,
            locale: 'es',
            text: updates.questionEs
          })
      }

      return { success: true }
    } catch (err) {
      console.error('Error updating question:', err)
      setError(err instanceof Error ? err.message : 'Failed to update question')
      return { success: false, error: err }
    } finally {
      setUpdating(false)
    }
  }

  return { updateQuestion, updating, error }
}

// Hook for updating characteristics
export function useUpdateCharacteristic() {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const updateCharacteristic = async (
    characteristicId: string,
    type: 'characteristic' | 'danger' | 'misunderstanding',
    updates: {
      contentPt?: string
      contentEn?: string
      contentEs?: string
      isActive?: boolean
      giftKey?: string
      ids?: {
        pt?: number
        en?: number
        es?: number
      }
    }
  ) => {
    try {
      setUpdating(true)
      setError(null)

      // Determine which table to update based on type
      let tableName = ''
      let fieldName = ''

      switch (type) {
        case 'characteristic':
          tableName = 'characteristics'
          fieldName = 'characteristic'
          break
        case 'danger':
          tableName = 'dangers'
          fieldName = 'danger'
          break
        case 'misunderstanding':
          tableName = 'misunderstandings'
          fieldName = 'misunderstanding'
          break
      }

      // Helper to update a specific locale row
      const updateRow = async (id: number | undefined, content: string | undefined) => {
        if (!id || content === undefined) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = { [fieldName]: content }
        if (updates.giftKey) updateData.gift_key = updates.giftKey

        const { error } = await supabase
          .from(tableName)
          .update(updateData)
          .eq('id', id)

        if (error) throw error
      }

      // Update available translations using explicit IDs
      if (updates.ids) {
        if (updates.ids.pt) await updateRow(updates.ids.pt, updates.contentPt)
        if (updates.ids.en) await updateRow(updates.ids.en, updates.contentEn)
        if (updates.ids.es) await updateRow(updates.ids.es, updates.contentEs)
      } else {
        // Fallback to updating just PT using the ID from the string (old behavior)
        const numericId = characteristicId.split('-')[1]
        await updateRow(parseInt(numericId), updates.contentPt)
      }

      return { success: true }
    } catch (err) {
      console.error('Error updating characteristic:', err)
      setError(err instanceof Error ? err.message : 'Failed to update characteristic')
      return { success: false, error: err }
    } finally {
      setUpdating(false)
    }
  }

  return { updateCharacteristic, updating, error }
}

// Hook for creating new spiritual gifts
export function useCreateGift() {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const createGift = async (giftData: {
    name: string
    nameEn?: string
    nameEs?: string
    description: string
    descriptionEn?: string
    descriptionEs?: string
    giftKey: string
    category: string
  }) => {
    try {
      setCreating(true)
      setError(null)

      // Create Portuguese version
      const { error: ptError } = await supabase
        .from('spiritual_gifts')
        .insert({
          gift_key: giftData.giftKey,
          name: giftData.name,
          definition: giftData.description,
          category: giftData.category,
          locale: 'pt'
        })

      if (ptError) throw ptError

      // Create English version if provided
      if (giftData.nameEn || giftData.descriptionEn) {
        const { error: enError } = await supabase
          .from('spiritual_gifts')
          .insert({
            gift_key: giftData.giftKey,
            name: giftData.nameEn || giftData.name,
            definition: giftData.descriptionEn || giftData.description,
            category: giftData.category,
            locale: 'en'
          })

        if (enError) throw enError
      }

      // Create Spanish version if provided
      if (giftData.nameEs || giftData.descriptionEs) {
        const { error: esError } = await supabase
          .from('spiritual_gifts')
          .insert({
            gift_key: giftData.giftKey,
            name: giftData.nameEs || giftData.name,
            definition: giftData.descriptionEs || giftData.description,
            category: giftData.category,
            locale: 'es'
          })

        if (esError) throw esError
      }

      return { success: true }
    } catch (err) {
      console.error('Error creating gift:', err)
      setError(err instanceof Error ? err.message : 'Failed to create gift')
      return { success: false, error: err }
    } finally {
      setCreating(false)
    }
  }

  return { createGift, creating, error }
}

// Hook for creating new questions
export function useCreateQuestion() {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const createQuestion = async (questionData: {
    questionPt: string
    questionEn?: string
    questionEs?: string
    giftKey: string
    isActive?: boolean
  }) => {
    try {
      setCreating(true)
      setError(null)

      // Create the question
      const { data, error: questionError } = await supabase
        .from('question_pool')
        .insert({
          text: questionData.questionPt,
          gift: questionData.giftKey,
          is_active: questionData.isActive ?? true
        })
        .select('id')
        .single()

      if (questionError) throw questionError

      const questionId = data.id

      // Add Portuguese translation
      await supabase
        .from('question_translations')
        .insert({
          question_id: questionId,
          locale: 'pt',
          text: questionData.questionPt
        })

      // Add English translation if provided
      if (questionData.questionEn) {
        await supabase
          .from('question_translations')
          .insert({
            question_id: questionId,
            locale: 'en',
            text: questionData.questionEn
          })
      }

      // Add Spanish translation if provided
      if (questionData.questionEs) {
        await supabase
          .from('question_translations')
          .insert({
            question_id: questionId,
            locale: 'es',
            text: questionData.questionEs
          })
      }

      return { success: true }
    } catch (err) {
      console.error('Error creating question:', err)
      setError(err instanceof Error ? err.message : 'Failed to create question')
      return { success: false, error: err }
    } finally {
      setCreating(false)
    }
  }

  return { createQuestion, creating, error }
}

// Hook for creating new characteristics/dangers/misunderstandings
export function useCreateCharacteristic() {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const createCharacteristic = async (data: {
    type: 'characteristic' | 'danger' | 'misunderstanding'
    contentPt: string
    contentEn?: string
    contentEs?: string
    giftKey: string
  }) => {
    try {
      setCreating(true)
      setError(null)

      // Determine table and field names
      let tableName = ''
      let fieldName = ''

      switch (data.type) {
        case 'characteristic':
          tableName = 'characteristics'
          fieldName = 'characteristic'
          break
        case 'danger':
          tableName = 'dangers'
          fieldName = 'danger'
          break
        case 'misunderstanding':
          tableName = 'misunderstandings'
          fieldName = 'misunderstanding'
          break
      }

      // Create Portuguese version
      const { error: ptError } = await supabase
        .from(tableName)
        .insert({
          gift_key: data.giftKey,
          [fieldName]: data.contentPt,
          locale: 'pt'
        })

      if (ptError) throw ptError

      // Create English version if provided
      if (data.contentEn) {
        const { error: enError } = await supabase
          .from(tableName)
          .insert({
            gift_key: data.giftKey,
            [fieldName]: data.contentEn,
            locale: 'en'
          })

        if (enError) throw enError
      }

      // Create Spanish version if provided
      if (data.contentEs) {
        const { error: esError } = await supabase
          .from(tableName)
          .insert({
            gift_key: data.giftKey,
            [fieldName]: data.contentEs,
            locale: 'es'
          })

        if (esError) throw esError
      }

      return { success: true }
    } catch (err) {
      console.error('Error creating characteristic:', err)
      setError(err instanceof Error ? err.message : 'Failed to create characteristic')
      return { success: false, error: err }
    } finally {
      setCreating(false)
    }
  }

  return { createCharacteristic, creating, error }
}

// Hook for deleting spiritual gifts
export function useDeleteGift() {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const deleteGift = async (giftKey: string) => {
    try {
      setDeleting(true)
      setError(null)

      // Delete all related data first

      // Delete questions
      const { error: questionsError } = await supabase
        .from('question_pool')
        .delete()
        .eq('gift', giftKey)

      if (questionsError) throw questionsError

      // Delete characteristics
      const { error: charError } = await supabase
        .from('characteristics')
        .delete()
        .eq('gift_key', giftKey)

      if (charError) throw charError

      // Delete dangers
      const { error: dangerError } = await supabase
        .from('dangers')
        .delete()
        .eq('gift_key', giftKey)

      if (dangerError) throw dangerError

      // Delete misunderstandings
      const { error: misundError } = await supabase
        .from('misunderstandings')
        .delete()
        .eq('gift_key', giftKey)

      if (misundError) throw misundError

      // Finally delete the gift itself (all locales)
      const { error: giftError } = await supabase
        .from('spiritual_gifts')
        .delete()
        .eq('gift_key', giftKey)

      if (giftError) throw giftError

      return { success: true }
    } catch (err) {
      console.error('Error deleting gift:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete gift')
      return { success: false, error: err }
    } finally {
      setDeleting(false)
    }
  }

  return { deleteGift, deleting, error }
}

// Hook for deleting questions
export function useDeleteQuestion() {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const deleteQuestion = async (questionId: string) => {
    try {
      setDeleting(true)
      setError(null)

      // Delete translations first
      const { error: translationsError } = await supabase
        .from('question_translations')
        .delete()
        .eq('question_id', questionId)

      if (translationsError) throw translationsError

      // Delete the question
      const { error: questionError } = await supabase
        .from('question_pool')
        .delete()
        .eq('id', questionId)

      if (questionError) throw questionError

      return { success: true }
    } catch (err) {
      console.error('Error deleting question:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete question')
      return { success: false, error: err }
    } finally {
      setDeleting(false)
    }
  }

  return { deleteQuestion, deleting, error }
}

// Hook for deleting characteristics/dangers/misunderstandings
export function useDeleteCharacteristic() {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const deleteCharacteristic = async (
    characteristicId: string,
    type: 'characteristic' | 'danger' | 'misunderstanding'
  ) => {
    try {
      setDeleting(true)
      setError(null)

      // Determine table name
      let tableName = ''
      switch (type) {
        case 'characteristic':
          tableName = 'characteristics'
          break
        case 'danger':
          tableName = 'dangers'
          break
        case 'misunderstanding':
          tableName = 'misunderstandings'
          break
      }

      // Extract numeric ID from the prefixed ID
      const numericId = characteristicId.split('-')[1]

      // Delete from the appropriate table (all locales)
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', numericId)

      if (deleteError) throw deleteError

      return { success: true }
    } catch (err) {
      console.error('Error deleting characteristic:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete characteristic')
      return { success: false, error: err }
    } finally {
      setDeleting(false)
    }
  }

  return { deleteCharacteristic, deleting, error }
}