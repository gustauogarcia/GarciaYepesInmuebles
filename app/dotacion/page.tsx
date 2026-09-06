import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { AgregarItemForm } from "./AgregarItemForm";
import { agregarItem, alternarDisponible, eliminarItem } from "./actions";

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

  const itemsPorUnidad = new Map<string, ItemRow[]>();
  for (const it of itemsRow) {
    const lista = itemsPorUnidad.get(it.unidad_id) ?? [];
    lista.push(it);
    itemsPorUnidad.set(it.unidad_id, lista);
  }

  const estructura = edificiosRow.map((e) => ({
    ...e,
    unidades: unidadesRow
      .filter((u) => u.edificio_id === e.id)
      .map((u) => ({ ...u, items: itemsPorUnidad.get(u.id) ?? [] })),
  }));

  return { edificiosParaForm, estructura, totalItems: itemsRow.length };
}

function Pill({ item }: { item: ItemRow }) {
  const accionToggle = alternarDisponible.bind(null, item.id, !item.disponible);
  const accionBorrar = eliminarItem.bind(null, item.id);
  return (
    <div
      className={
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium " +
        (item.disponible
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
          : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500")
      }
    >
      <form action={accionToggle}>
        <button type="submit" className="hover:underline">
          {item.disponible ? "✓" : "—"} {item.item}
        </button>
      </form>
      <form action={accionBorrar}>
        <button
          type="submit"
          title="Quitar ítem"
          className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
        >
          ×
        </button>
      </form>
    </div>
  );
}

export default async function DotacionPage() {
  const datos = supabaseConfigured ? await getDatos() : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Dotación
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Inventario y mejoras por apartamento (gas, cocina, baños, closets…). Haz clic en un ítem
        para marcarlo disponible/no disponible.
      </p>

      {!datos && (
        <div className="mt-8 rounded-lg border border-red-300 bg-red-50 p-5 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
          No se pudo leer la dotación desde Supabase.
        </div>
      )}

      {datos && datos.edificiosParaForm.length === 0 && (
        <div className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          Primero registra una propiedad con unidades antes de agregar dotación.
        </div>
      )}

      {datos && datos.edificiosParaForm.length > 0 && (
        <div className="mt-8">
          <AgregarItemForm edificios={datos.edificiosParaForm} accion={agregarItem} />
        </div>
      )}

      {datos && (
        <div className="mt-10 space-y-8">
          {datos.estructura.map((edificio) => (
            <div key={edificio.id}>
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                {edificio.nombre}
              </h2>
              <div className="mt-3 space-y-4">
                {edificio.unidades
                  .filter((u) => u.items.length > 0)
                  .map((u) => (
                    <div key={u.id}>
                      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        {u.codigo}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {u.items.map((it) => (
                          <Pill key={it.id} item={it} />
                        ))}
                      </div>
                    </div>
                  ))}
                {edificio.unidades.every((u) => u.items.length === 0) && (
                  <p className="text-sm text-zinc-400">Sin dotación registrada todavía.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
