'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

// Types
export type Gift = {
  id: number
  name: string
  nameEn: string
  description: string
  descriptionEn: string
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
  isActive: boolean
  lastUpdated: string
}

export type Characteristic = {
  id: string
  giftId: number
  giftName: string
  giftKey: string
  type: 'characteristic' | 'danger' | 'misunderstanding'
  contentPt: string
  contentEn: string
  isActive: boolean
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

        // Get spiritual gifts from database
        const { data: giftsData, error: giftsError } = await supabase
          .from('spiritual_gifts')
          .select('*')
          .eq('locale', 'pt')
          .order('name')

        if (giftsError) throw giftsError

        if (giftsData) {
          // Count questions for each gift
          const { data: questionCounts, error: questionsError } = await supabase
            .from('question_pool')
            .select('gift')

          const questionsPerGift: Record<string, number> = {}
          if (!questionsError && questionCounts) {
            questionCounts.forEach(q => {
              questionsPerGift[q.gift] = (questionsPerGift[q.gift] || 0) + 1
            })
          }

          const mappedGifts: Gift[] = giftsData.map((gift: any) => ({
            id: gift.id,
            name: gift.name,
            nameEn: gift.name, // TODO: Add English version
            description: gift.definition || '',
            descriptionEn: gift.definition || '',
            isActive: true,
            questionsCount: questionsPerGift[gift.gift_key] || 0,
            lastUpdated: new Date().toISOString().split('T')[0],
            giftKey: gift.gift_key
          }))

          setGifts(mappedGifts)
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
          .eq('locale', 'pt')

        const giftNames: Record<string, string> = {}
        if (!giftsError && giftsData) {
          giftsData.forEach(gift => {
            giftNames[gift.gift_key] = gift.name
          })
        }

        // Get translations
        const { data: translationsData, error: translationsError } = await supabase
          .from('question_translations')
          .select('*')
          .in('locale', ['pt', 'en'])

        const translations: Record<string, Record<string, string>> = {}
        if (!translationsError && translationsData) {
          translationsData.forEach(trans => {
            if (!translations[trans.question_id]) {
              translations[trans.question_id] = {}
            }
            translations[trans.question_id][trans.locale] = trans.text
          })
        }

        if (questionsData) {
          const mappedQuestions: Question[] = questionsData.map((question: any) => ({
            id: question.id.toString(),
            giftId: question.id,
            giftName: giftNames[question.gift] || question.gift,
            giftKey: question.gift,
            questionPt: translations[question.id]?.['pt'] || question.text,
            questionEn: translations[question.id]?.['en'] || question.text,
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
  }, [supabase])

  return { questions, loading, error }
}

// Hook for fetching characteristics
export function useCharacteristics() {
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchCharacteristics = async () => {
      try {
        setLoading(true)

        // Get gift names mapping
        const { data: giftsData, error: giftsError } = await supabase
          .from('spiritual_gifts')
          .select('gift_key, name')
          .eq('locale', 'pt')

        const giftNames: Record<string, string> = {}
        if (!giftsError && giftsData) {
          giftsData.forEach(gift => {
            giftNames[gift.gift_key] = gift.name
          })
        }

        const allCharacteristics: Characteristic[] = []
        let idCounter = 1

        // Get characteristics
        const { data: charData, error: charError } = await supabase
          .from('characteristics')
          .select('*')
          .eq('locale', 'pt')

        if (!charError && charData) {
          charData.forEach((char: any) => {
            allCharacteristics.push({
              id: `char-${idCounter++}`,
              giftId: char.id,
              giftName: giftNames[char.gift_key] || char.gift_key,
              giftKey: char.gift_key,
              type: 'characteristic',
              contentPt: char.characteristic,
              contentEn: char.characteristic, // TODO: Add English version
              isActive: true
            })
          })
        }

        // Get dangers
        const { data: dangerData, error: dangerError } = await supabase
          .from('dangers')
          .select('*')
          .eq('locale', 'pt')

        if (!dangerError && dangerData) {
          dangerData.forEach((danger: any) => {
            allCharacteristics.push({
              id: `danger-${idCounter++}`,
              giftId: danger.id,
              giftName: giftNames[danger.gift_key] || danger.gift_key,
              giftKey: danger.gift_key,
              type: 'danger',
              contentPt: danger.danger,
              contentEn: danger.danger, // TODO: Add English version
              isActive: true
            })
          })
        }

        // Get misunderstandings
        const { data: misundData, error: misundError } = await supabase
          .from('misunderstandings')
          .select('*')
          .eq('locale', 'pt')

        if (!misundError && misundData) {
          misundData.forEach((misund: any) => {
            allCharacteristics.push({
              id: `misund-${idCounter++}`,
              giftId: misund.id,
              giftName: giftNames[misund.gift_key] || misund.gift_key,
              giftKey: misund.gift_key,
              type: 'misunderstanding',
              contentPt: misund.misunderstanding,
              contentEn: misund.misunderstanding, // TODO: Add English version
              isActive: true
            })
          })
        }

        setCharacteristics(allCharacteristics)
      } catch (err) {
        console.error('Error fetching characteristics:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch characteristics')
      } finally {
        setLoading(false)
      }
    }

    fetchCharacteristics()
  }, [supabase])

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
    updates: {
      name?: string
      nameEn?: string
      description?: string
      descriptionEn?: string
      isActive?: boolean
    }
  ) => {
    try {
      setUpdating(true)
      setError(null)

      // Update the spiritual gift
      const { error: updateError } = await supabase
        .from('spiritual_gifts')
        .update({
          name: updates.name,
          definition: updates.description
        })
        .eq('id', giftId)
        .eq('locale', 'pt')

      if (updateError) throw updateError

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
      isActive?: boolean
      giftKey?: string
    }
  ) => {
    try {
      setUpdating(true)
      setError(null)

      // Update the question text and gift assignment
      const updateData: any = {
        text: updates.questionPt,
        is_active: updates.isActive
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
      isActive?: boolean
      giftKey?: string
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

      // Extract numeric ID from the prefixed ID (e.g., "char-1" -> "1")
      const numericId = characteristicId.split('-')[1]

      // Update the content and gift assignment
      const updateData: any = {
        [fieldName]: updates.contentPt
      }
      
      if (updates.giftKey) {
        updateData.gift_key = updates.giftKey
      }

      const { error: updateError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', numericId)
        .eq('locale', 'pt')

      if (updateError) throw updateError

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
    description: string
    descriptionEn?: string
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