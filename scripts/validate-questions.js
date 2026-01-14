#!/usr/bin/env node

/**
 * Quick validator for quiz questions.
 * - Fetches active questions from Supabase
 * - Flags reverse_scored (should be zero)
 * - Flags language with potential leading/absolute terms
 * - Checks distribution per gift and per weight class
 * - Checks missing translations (pt/en/es)
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Lightweight env loader (avoids adding dependencies)
function loadEnvFile(file) {
  const fullPath = path.join(process.cwd(), file)
  if (!fs.existsSync(fullPath)) return
  const content = fs.readFileSync(fullPath, 'utf8')
  content.split('\n').forEach(line => {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/)
    if (m) {
      const key = m[1]
      let value = m[2]
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
      if (!process.env[key]) process.env[key] = value
    }
  })
}

loadEnvFile('.env.local')
loadEnvFile('.env')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const leadingPatterns = [
  /sempre/i,
  /nunca/i,
  /todos?/i,
  /superior/i,
  /m[aá]rtir/i,
  /ignoro/i,
  /imponho/i,
  /centralizo/i,
  /tudo/i
]

async function main() {
  const { data: questions, error } = await supabase
    .from('question_pool')
    .select('id, gift, pclass, reverse_scored, text, is_active')
    .eq('is_active', true)
    .order('gift')
    .order('pclass')
    .order('id')

  if (error) {
    console.error('Error fetching questions:', error)
    process.exit(1)
  }

  const { data: translations, error: tError } = await supabase
    .from('question_translations')
    .select('question_id, locale, text')

  if (tError) {
    console.error('Error fetching translations:', tError)
    process.exit(1)
  }

  const stats = {
    total: questions.length,
    byGift: {},
    byPclass: {},
    reverseScored: questions.filter(q => q.reverse_scored)
  }

  questions.forEach(q => {
    stats.byGift[q.gift] = (stats.byGift[q.gift] || 0) + 1
    stats.byPclass[q.pclass] = (stats.byPclass[q.pclass] || 0) + 1
  })

  const flaggedLanguage = questions
    .map(q => {
      const hit = leadingPatterns.find(re => re.test(q.text || ''))
      return hit ? { id: q.id, gift: q.gift, text: q.text, pattern: hit.toString() } : null
    })
    .filter(Boolean)

  const translationIndex = translations.reduce((acc, t) => {
    acc[`${t.question_id}-${t.locale}`] = true
    return acc
  }, {})

  const requiredLocales = ['pt', 'en', 'es']
  const missingTranslations = []

  questions.forEach(q => {
    requiredLocales.forEach(locale => {
      if (!translationIndex[`${q.id}-${locale}`]) {
        missingTranslations.push({ id: q.id, gift: q.gift, locale })
      }
    })
  })

  console.log('=== Question Validation Report ===')
  console.log(`Total active questions: ${stats.total}`)
  console.log('By gift:', stats.byGift)
  console.log('By pclass:', stats.byPclass)

  if (stats.reverseScored.length) {
    console.log('\n⚠️ Reverse-scored (should be 0):')
    stats.reverseScored.forEach(q => console.log(`- ${q.id} (${q.gift} / ${q.pclass}) ${q.text}`))
  } else {
    console.log('\n✅ No reverse-scored questions active.')
  }

  if (flaggedLanguage.length) {
    console.log('\n⚠️ Potentially leading/absolute wording:')
    flaggedLanguage.forEach(f => console.log(`- ${f.id} (${f.gift}) [${f.pattern}]: ${f.text}`))
  } else {
    console.log('\n✅ No obvious leading/absolute wording found.')
  }

  if (missingTranslations.length) {
    console.log('\n⚠️ Missing translations:')
    missingTranslations.forEach(m => console.log(`- Q${m.id} (${m.gift}) missing ${m.locale}`))
  } else {
    console.log('\n✅ All required translations present (pt/en/es).')
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
