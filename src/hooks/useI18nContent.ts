'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase-client'

// Types for i18n content
export type SpiritualGiftI18n = {
    gift_key: string
    name: string
    definition: string | null
    biblical_references: string | null
    category_key: string
}

export type QuestionI18n = {
    question_id: number
    text: string
    gift: string
    default_weight: number
    pclass: string
    reverse_scored: boolean
    is_active: boolean
}

export type EducationalContentI18n = {
    content_id: string
    section_type: string
    title: string
    content: string
    biblical_reference: string | null
    order_index: number
    is_active: boolean
}

export type GiftCompleteI18n = {
    gift_info: {
        gift_key: string
        name: string
        definition: string | null
        biblical_references: string | null
        category_key: string
    }
    characteristics: Array<{
        name: string
        description: string | null
    }>
    bible_verses: Array<{
        reference: string
        text: string
        context: string | null
    }>
    dangers: Array<{
        danger: string
    }>
    qualities: Array<{
        name: string
        description: string | null
    }>
    misunderstandings: Array<{
        misunderstanding: string
    }>
}

/**
 * Hook to get all spiritual gifts with i18n support
 */
export function useSpiritualGiftsI18n() {
    const locale = useLocale()
    const [gifts, setGifts] = useState<SpiritualGiftI18n[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [supabase] = useState(() => createClient())

    useEffect(() => {
        const fetchGifts = async () => {
            try {
                setLoading(true)
                setError(null)

                const { data, error: rpcError } = await supabase.rpc('get_spiritual_gifts_i18n', {
                    p_locale: locale
                })

                if (rpcError) throw rpcError

                setGifts(data || [])
            } catch (err) {
                console.error('Error fetching spiritual gifts i18n:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch gifts')
            } finally {
                setLoading(false)
            }
        }

        fetchGifts()
    }, [supabase, locale])

    return { gifts, loading, error }
}

/**
 * Hook to get quiz questions with i18n support
 */
export function useQuestionsI18n() {
    const locale = useLocale()
    const [questions, setQuestions] = useState<QuestionI18n[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [supabase] = useState(() => createClient())

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true)
                setError(null)

                const { data, error: rpcError } = await supabase.rpc('get_questions_i18n', {
                    p_locale: locale
                })

                if (rpcError) throw rpcError

                setQuestions(data || [])
            } catch (err) {
                console.error('Error fetching questions i18n:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch questions')
            } finally {
                setLoading(false)
            }
        }

        fetchQuestions()
    }, [supabase, locale])

    return { questions, loading, error }
}

/**
 * Hook to get educational content with i18n support
 */
export function useEducationalContentI18n() {
    const locale = useLocale()
    const [content, setContent] = useState<EducationalContentI18n[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [supabase] = useState(() => createClient())

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true)
                setError(null)

                const { data, error: rpcError } = await supabase.rpc('get_educational_content_i18n', {
                    p_locale: locale
                })

                if (rpcError) throw rpcError

                setContent(data || [])
            } catch (err) {
                console.error('Error fetching educational content i18n:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch content')
            } finally {
                setLoading(false)
            }
        }

        fetchContent()
    }, [supabase, locale])

    return { content, loading, error }
}

/**
 * Hook to get complete gift data (all related content) with i18n support
 */
export function useGiftCompleteI18n(giftKey: string | null) {
    const locale = useLocale()
    const [giftData, setGiftData] = useState<GiftCompleteI18n | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [supabase] = useState(() => createClient())

    useEffect(() => {
        if (!giftKey) {
            setGiftData(null)
            setLoading(false)
            return
        }

        const fetchGiftData = async () => {
            try {
                setLoading(true)
                setError(null)

                const { data, error: rpcError } = await supabase.rpc('get_gift_complete_i18n', {
                    p_gift_key: giftKey,
                    p_locale: locale
                })

                if (rpcError) throw rpcError

                setGiftData(data as GiftCompleteI18n)
            } catch (err) {
                console.error('Error fetching complete gift data i18n:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch gift data')
            } finally {
                setLoading(false)
            }
        }

        fetchGiftData()
    }, [supabase, giftKey, locale])

    return { giftData, loading, error }
}
