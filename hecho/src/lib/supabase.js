import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabaseConfigurado = Boolean(supabaseUrl && supabasePublishableKey)

if (!supabaseConfigurado) {
  console.warn(
    'Faltan variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_PUBLISHABLE_KEY en .env.local'
  )
}

export const supabase = supabaseConfigurado
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null
