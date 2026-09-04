import { createClient } from '@supabase/supabase-js'

// Estas dos variables se configuran como "Environment Variables" en Vercel
// (y en un archivo .env.local para probar en tu propia computadora).
// Nunca se escriben directamente aquí -- así el proyecto es seguro para
// subir a un repositorio público o privado en GitHub.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Si las variables todavía no están configuradas (ej. primer deploy en
// Vercel antes de cargarlas), exportamos "null" en vez de dejar que la
// app se caiga. Cada página revisa `supabaseConfigured` antes de usarlo.
export const supabase = supabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null
