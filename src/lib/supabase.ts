import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/** The cloud database client, or null when the app runs in browser-only mode. */
export const supabase = url && key ? createClient(url, key) : null
