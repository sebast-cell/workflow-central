// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Estas variables de entorno deben estar en tu archivo .env.local para desarrollo
// y configuradas en el entorno de producción (ej. Vercel)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!


// Cliente para uso en el NAVEGADOR (Client Components, etc.)
// Usa la clave anónima (pública) que es segura para exponer en el cliente.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// Cliente para uso en el SERVIDOR (API Routes, Server Actions)
// Usa la clave de servicio (secreta) que tiene permisos elevados.
// ¡NUNCA expongas esta clave en el cliente!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
