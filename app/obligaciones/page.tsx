import Link from "next/link";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { ObligacionForm } from "./ObligacionForm";
import { crearObligacion } from "./actions";

export const dynamic = "force-dynamic";

type EdificioRow = { id: string; nombre: string };
type CategoriaRow = { subcategoria: string };
type ProveedorRow = { nombre: string };

type ObligacionRow = {
  id: string;
  edificio_id: string;
  tipo: string;
  entidad_reguladora: string | null;
  numero_referencia: string | null;
  periodicidad: string | null;
  fecha_vencimiento: string | null;
  monto: number | null;
  estado: string;
  notas: string | null;
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
    { data: edificios, error: errorEdificios },
    { data: categorias },
    { data: proveedores },
    { data: obligaciones, error: errorObligaciones },
  ] = await Promise.all([
    supabase.from("edificios").select("id, nombre").order("nombre"),
    supabase
      .from("categorias_proveedor")
      .select("subcategoria")
      .eq("categoria", "Reguladores e Impuestos")
      .order("orden"),
    supabase
      .from("proveedores")
      .select("nombre, categorias_proveedor!inner(categoria)")
      .eq("categorias_proveedor.categoria", "Reguladores e Impuestos")
      .order("nombre"),
    supabase
      .from("obligaciones_regulatorias")
      .select("*")
      .order("fecha_vencimiento", { ascending: true, nullsFirst: false }),
  ]);

  if (errorEdificios || errorObligaciones) return null;

  return {
    edificios: (edificios as EdificioRow[]) ?? [],
    tiposSugeridos: ((categorias as CategoriaRow[]) ?? []).map((c) => c.subcategoria),
    entidadesSugeridas: ((proveedores as unknown as ProveedorRow[]) ?? []).map((p) => p.nombre),
    obligaciones: (obligaciones as ObligacionRow[]) ?? [],
    nombreEdificio: new Map(((edificios as EdificioRow[]) ?? []).map((e) => [e.id, e.nombre])),
  };
}

function chipEstado(estado: string) {
  const base = "rounded-full px-2 py-0.5 text-xs font-medium";
  if (estado === "Pagado")
    return `${base} bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300`;
  if (estado === "Vencido")
    return `${base} bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300`;
  if (estado === "Exento")
    return `${base} bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400`;
  return `${base} bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300`;
}

export default async function ObligacionesPage() {
  const datos = supabaseConfigured ? await getDatos() : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        Impuestos y obligaciones
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        Catastro, predial, valorización y demás trámites frente a reguladores: vencimientos y
        estado de pago por edificio.
      </p>

      {!datos && (
        <div className="mt-8 rounded-xl border border-red-300 bg-red-50 p-5 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
          No se pudo leer la información de obligaciones desde Supabase.
        </div>
      )}

      {datos && datos.edificios.length === 0 && (
        <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          Primero necesitas al menos un edificio registrado en Supabase.
        </div>
      )}

      {datos && datos.edificios.length > 0 && (
        <div className="mt-8">
          <ObligacionForm
            edificios={datos.edificios}
            tiposSugeridos={datos.tiposSugeridos}
            entidadesSugeridas={datos.entidadesSugeridas}
            accion={crearObligacion}
          />
        </div>
      )}

      {datos && (
        <>
          <h2 className="mt-10 text-lg font-medium text-stone-900 dark:text-stone-50">
            {datos.obligaciones.length === 0
              ? "Todavía no hay obligaciones registradas."
              : `${datos.obligaciones.length} obligación(es) registrada(s)`}
          </h2>

          {datos.obligaciones.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-xl border border-stone-200 shadow-sm dark:border-stone-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900">
                  <tr>
                    <th className="px-4 py-3 font-medium">Obligación</th>
                    <th className="px-4 py-3 font-medium">Vence</th>
                    <th className="px-4 py-3 font-medium text-right">Monto</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {datos.obligaciones.map((o) => (
                    <tr key={o.id} className="bg-white transition-colors hover:bg-stone-50 dark:bg-stone-950 dark:hover:bg-stone-900/60">
                      <td className="px-4 py-3">
                        <span className="font-medium text-stone-900 dark:text-stone-50">
                          {o.tipo}
                        </span>
                        <span className="block text-xs text-stone-400">
                          {[datos.nombreEdificio.get(o.edificio_id), o.entidad_reguladora]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                        {o.fecha_vencimiento ?? "—"}
                        {o.periodicidad && (
                          <span className="block text-xs text-stone-400">{o.periodicidad}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-stone-900 dark:text-stone-50">
                        {o.monto != null ? formatoCOP.format(o.monto) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={chipEstado(o.estado)}>{o.estado}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/obligaciones/${o.id}`}
                          className="text-xs font-medium text-stone-600 underline hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
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
