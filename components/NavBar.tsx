import Link from "next/link";
import { getUsuarioActual } from "@/lib/supabase/server";
import { cerrarSesion } from "@/app/login/actions";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/edificios", label: "Propiedades" },
  { href: "/unidades", label: "Unidades" },
  { href: "/inquilinos", label: "Inquilinos" },
  { href: "/movimientos", label: "Movimientos" },
  { href: "/dotacion", label: "Dotación" },
  { href: "/proveedores", label: "Proveedores" },
  { href: "/cotizaciones", label: "Cotizaciones" },
  { href: "/exportar", label: "Exportar" },
  // "Impuestos" (obligaciones_regulatorias) se quita del menú a pedido: por
  // ahora esa información se registra en Movimientos con la categoría
  // "Impuestos". La pantalla sigue en /obligaciones por si se retoma después.
  { href: "/ayuda", label: "Ayuda" },
];

export async function NavBar() {
  const usuario = await getUsuarioActual();

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-stone-700 dark:text-stone-300">
          García-Yepes Inmuebles
        </span>
        <div className="flex flex-1 flex-wrap gap-x-4 gap-y-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
        {usuario && (
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="text-sm text-stone-500 underline hover:text-stone-900 dark:hover:text-stone-50"
            >
              Cerrar sesión
            </button>
          </form>
        )}
      </nav>
    </header>
  );
}
