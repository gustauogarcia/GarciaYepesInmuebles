import { createClient, supabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Unidad = {
  id: string;
  codigo: string;
  torre: string | null;
  habitaciones: string | null;
  estado: string;
  renta_vigente: number;
};

type Inquilino = {
  unidad_id: string;
  nombre_arrendatario: string;
};

async function getUnidades() {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: unidades, error: errorUnidades } = await supabase
    .from("unidades")
    .select("id, codigo, torre, habitaciones, estado, renta_vigente")
    .order("codigo");

  if (errorUnidades || !unidades) return null;

  const { data: inquilinos } = await supabase
    .from("inquilinos")
    .select("unidad_id, nombre_arrendatario")
    .eq("contrato_activo", true);

  const inquilinoPorUnidad = new Map<string, string>(
    (inquilinos as Inquilino[] | null)?.map((i) => [i.unidad_id, i.nombre_arrendatario]) ?? []
  );

  return (unidades as Unidad[]).map((u) => ({
    ...u,
    inquilino: inquilinoPorUnidad.get(u.id) ?? null,
  }));
}

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default async function UnidadesPage() {
  const unidades = supabaseConfigured ? await getUnidades() : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Unidades
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {unidades ? `${unidades.length} unidades registradas.` : ""}
      </p>

      {!unidades && (
        <div className="mt-8 rounded-lg border border-red-300 bg-red-50 p-5 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
          No se pudo leer la lista de unidades desde Supabase.
        </div>
      )}

      {unidades && (
        <div className="mt-8 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 font-medium">Unidad</th>
                <th className="px-4 py-3 font-medium">Torre</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Inquilino</th>
                <th className="px-4 py-3 font-medium text-right">Renta vigente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {unidades.map((u) => (
                <tr key={u.id} className="bg-white dark:bg-black">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {u.codigo}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{u.torre ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-xs font-medium " +
                        (u.estado === "Ocupado"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400")
                      }
                    >
                      {u.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {u.inquilino ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-900 dark:text-zinc-50">
                    {formatoCOP.format(u.renta_vigente)}
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
