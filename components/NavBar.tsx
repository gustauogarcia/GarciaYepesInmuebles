import Link from "next/link";

const links = [
  { href: "/", label: "Resumen" },
  { href: "/unidades", label: "Unidades" },
  { href: "/proveedores", label: "Proveedores" },
  { href: "/cotizaciones", label: "Cotizaciones" },
];

export function NavBar() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <nav className="mx-auto flex max-w-3xl items-center gap-6 px-6 py-4">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Blanco y Negro
        </span>
        <div className="flex gap-4 text-sm">
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
      </nav>
    </header>
  );
}
