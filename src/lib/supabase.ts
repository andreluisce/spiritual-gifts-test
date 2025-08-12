import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export const createSupabaseBrowserClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

export type SupabaseClient = ReturnType<typeof createSupabaseBrowserClient>