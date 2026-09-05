import Link from "next/link";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { InquilinoForm } from "./InquilinoForm";
import { crearInquilino } from "./actions";

export const dynamic = "force-dynamic";

type EdificioRow = { id: string; nombre: string };
type UnidadRow = { id: string; codigo: string; edificio_id: string };

type InquilinoRow = {
  id: string;
  unidad_id: string;
  nombre_arrendatario: string;
  telefono: string | null;
  email: string | null;
  nombre_codeudor: string | null;
  telefono_codeudor: string | null;
  fecha_inicio_contrato: string | null;
  contrato_activo: boolean;
  notas: string | null;
};

async function getDatos() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [
    { data: edificios, error: errorEdificios },
    { data: unidades, error: errorUnidades },
    { data: inquilinos, error: errorInquilinos },
  ] = await Promise.all([
    supabase.from("edificios").select("id, nombre").order("nombre"),
    supabase.from("unidades").select("id, codigo, edificio_id").order("codigo"),
    supabase
      .from("inquilinos")
      .select("*")
      .order("contrato_activo", { ascending: false })
      .order("fecha_inicio_contrato", { ascending: false }),
  ]);

  if (errorEdificios || errorUnidades || errorInquilinos) return null;

  const edificiosConUnidades = ((edificios as EdificioRow[]) ?? []).map((e) => ({
    id: e.id,
    nombre: e.nombre,
    unidades: ((unidades as UnidadRow[]) ?? [])
      .filter((u) => u.edificio_id === e.id)
      .map((u) => ({ id: u.id, codigo: u.codigo })),
  }));

  const unidadPorId = new Map(((unidades as UnidadRow[]) ?? []).map((u) => [u.id, u]));
  const edificioPorId = new Map(((edificios as EdificioRow[]) ?? []).map((e) => [e.id, e.nombre]));

  return {
    edificios: edificiosConUnidades,
    inquilinos: (inquilinos as InquilinoRow[]) ?? [],
    unidadPorId,
    edificioPorId,
  };
}

export default async function InquilinosPage() {
  const datos = supabaseConfigured ? await getDatos() : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Inquilinos
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Contratos de arrendamiento por apartamento, con su codeudor y vigencia.
      </p>

      {!datos && (
        <div className="mt-8 rounded-lg border border-red-300 bg-red-50 p-5 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
          No se pudo leer la información de inquilinos desde Supabase.
        </div>
      )}

      {datos && datos.edificios.length === 0 && (
        <div className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          Primero necesitas al menos un edificio con unidades registradas en Supabase.
        </div>
      )}

      {datos && datos.edificios.length > 0 && (
        <div className="mt-8">
          <InquilinoForm edificios={datos.edificios} accion={crearInquilino} />
        </div>
      )}

      {datos && (
        <>
          <h2 className="mt-10 text-lg font-medium text-zinc-900 dark:text-zinc-50">
            {datos.inquilinos.length === 0
              ? "Todavía no hay inquilinos registrados."
              : `${datos.inquilinos.length} inquilino(s) registrado(s)`}
          </h2>

          {datos.inquilinos.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-100 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3 font-medium">Arrendatario</th>
                    <th className="px-4 py-3 font-medium">Apto</th>
                    <th className="px-4 py-3 font-medium">Contacto</th>
                    <th className="px-4 py-3 font-medium">Contrato</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {datos.inquilinos.map((i) => {
                    const unidad = datos.unidadPorId.get(i.unidad_id);
                    const edificio = unidad ? datos.edificioPorId.get(unidad.edificio_id) : null;
                    return (
                      <tr key={i.id} className="bg-white dark:bg-black">
                        <td className="px-4 py-3">
                          <span className="font-medium text-zinc-900 dark:text-zinc-50">
                            {i.nombre_arrendatario}
                          </span>
                          {i.nombre_codeudor && (
                            <span className="block text-xs text-zinc-400">
                              Codeudor: {i.nombre_codeudor}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          {unidad?.codigo ?? "—"}
                          {edificio && <span className="block text-xs text-zinc-400">{edificio}</span>}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          {i.telefono ?? i.email ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              "rounded-full px-2 py-0.5 text-xs font-medium " +
                              (i.contrato_activo
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400")
                            }
                          >
                            {i.contrato_activo ? "Activo" : "Terminado"}
                          </span>
                          {i.fecha_inicio_contrato && (
                            <span className="block text-xs text-zinc-400">
                              Desde {i.fecha_inicio_contrato}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/inquilinos/${i.id}`}
                            className="text-xs font-medium text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                          >
                            Editar
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
