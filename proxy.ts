import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// En Next.js 16 este archivo reemplaza al antiguo "middleware.ts".
// Se ejecuta antes de renderizar cualquier ruta que haga match con el
// `matcher` de abajo, y decide si dejar pasar la petición o mandarla a /login.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Corre en todo excepto archivos estáticos, imágenes optimizadas y el
    // favicon, para no interferir con esos recursos.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
