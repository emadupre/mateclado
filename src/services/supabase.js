import { createClient } from '@supabase/supabase-js'

let client = null

export function getSupabase() {
  if (client) return client

  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_KEY

  if (!url || !key) {
    throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_KEY en el archivo .env.local')
  }

  client = createClient(url, key)
  return client
}
