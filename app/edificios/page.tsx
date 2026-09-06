import Link from "next/link";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { EdificioForm } from "./EdificioForm";
import { crearEdificio } from "./actions";

export const dynamic = "force-dynamic";

type EdificioRow = {
  id: string;
  nombre: string;
  direccion: string | null;
  ciudad: string | null;
  pais: string;
  pct_administracion: number;
};

type UnidadRow = { edificio_id: string; estado: string; renta_vigente: number };

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

async function getDatos() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [{ data: edificios, error }, { data: unidades }] = await Promise.all([
    supabase
      .from("edificios")
      .select("id, nombre, direccion, ciudad, pais, pct_administracion")
      .order("nombre"),
    supabase.from("unidades").select("edificio_id, estado, renta_vigente"),
  ]);

  if (error) return null;

  const unidadesPorEdificio = new Map<string, number>();
  const rentaOcupadaPorEdificio = new Map<string, number>();
  for (const u of (unidades as UnidadRow[]) ?? []) {
    unidadesPorEdificio.set(u.edificio_id, (unidadesPorEdificio.get(u.edificio_id) ?? 0) + 1);
    if (u.estado === "Ocupado") {
      rentaOcupadaPorEdificio.set(
        u.edificio_id,
        (rentaOcupadaPorEdificio.get(u.edificio_id) ?? 0) + Number(u.renta_vigente || 0)
      );
    }
  }

  return { edificios: (edificios as EdificioRow[]) ?? [], unidadesPorEdificio, rentaOcupadaPorEdificio };
}

export default async function EdificiosPage() {
  const datos = supabaseConfigured ? await getDatos() : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        Propiedades
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        Cada inmueble que administras. Agrega uno nuevo aquí y luego crea sus apartamentos en{" "}
        <Link href="/unidades" className="underline">
          Unidades
        </Link>
        .
      </p>

      {!datos && (
        <div className="mt-8 rounded-xl border border-red-300 bg-red-50 p-5 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
          No se pudo leer la información de propiedades desde Supabase.
        </div>
      )}

      {datos && (
        <div className="mt-8">
          <EdificioForm accion={crearEdificio} />
        </div>
      )}

      {datos && (
        <>
          <h2 className="mt-10 text-lg font-medium text-stone-900 dark:text-stone-50">
            {datos.edificios.length} propiedad(es) registrada(s)
          </h2>

          <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 shadow-sm dark:border-stone-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900">
                <tr>
                  <th className="px-4 py-3 font-medium">Propiedad</th>
                  <th className="px-4 py-3 font-medium text-right">Unidades</th>
                  <th className="px-4 py-3 font-medium text-right">% Admin.</th>
                  <th className="px-4 py-3 font-medium text-right">Potencial admón. (mes)</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {datos.edificios.map((e) => (
                  <tr key={e.id} className="bg-white transition-colors hover:bg-stone-50 dark:bg-stone-950 dark:hover:bg-stone-900/60">
                    <td className="px-4 py-3">
                      <span className="font-medium text-stone-900 dark:text-stone-50">
                        {e.nombre}
                      </span>
                      <span className="block text-xs text-stone-400">
                        {[e.direccion, e.ciudad, e.pais].filter(Boolean).join(", ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-stone-600 dark:text-stone-400">
                      {datos.unidadesPorEdificio.get(e.id) ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-stone-600 dark:text-stone-400">
                      {(e.pct_administracion * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="tabular-nums font-medium text-stone-900 dark:text-stone-50">
                        {formatoCOP.format(
                          (datos.rentaOcupadaPorEdificio.get(e.id) ?? 0) * e.pct_administracion
                        )}
                      </span>
                      <span className="block text-xs text-stone-400">
                        sobre {formatoCOP.format(datos.rentaOcupadaPorEdificio.get(e.id) ?? 0)} de renta ocupada
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/edificios/${e.id}`}
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
        </>
      )}
    </main>
  );
}
