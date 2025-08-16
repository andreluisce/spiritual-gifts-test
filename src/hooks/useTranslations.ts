'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

interface GiftGroup {
  gift_key: string
  name_pt?: string
  name_en?: string
  name_es?: string
  definition_pt?: string
  definition_en?: string
  definition_es?: string
}

interface QuestionGroup {
  id: number
  gift: string
  text_pt?: string
  text_en?: string
  text_es?: string
}

interface CharacteristicGroup {
  id: number
  gift_key: string
  characteristic_pt?: string
  characteristic_en?: string
  characteristic_es?: string
}

// Types
export type Translation = {
  id: string
  key: string
  type: 'gift' | 'question' | 'characteristic' | 'ui'
  pt?: string
  en?: string
  es?: string
  lastUpdated: string
  giftKey?: string
}

// Hook for fetching and managing translations
export function useTranslations() {
  const [translations, setTranslations] = useState<Translation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        setLoading(true)
        setError(null)

        const allTranslations: Translation[] = []

        // 1. Fetch spiritual gifts translations
        const { data: giftsData, error: giftsError } = await supabase
          .from('spiritual_gifts')
          .select('gift_key, name, definition, locale')
          .order('gift_key')

        if (giftsError) throw giftsError

        if (giftsData) {
          // Group by gift_key
          const giftGroups: Record<string, any> = {}
          giftsData.forEach(gift => {
            if (!giftGroups[gift.gift_key]) {
              giftGroups[gift.gift_key] = { gift_key: gift.gift_key }
            }
            giftGroups[gift.gift_key][`name_${gift.locale}`] = gift.name
            giftGroups[gift.gift_key][`definition_${gift.locale}`] = gift.definition
          })

          // Create translation objects for names and definitions
          Object.values(giftGroups).forEach((group: GiftGroup) => {
            // Name translation
            allTranslations.push({
              id: `gift_name_${group.gift_key}`,
              key: `${group.gift_key}_name`,
              type: 'gift',
              pt: group.name_pt,
              en: group.name_en,
              es: group.name_es,
              lastUpdated: new Date().toISOString(),
              giftKey: group.gift_key
            })

            // Definition translation
            allTranslations.push({
              id: `gift_definition_${group.gift_key}`,
              key: `${group.gift_key}_definition`,
              type: 'gift',
              pt: group.definition_pt,
              en: group.definition_en,
              es: group.definition_es,
              lastUpdated: new Date().toISOString(),
              giftKey: group.gift_key
            })
          })
        }

        // 2. Fetch question translations
        const { data: questionsData, error: questionsError } = await supabase
          .from('question_pool')
          .select('id, gift, text')

        if (questionsError) throw questionsError

        if (questionsData) {
          // Get question translations
          const { data: questionTranslations, error: qtError } = await supabase
            .from('question_translations')
            .select('question_id, locale, text')

          if (!qtError && questionTranslations) {
            const questionGroups: Record<string, any> = {}
            
            questionsData.forEach(question => {
              questionGroups[question.id] = {
                id: question.id,
                gift: question.gift,
                text: question.text
              }
            })

            questionTranslations.forEach(trans => {
              if (questionGroups[trans.question_id]) {
                questionGroups[trans.question_id][trans.locale] = trans.text
              }
            })

            Object.values(questionGroups).forEach((question: QuestionGroup) => {
              allTranslations.push({
                id: `question_${question.id}`,
                key: `question_${question.id}`,
                type: 'question',
                pt: question.pt || question.text,
                en: question.en,
                es: question.es,
                lastUpdated: new Date().toISOString(),
                giftKey: question.gift
              })
            })
          }
        }

        // 3. Fetch characteristics translations
        const characteristicTables = [
          { table: 'characteristics', field: 'characteristic', prefix: 'char' },
          { table: 'dangers', field: 'danger', prefix: 'danger' },
          { table: 'misunderstandings', field: 'misunderstanding', prefix: 'misund' }
        ]

        for (const tableInfo of characteristicTables) {
          const { data: charData, error: charError } = await supabase
            .from(tableInfo.table)
            .select(`id, gift_key, ${tableInfo.field}, locale`)

          if (!charError && charData) {
            const charGroups: Record<string, any> = {}
            
            charData.forEach(char => {
              const key = `${char.id}`
              if (!charGroups[key]) {
                charGroups[key] = {
                  id: char.id,
                  gift_key: char.gift_key
                }
              }
              charGroups[key][char.locale] = char[tableInfo.field]
            })

            Object.values(charGroups).forEach((char: CharacteristicGroup) => {
              allTranslations.push({
                id: `${tableInfo.prefix}_${char.id}`,
                key: `${tableInfo.prefix}_${char.id}`,
                type: 'characteristic',
                pt: char.pt,
                en: char.en,
                es: char.es,
                lastUpdated: new Date().toISOString(),
                giftKey: char.gift_key
              })
            })
          }
        }

        // 4. Add some mock UI translations for demonstration
        const uiTranslations = [
          {
            id: 'ui_welcome',
            key: 'welcome_message',
            type: 'ui' as const,
            pt: 'Bem-vindo ao Teste de Dons Espirituais',
            en: 'Welcome to the Spiritual Gifts Test',
            es: 'Bienvenido a la Prueba de Dones Espirituales',
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'ui_start_test',
            key: 'start_test_button',
            type: 'ui' as const,
            pt: 'Começar Teste',
            en: 'Start Test',
            es: 'Comenzar Prueba',
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'ui_dashboard',
            key: 'dashboard_title',
            type: 'ui' as const,
            pt: 'Meu Dashboard',
            en: 'My Dashboard',
            es: 'Mi Panel',
            lastUpdated: new Date().toISOString()
          }
        ]

        allTranslations.push(...uiTranslations)

        setTranslations(allTranslations)
      } catch (err) {
        console.error('Error fetching translations:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch translations')
      } finally {
        setLoading(false)
      }
    }

    fetchTranslations()
  }, [supabase])

  const updateTranslation = async (translationId: string, updates: { pt?: string; en?: string; es?: string }) => {
    try {
      setUpdating(true)
      setError(null)

      // Parse the translation ID to determine what to update
      const [type, ...idParts] = translationId.split('_')
      
      if (type === 'gift') {
        const [field, giftKey] = idParts
        
        // Update spiritual gifts table
        for (const [locale, value] of Object.entries(updates)) {
          if (value !== undefined) {
            const updateData = field === 'name' ? { name: value } : { definition: value }
            
            await supabase
              .from('spiritual_gifts')
              .update(updateData)
              .eq('gift_key', giftKey)
              .eq('locale', locale)
          }
        }
      } else if (type === 'question') {
        const questionId = idParts[0]
        
        // Update question translations
        for (const [locale, value] of Object.entries(updates)) {
          if (value !== undefined) {
            await supabase
              .from('question_translations')
              .upsert({
                question_id: parseInt(questionId),
                locale,
                text: value
              })
          }
        }

        // Update main question text if Portuguese is provided
        if (updates.pt) {
          await supabase
            .from('question_pool')
            .update({ text: updates.pt })
            .eq('id', questionId)
        }
      } else if (['char', 'danger', 'misund'].includes(type)) {
        const characteristicId = idParts[0]
        let tableName = ''
        let fieldName = ''
        
        switch (type) {
          case 'char':
            tableName = 'characteristics'
            fieldName = 'characteristic'
            break
          case 'danger':
            tableName = 'dangers'
            fieldName = 'danger'
            break
          case 'misund':
            tableName = 'misunderstandings'
            fieldName = 'misunderstanding'
            break
        }

        // Update characteristics/dangers/misunderstandings
        for (const [locale, value] of Object.entries(updates)) {
          if (value !== undefined) {
            await supabase
              .from(tableName)
              .update({ [fieldName]: value })
              .eq('id', characteristicId)
              .eq('locale', locale)
          }
        }
      } else if (type === 'ui') {
        // For UI translations, we would typically update a dedicated translations table
        // For now, we'll just log this as it's mock data
      }

      return { success: true }
    } catch (err) {
      console.error('Error updating translation:', err)
      setError(err instanceof Error ? err.message : 'Failed to update translation')
      return { success: false, error: err }
    } finally {
      setUpdating(false)
    }
  }

  return { translations, loading, error, updateTranslation, updating }
}