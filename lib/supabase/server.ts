import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Mismas variables de entorno que antes (ver .env.local.example).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Cliente de Supabase "consciente de la sesión": lee y escribe las cookies
 * de autenticación de la petición actual. Se debe crear uno nuevo en cada
 * Server Component / Server Action (nunca reutilizar una instancia global),
 * porque cada petición trae sus propias cookies.
 *
 * Devuelve `null` si las variables de entorno todavía no están configuradas,
 * para que las páginas puedan mostrar un aviso en vez de romperse.
 */
export async function createClient() {
  if (!supabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl as string, supabaseAnonKey as string, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // `setAll` fue llamado desde un Server Component (no puede
          // escribir cookies). Se puede ignorar porque el proxy
          // (lib/supabase/proxy.ts) ya se encarga de refrescar la sesión.
        }
      },
    },
  });
}

/** Devuelve el usuario autenticado actual, o null si no hay sesión. */
export async function getUsuarioActual() {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
