import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { AgregarItemForm } from "./AgregarItemForm";
import { agregarItem, alternarItemPorTipo, eliminarItem } from "./actions";
import { TIPOS_DOTACION } from "./tipos";

export const dynamic = "force-dynamic";

type EdificioRow = { id: string; nombre: string };
type UnidadRow = { id: string; edificio_id: string; codigo: string };
type ItemRow = { id: string; unidad_id: string; item: string; disponible: boolean };

async function getDatos() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [
    { data: edificios, error: errorEdificios },
    { data: unidades, error: errorUnidades },
    { data: items, error: errorItems },
  ] = await Promise.all([
    supabase.from("edificios").select("id, nombre").order("nombre"),
    supabase.from("unidades").select("id, edificio_id, codigo").order("codigo"),
    supabase.from("dotacion_unidad").select("id, unidad_id, item, disponible").order("item"),
  ]);

  if (errorEdificios || errorUnidades || errorItems) return null;

  const edificiosRow = (edificios as EdificioRow[]) ?? [];
  const unidadesRow = (unidades as UnidadRow[]) ?? [];
  const itemsRow = (items as ItemRow[]) ?? [];

  const edificiosParaForm = edificiosRow.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    unidades: unidadesRow
      .filter((u) => u.edificio_id === e.id)
      .map((u) => ({ id: u.id, codigo: u.codigo })),
  }));

  const nombreEdificio = new Map(edificiosRow.map((e) => [e.id, e.nombre]));

  const itemsPorUnidad = new Map<string, Map<string, ItemRow>>();
  const extrasPorUnidad = new Map<string, ItemRow[]>();
  const tiposConocidos = new Set<string>(TIPOS_DOTACION);
  for (const it of itemsRow) {
    if (tiposConocidos.has(it.item)) {
      const mapa = itemsPorUnidad.get(it.unidad_id) ?? new Map<string, ItemRow>();
      mapa.set(it.item, it);
      itemsPorUnidad.set(it.unidad_id, mapa);
    } else {
      const lista = extrasPorUnidad.get(it.unidad_id) ?? [];
      lista.push(it);
      extrasPorUnidad.set(it.unidad_id, lista);
    }
  }

  const filas = unidadesRow.map((u) => ({
    ...u,
    propiedad: nombreEdificio.get(u.edificio_id) ?? "",
    itemsPorTipo: itemsPorUnidad.get(u.id) ?? new Map<string, ItemRow>(),
    extras: extrasPorUnidad.get(u.id) ?? [],
  }));

  return { edificiosParaForm, filas, multiPropiedad: edificiosRow.length > 1 };
}

function CeldaItem({ unidadId, tipo, item }: { unidadId: string; tipo: string; item?: ItemRow }) {
  const accion = alternarItemPorTipo.bind(null, unidadId, tipo);
  const disponible = item?.disponible ?? false;
  const registrado = item != null;
  return (
    <form action={accion}>
      <button
        type="submit"
        title={registrado ? tipo : `Marcar "${tipo}" como disponible`}
        className={
          "flex h-7 w-7 items-center justify-center rounded-md text-sm font-medium transition-colors " +
          (disponible
            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
            : registrado
              ? "bg-stone-100 text-stone-400 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-600 dark:hover:bg-stone-800"
              : "text-stone-300 hover:bg-stone-100 hover:text-stone-500 dark:text-stone-700 dark:hover:bg-stone-900 dark:hover:text-stone-400")
        }
      >
        {disponible ? "✓" : registrado ? "—" : "+"}
      </button>
    </form>
  );
}

export default async function DotacionPage() {
  const datos = supabaseConfigured ? await getDatos() : null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        Dotación
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        Inventario y mejoras por apartamento. Haz clic en una celda para marcarla disponible ( ✓ ),
        no disponible ( — ) o para registrarla por primera vez ( + ).
      </p>

      {!datos && (
        <div className="mt-8 rounded-xl border border-red-300 bg-red-50 p-5 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
          No se pudo leer la dotación desde Supabase.
        </div>
      )}

      {datos && datos.edificiosParaForm.length === 0 && (
        <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          Primero registra una propiedad con unidades antes de agregar dotación.
        </div>
      )}

      {datos && datos.filas.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-stone-200 shadow-sm dark:border-stone-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Unidad</th>
                {datos.multiPropiedad && (
                  <th className="whitespace-nowrap px-4 py-3 font-medium">Propiedad</th>
                )}
                {TIPOS_DOTACION.map((t) => (
                  <th key={t} className="px-2 py-3 text-center font-medium">
                    <span className="block max-w-[5rem] mx-auto leading-tight">{t}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {datos.filas.map((u) => (
                <tr
                  key={u.id}
                  className="bg-white transition-colors hover:bg-stone-50 dark:bg-stone-950 dark:hover:bg-stone-900/60"
                >
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-stone-900 dark:text-stone-50">
                    {u.codigo}
                  </td>
                  {datos.multiPropiedad && (
                    <td className="whitespace-nowrap px-4 py-2 text-stone-600 dark:text-stone-400">
                      {u.propiedad}
                    </td>
                  )}
                  {TIPOS_DOTACION.map((t) => (
                    <td key={t} className="px-2 py-2 text-center">
                      <CeldaItem unidadId={u.id} tipo={t} item={u.itemsPorTipo.get(t)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {datos && datos.filas.some((u) => u.extras.length > 0) && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Otros ítems (fuera de la lista estándar)
          </h2>
          <div className="mt-2 space-y-2">
            {datos.filas
              .filter((u) => u.extras.length > 0)
              .map((u) => (
                <div key={u.id} className="flex flex-wrap items-center gap-1.5 text-sm">
                  <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    {u.codigo}
                  </span>
                  {u.extras.map((it) => {
                    const accionBorrar = eliminarItem.bind(null, it.id);
                    return (
                      <span
                        key={it.id}
                        className={
                          "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium " +
                          (it.disponible
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                            : "border-stone-200 bg-stone-50 text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-500")
                        }
                      >
                        {it.disponible ? "✓" : "—"} {it.item}
                        <form action={accionBorrar}>
                          <button
                            type="submit"
                            title="Quitar ítem"
                            className="text-stone-400 hover:text-red-600 dark:hover:text-red-400"
                          >
                            ×
                          </button>
                        </form>
                      </span>
                    );
                  })}
                </div>
              ))}
          </div>
        </div>
      )}

      {datos && datos.edificiosParaForm.length > 0 && (
        <div className="mt-8">
          <AgregarItemForm edificios={datos.edificiosParaForm} accion={agregarItem} />
        </div>
      )}
    </main>
  );
}
