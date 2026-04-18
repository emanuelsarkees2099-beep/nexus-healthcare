import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

let supabaseClient: SupabaseClient<Database> | null = null

/**
 * Singleton Supabase client for browser
 */
export const createClientClient = (): SupabaseClient<Database> => {
  if (!supabaseClient) {
    supabaseClient = createClient<Database>(url, anonKey)
  }
  return supabaseClient
}
