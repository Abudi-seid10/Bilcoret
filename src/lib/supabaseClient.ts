import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || ''
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Bilcoret] Missing Supabase environment variables. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your Vercel project settings.'
  )
}

// Use placeholder values when env vars are absent so the module loads without
// crashing; API calls will simply return empty results instead of a blank page.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)
