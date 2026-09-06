const TABLAS = [
  { id: "edificios", nombre: "Propiedades", detalle: "Nombre, dirección, % de administración, fecha de corte." },
  { id: "unidades", nombre: "Unidades", detalle: "Cada apartamento con su propiedad, estado y renta vigente." },
  { id: "inquilinos", nombre: "Inquilinos", detalle: "Arrendatarios, codeudor y vigencia del contrato." },
  { id: "movimientos", nombre: "Movimientos", detalle: "Todo el libro de caja: ingresos y egresos con categoría." },
  { id: "dotacion", nombre: "Dotación", detalle: "Ítems de dotación y mejoras por unidad." },
  { id: "proveedores", nombre: "Proveedores", detalle: "Contacto y categoría de cada proveedor." },
  { id: "cotizaciones", nombre: "Cotizaciones", detalle: "Cotizaciones recibidas, su estado y monto." },
];

export default function ExportarPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Exportar
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Descarga cualquier tabla en un archivo <code className="font-mono">.csv</code> que Excel
        abre directamente (con tildes y ñ correctas). Útil para respaldos o para compartir la
        información fuera de la app.
      </p>

      <div className="mt-8 divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {TABLAS.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-4 bg-white p-4 dark:bg-black">
            <div>
              <div className="font-medium text-zinc-900 dark:text-zinc-50">{t.nombre}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">{t.detalle}</div>
            </div>
            <a
              href={`/api/exportar/${t.id}`}
              className="shrink-0 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Descargar CSV
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
