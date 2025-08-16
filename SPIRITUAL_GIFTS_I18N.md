# Spiritual Gifts Internationalization (i18n) System

## Overview
The spiritual gifts are now fully internationalized across Portuguese (pt), English (en), and Spanish (es) languages.

## Gift Names Available

| Gift Key | Portuguese | English | Spanish |
|----------|------------|---------|---------|
| A_PROPHECY | Profecia | Prophecy | Profecía |
| B_SERVICE | Serviço | Service | Servicio |
| C_TEACHING | Ensino | Teaching | Enseñanza |
| D_EXHORTATION | Exortação | Exhortation | Exhortación |
| E_GIVING | Contribuição | Giving | Contribución |
| F_LEADERSHIP | Liderança | Leadership | Liderazgo |
| G_MERCY | Misericórdia | Mercy | Misericordia |

## Usage

### 1. Using the Hook (Client Components)

```typescript
import { useGiftTranslations } from '@/lib/gift-translation-utils'

export function MyComponent() {
  const { getGiftName } = useGiftTranslations()
  
  // Get localized gift name
  const giftName = getGiftName('A_PROPHECY') // Returns "Profecia" in pt, "Prophecy" in en, etc.
  
  return <div>{giftName}</div>
}
```

### 2. Using Static Function (Server Components/Static Contexts)

```typescript
import { getGiftNameStatic } from '@/lib/gift-translation-utils'

// Get gift name for specific locale
const portugueseName = getGiftNameStatic('A_PROPHECY', 'pt') // "Profecia"
const englishName = getGiftNameStatic('A_PROPHECY', 'en')   // "Prophecy"
const spanishName = getGiftNameStatic('A_PROPHECY', 'es')   // "Profecía"
```

### 3. Using Next.js Intl Hook

```typescript
import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('gifts.names')
  
  const giftName = t('A_PROPHECY') // Automatically uses current locale
  
  return <div>{giftName}</div>
}
```

### 4. Getting Localized Spiritual Gifts Array

```typescript
import { getSpiritualGifts } from '@/data/quiz-data'

// Get all gifts with localized names
const gifts = getSpiritualGifts('en') // All gifts with English names
const portugueseGifts = getSpiritualGifts('pt') // All gifts with Portuguese names
```

## File Locations

- **Translation files**: `src/i18n/messages/[locale].json`
- **Utility functions**: `src/lib/gift-translation-utils.ts`
- **Data with localization**: `src/data/quiz-data.ts`

## Implementation Details

- All spiritual gifts are now in the `gifts.names` namespace in i18n files
- Backward compatibility is maintained with existing code
- New `getSpiritualGifts(locale)` function provides localized gift arrays
- Fallback system ensures Portuguese names are shown if translation is missing