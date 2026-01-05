'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase-client'

export interface BibleVerse {
    id: string
    gift_key: string
    verse_reference: string
    verse_text: string
    relevance_score?: number
    locale: string
}

/**
 * Hook to fetch Bible verses for a specific spiritual gift
 * @param giftKey - The gift key (e.g., 'A_PROPHECY', 'B_SERVICE')
 * @param locale - The locale (default: 'pt')
 * @param limit - Maximum number of verses to fetch (default: 20)
 */
export function useGiftBibleVerses(
    giftKey: string | undefined,
    locale: string = 'pt',
    limit: number = 20
) {
    const supabase = getSupabaseClient()

    return useQuery({
        queryKey: ['gift-bible-verses', giftKey, locale, limit],
        queryFn: async (): Promise<BibleVerse[]> => {
            if (!giftKey) return []

            const { data, error } = await supabase
                .from('gift_bible_verses')
                .select('*')
                .eq('gift_key', giftKey)
                .eq('locale', locale)
                .order('relevance_score', { ascending: false, nullsFirst: false })
                .limit(limit)

            if (error) {
                console.error('Error fetching Bible verses:', error)
                throw error
            }

            return data || []
        },
        enabled: !!giftKey,
        staleTime: 1000 * 60 * 60, // 1 hour - Bible verses don't change often
    })
}

/**
 * Hook to fetch all Bible verses for multiple gifts
 * Useful for comparison or overview pages
 */
export function useMultipleGiftsBibleVerses(
    giftKeys: string[],
    locale: string = 'pt',
    limitPerGift: number = 10
) {
    const supabase = getSupabaseClient()

    return useQuery({
        queryKey: ['multiple-gifts-bible-verses', giftKeys, locale, limitPerGift],
        queryFn: async (): Promise<Record<string, BibleVerse[]>> => {
            if (!giftKeys || giftKeys.length === 0) return {}

            const { data, error } = await supabase
                .from('gift_bible_verses')
                .select('*')
                .in('gift_key', giftKeys)
                .eq('locale', locale)
                .order('relevance_score', { ascending: false, nullsFirst: false })

            if (error) {
                console.error('Error fetching multiple gifts Bible verses:', error)
                throw error
            }

            // Group by gift_key and limit per gift
            const grouped: Record<string, BibleVerse[]> = {}
            data?.forEach((verse: BibleVerse) => {
                if (!grouped[verse.gift_key]) {
                    grouped[verse.gift_key] = []
                }
                if (grouped[verse.gift_key].length < limitPerGift) {
                    grouped[verse.gift_key].push(verse)
                }
            })

            return grouped
        },
        enabled: giftKeys.length > 0,
        staleTime: 1000 * 60 * 60,
    })
}
