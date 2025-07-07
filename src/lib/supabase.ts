// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Estas variables de entorno deben estar en tu archivo .env.local para desarrollo
// y configuradas en el entorno de producción (ej. Vercel)
// NOTA: Este archivo es parte de la configuración de Supabase. Si sigues la guía de Firebase, no se utilizará.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para uso en el NAVEGADOR (Client Components, etc.)
// Usa la clave anónima (pública) que es segura para exponer en el cliente.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
