import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    if (!url || !key) {
      // Return a dummy client for build time — will be replaced at runtime
      return createClient('https://placeholder.supabase.co', 'placeholder')
    }
    _supabase = createClient(url, key)
  }
  return _supabase
}

// For backward compatibility
export const supabase = typeof window !== 'undefined'
  ? getSupabase()
  : new Proxy({} as SupabaseClient, {
      get: (_target, prop) => {
        const client = getSupabase()
        return (client as any)[prop]
      },
    })

export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  return createClient(url, key, { auth: { persistSession: false } })
}
