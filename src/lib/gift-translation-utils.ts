/**
 * Gift translation utilities for i18n support
 */

import { useTranslations } from 'next-intl'
import type { Database } from '@/lib/database.types'

/**
 * Hook to get localized gift names from i18n files
 */
export function useGiftTranslations() {
  const t = useTranslations('gifts.names')
  
  /**
   * Get translated gift name by gift key
   */
  const getGiftName = (giftKey: Database['public']['Enums']['gift_key']): string => {
    // Try to get translation from i18n files first
    try {
      return t(giftKey)
    } catch {
      // Fallback to hardcoded names if translation is missing
      return getDefaultGiftName(giftKey)
    }
  }

  return { getGiftName }
}

/**
 * Get default gift names (Portuguese) for fallback
 */
export function getDefaultGiftName(giftKey: Database['public']['Enums']['gift_key']): string {
  const defaultNames: Record<Database['public']['Enums']['gift_key'], string> = {
    'A_PROPHECY': 'Profecia',
    'B_SERVICE': 'Serviço',
    'C_TEACHING': 'Ensino',
    'D_EXHORTATION': 'Exortação',
    'E_GIVING': 'Contribuição',
    'F_LEADERSHIP': 'Liderança',
    'G_MERCY': 'Misericórdia'
  }
  
  return defaultNames[giftKey] || giftKey
}

/**
 * Static utility for server-side or non-hook contexts
 */
export function getGiftNameStatic(
  giftKey: Database['public']['Enums']['gift_key'], 
  locale: string = 'pt'
): string {
  // Map of gift translations by locale
  const translations: Record<string, Record<Database['public']['Enums']['gift_key'], string>> = {
    pt: {
      'A_PROPHECY': 'Profecia',
      'B_SERVICE': 'Serviço',
      'C_TEACHING': 'Ensino',
      'D_EXHORTATION': 'Exortação',
      'E_GIVING': 'Contribuição',
      'F_LEADERSHIP': 'Liderança',
      'G_MERCY': 'Misericórdia'
    },
    en: {
      'A_PROPHECY': 'Prophecy',
      'B_SERVICE': 'Service',
      'C_TEACHING': 'Teaching',
      'D_EXHORTATION': 'Exhortation',
      'E_GIVING': 'Giving',
      'F_LEADERSHIP': 'Leadership',
      'G_MERCY': 'Mercy'
    },
    es: {
      'A_PROPHECY': 'Profecía',
      'B_SERVICE': 'Servicio',
      'C_TEACHING': 'Enseñanza',
      'D_EXHORTATION': 'Exhortación',
      'E_GIVING': 'Contribución',
      'F_LEADERSHIP': 'Liderazgo',
      'G_MERCY': 'Misericordia'
    }
  }
  
  return translations[locale]?.[giftKey] || translations.pt[giftKey] || giftKey
}