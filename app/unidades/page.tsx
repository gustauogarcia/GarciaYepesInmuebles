import Link from "next/link";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { UnidadForm } from "./UnidadForm";
import { crearUnidad } from "./actions";
import { calcularMesContrato } from "../dashboard-calc";

export const dynamic = "force-dynamic";

type EdificioRow = { id: string; nombre: string };

type Unidad = {
  id: string;
  edificio_id: string;
  codigo: string;
  torre: string | null;
  habitaciones: string | null;
  estado: string;
  renta_vigente: number;
};

type Inquilino = {
  unidad_id: string;
  nombre_arrendatario: string;
  fecha_inicio_contrato: string | null;
};

async function getDatos() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [
    { data: edificios, error: errorEdificios },
    { data: unidades, error: errorUnidades },
    { data: inquilinos },
  ] = await Promise.all([
    supabase.from("edificios").select("id, nombre").order("nombre"),
    supabase
      .from("unidades")
      .select("id, edificio_id, codigo, torre, habitaciones, estado, renta_vigente")
      .order("codigo"),
    supabase
      .from("inquilinos")
      .select("unidad_id, nombre_arrendatario, fecha_inicio_contrato")
      .eq("contrato_activo", true),
  ]);

  if (errorEdificios || errorUnidades) return null;

  const inquilinoPorUnidad = new Map<string, Inquilino>(
    (inquilinos as Inquilino[] | null)?.map((i) => [i.unidad_id, i]) ?? []
  );
  const nombreEdificio = new Map(((edificios as EdificioRow[]) ?? []).map((e) => [e.id, e.nombre]));

  const hoy = new Date();
  const conInquilino = ((unidades as Unidad[]) ?? []).map((u) => {
    const inquilino = inquilinoPorUnidad.get(u.id);
    const mesContrato =
      inquilino?.fecha_inicio_contrato != null
        ? calcularMesContrato(inquilino.fecha_inicio_contrato, hoy)
        : null;
    return {
      ...u,
      inquilino: inquilino?.nombre_arrendatario ?? null,
      mesContrato,
    };
  });

  return {
    edificios: (edificios as EdificioRow[]) ?? [],
    unidades: conInquilino,
    nombreEdificio,
  };
}

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default async function UnidadesPage() {
  const datos = supabaseConfigured ? await getDatos() : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        Unidades
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        {datos ? `${datos.unidades.length} unidades registradas.` : ""}
      </p>

      {!datos && (
        <div className="mt-8 rounded-xl border border-red-300 bg-red-50 p-5 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
          No se pudo leer la lista de unidades desde Supabase.
        </div>
      )}

      {datos && datos.edificios.length === 0 && (
        <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          Primero registra una{" "}
          <Link href="/edificios" className="underline">
            propiedad
          </Link>{" "}
          antes de agregar apartamentos.
        </div>
      )}

      {datos && datos.edificios.length > 0 && (
        <div className="mt-8">
          <UnidadForm edificios={datos.edificios} accion={crearUnidad} />
          <p className="mt-2 text-xs text-stone-400">
            El estado (Ocupado/Vacante) se actualiza solo cuando registras o terminas un contrato
            en{" "}
            <Link href="/inquilinos" className="underline">
              Inquilinos
            </Link>
            .
          </p>
        </div>
      )}

      {datos && datos.unidades.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-xl border border-stone-200 shadow-sm dark:border-stone-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900">
              <tr>
                <th className="px-4 py-3 font-medium">Unidad</th>
                {datos.edificios.length > 1 && (
                  <th className="px-4 py-3 font-medium">Propiedad</th>
                )}
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Inquilino</th>
                <th className="px-4 py-3 font-medium text-right">Renta vigente</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {datos.unidades.map((u) => (
                <tr key={u.id} className="bg-white transition-colors hover:bg-stone-50 dark:bg-stone-950 dark:hover:bg-stone-900/60">
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-50">
                    {u.codigo}
                    {u.torre && <span className="block text-xs text-stone-400">{u.torre}</span>}
                  </td>
                  {datos.edificios.length > 1 && (
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                      {datos.nombreEdificio.get(u.edificio_id) ?? "—"}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-xs font-medium " +
                        (u.estado === "Ocupado"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400")
                      }
                    >
                      {u.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                    {u.inquilino ?? "—"}
                    {u.mesContrato != null && (
                      u.mesContrato === 12 ? (
                        <span className="mt-1 block max-w-[14rem] rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                          Mes 12/12 — renovar y ajustar canon
                        </span>
                      ) : (
                        <span className="block text-xs text-stone-400">Mes {u.mesContrato}/12 del ciclo</span>
                      )
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-stone-900 dark:text-stone-50">
                    {formatoCOP.format(u.renta_vigente)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/unidades/${u.id}`}
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
    </main>
  );
}
