import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Rutas que cualquier visitante puede ver sin haber iniciado sesión.
const RUTAS_PUBLICAS = ["/login"];

function esRutaPublica(pathname: string) {
  return RUTAS_PUBLICAS.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`));
}

/**
 * Se ejecuta en cada petición (ver proxy.ts en la raíz del proyecto).
 * 1. Refresca la sesión de Supabase (renueva las cookies si el token expiró).
 * 2. Si no hay usuario autenticado y la ruta no es pública, redirige a /login.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!supabaseUrl || !supabaseAnonKey) {
    // Sin variables de entorno configuradas todavía: dejamos pasar la
    // petición. Las páginas ya muestran su propio aviso de "falta conectar
    // la base de datos" en ese caso.
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANTE: no quitar este `getUser()`. Es lo que efectivamente
  // refresca el token de sesión (getSession() no lo hace).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !esRutaPublica(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirigir", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
