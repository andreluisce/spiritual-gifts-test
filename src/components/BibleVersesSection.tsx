'use client'

import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react'
import { useGiftBibleVerses, type BibleVerse } from '@/hooks/useGiftBibleVerses'

// Bible Verses Section Component
export function BibleVersesSection({
    giftKey,
    locale,
    expandedVerses,
    setExpandedVerses,
    t
}: {
    giftKey: string
    locale: string
    expandedVerses: Set<string>
    setExpandedVerses: (set: Set<string>) => void
    t: any
}) {
    const { data: verses, isLoading } = useGiftBibleVerses(giftKey, locale, 20)

    if (isLoading) {
        return (
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
        )
    }

    if (!verses || verses.length === 0) {
        return null
    }

    const isExpanded = expandedVerses.has(giftKey)
    const displayedVerses = isExpanded ? verses : verses.slice(0, 3)

    const toggleExpansion = () => {
        const newSet = new Set(expandedVerses)
        if (isExpanded) {
            newSet.delete(giftKey)
        } else {
            newSet.add(giftKey)
        }
        setExpandedVerses(newSet)
    }

    return (
        <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                Referências Bíblicas ({verses.length})
            </h4>
            <div className="space-y-2">
                {displayedVerses.map((verse: BibleVerse, index: number) => (
                    <div key={verse.id} className="text-sm">
                        <p className="font-medium text-blue-600">{verse.verse_reference}</p>
                        <p className="text-gray-600 italic ml-2">{verse.verse_text}</p>
                    </div>
                ))}
            </div>
            {verses.length > 3 && (
                <button
                    onClick={toggleExpansion}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-2 flex items-center gap-1"
                >
                    {isExpanded ? (
                        <>
                            <ChevronDown className="h-3 w-3" />
                            Mostrar menos
                        </>
                    ) : (
                        <>
                            <ChevronRight className="h-3 w-3" />
                            E mais {verses.length - 3} versículos...
                        </>
                    )}
                </button>
            )}
        </div>
    )
}
