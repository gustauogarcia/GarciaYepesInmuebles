import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { AgregarItemForm } from "./AgregarItemForm";
import { agregarItem, alternarItemPorTipo, eliminarItem } from "./actions";
import { TIPOS_DOTACION } from "./tipos";
import { DotacionTabla } from "./DotacionTabla";

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

  const itemsPorUnidad = new Map<string, Record<string, ItemRow>>();
  const extrasPorUnidad = new Map<string, ItemRow[]>();
  const tiposConocidos = new Set<string>(TIPOS_DOTACION);
  for (const it of itemsRow) {
    if (tiposConocidos.has(it.item)) {
      const mapa = itemsPorUnidad.get(it.unidad_id) ?? {};
      mapa[it.item] = it;
      itemsPorUnidad.set(it.unidad_id, mapa);
    } else {
      const lista = extrasPorUnidad.get(it.unidad_id) ?? [];
      lista.push(it);
      extrasPorUnidad.set(it.unidad_id, lista);
    }
  }

  const filas = unidadesRow.map((u) => ({
    id: u.id,
    edificio_id: u.edificio_id,
    codigo: u.codigo,
    itemsPorTipo: itemsPorUnidad.get(u.id) ?? {},
    extras: extrasPorUnidad.get(u.id) ?? [],
  }));

  return { edificios: edificiosRow, edificiosParaForm, filas };
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

      {datos && datos.edificios.length > 0 && (
        <DotacionTabla
          edificios={datos.edificios}
          filas={datos.filas}
          alternarItemPorTipo={alternarItemPorTipo}
          eliminarItem={eliminarItem}
        />
      )}

      {datos && datos.edificiosParaForm.length > 0 && (
        <div className="mt-8">
          <AgregarItemForm edificios={datos.edificiosParaForm} accion={agregarItem} />
        </div>
      )}
    </main>
  );
}
