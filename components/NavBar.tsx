import Link from "next/link";
import { getUsuarioActual } from "@/lib/supabase/server";
import { cerrarSesion } from "@/app/login/actions";

const links = [
  { href: "/", label: "Resumen" },
  { href: "/unidades", label: "Unidades" },
  { href: "/movimientos", label: "Movimientos" },
  { href: "/proveedores", label: "Proveedores" },
  { href: "/cotizaciones", label: "Cotizaciones" },
];

export async function NavBar() {
  const usuario = await getUsuarioActual();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <nav className="mx-auto flex max-w-3xl items-center gap-6 px-6 py-4">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Blanco y Negro
        </span>
        <div className="flex flex-1 gap-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
        {usuario && (
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              Cerrar sesión
            </button>
          </form>
        )}
      </nav>
    </header>
  );
}
