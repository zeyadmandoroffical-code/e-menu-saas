import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mhnusflryhpgcetsngnk.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_zHQ1jFm9fCsGZQo8Kbyp_A_YSJHhoZd'

/**
 * Global Supabase Client Instance (Browser & Server Compatible)
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

/**
 * Factory function to create custom typed client instance
 */
export const getSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}
