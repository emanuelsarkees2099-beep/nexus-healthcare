import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Server-side client (used in API routes)
export const supabase = createClient(url, key)

// Returns true if Supabase is actually configured
export const isConfigured = () => Boolean(url && key && url !== 'your_supabase_project_url_here')
