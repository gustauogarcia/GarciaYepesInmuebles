import Link from "next/link";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { CotizacionForm } from "./CotizacionForm";
import { crearCotizacion } from "./actions";

export const dynamic = "force-dynamic";

type ProveedorRow = { id: string; nombre: string };
type EdificioRow = { id: string; nombre: string };
type UnidadRow = { id: string; codigo: string; edificio_id: string };

type CotizacionRow = {
  id: string;
  fecha: string;
  descripcion: string;
  monto: number;
  estado: string;
  proveedores: { nombre: string } | null;
  edificios: { nombre: string } | null;
  unidades: { codigo: string } | null;
};

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

async function getDatos() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [
    { data: proveedores, error: errorProveedores },
    { data: edificios, error: errorEdificios },
    { data: unidades, error: errorUnidades },
    { data: cotizaciones, error: errorCotizaciones },
  ] = await Promise.all([
    supabase.from("proveedores").select("id, nombre").order("nombre"),
    supabase.from("edificios").select("id, nombre").order("nombre"),
    supabase.from("unidades").select("id, codigo, edificio_id").order("codigo"),
    supabase
      .from("cotizaciones")
      .select(
        "id, fecha, descripcion, monto, estado, proveedores(nombre), edificios(nombre), unidades(codigo)"
      )
      .order("fecha", { ascending: false }),
  ]);

  if (errorProveedores || errorEdificios || errorUnidades || errorCotizaciones) return null;

  const edificiosConUnidades = ((edificios as EdificioRow[]) ?? []).map((e) => ({
    id: e.id,
    nombre: e.nombre,
    unidades: ((unidades as UnidadRow[]) ?? [])
      .filter((u) => u.edificio_id === e.id)
      .map((u) => ({ id: u.id, codigo: u.codigo })),
  }));

  return {
    proveedores: (proveedores as ProveedorRow[]) ?? [],
    edificios: edificiosConUnidades,
    cotizaciones: (cotizaciones as unknown as CotizacionRow[]) ?? [],
  };
}

function chipEstado(estado: string) {
  const base = "rounded-full px-2 py-0.5 text-xs font-medium";
  if (estado === "Aprobada")
    return `${base} bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300`;
  if (estado === "Rechazada")
    return `${base} bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300`;
  return `${base} bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300`;
}

export default async function CotizacionesPage() {
  const datos = supabaseConfigured ? await getDatos() : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Cotizaciones
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Registra las cotizaciones que te envían los proveedores y su estado (pendiente, aprobada
        o rechazada).
      </p>

      {!datos && (
        <div className="mt-8 rounded-lg border border-red-300 bg-red-50 p-5 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
          No se pudo leer la información de cotizaciones desde Supabase.
        </div>
      )}

      {datos && datos.proveedores.length === 0 && (
        <div className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          Primero registra al menos un{" "}
          <Link href="/proveedores" className="underline">
            proveedor
          </Link>{" "}
          para poder asociarle una cotización.
        </div>
      )}

      {datos && datos.proveedores.length > 0 && (
        <div className="mt-8">
          <CotizacionForm
            proveedores={datos.proveedores}
            edificios={datos.edificios}
            accion={crearCotizacion}
          />
        </div>
      )}

      {datos && (
        <>
          <h2 className="mt-10 text-lg font-medium text-zinc-900 dark:text-zinc-50">
            {datos.cotizaciones.length === 0
              ? "Todavía no hay cotizaciones registradas."
              : `${datos.cotizaciones.length} cotización(es) registrada(s)`}
          </h2>

          {datos.cotizaciones.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-100 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Proveedor</th>
                    <th className="px-4 py-3 font-medium">Descripción</th>
                    <th className="px-4 py-3 font-medium text-right">Monto</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {datos.cotizaciones.map((c) => (
                    <tr key={c.id} className="bg-white dark:bg-black">
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{c.fecha}</td>
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                        {c.proveedores?.nombre ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {c.descripcion}
                        {c.edificios?.nombre && (
                          <span className="block text-xs text-zinc-400">
                            {c.edificios.nombre}
                            {c.unidades?.codigo ? ` · Apto ${c.unidades.codigo}` : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-zinc-900 dark:text-zinc-50">
                        {formatoCOP.format(c.monto)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={chipEstado(c.estado)}>{c.estado}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/cotizaciones/${c.id}`}
                          className="text-xs font-medium text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
