import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { MovimientoForm } from "./MovimientoForm";
import { crearMovimiento } from "./actions";
import { FilaMovimiento } from "./FilaMovimiento";
import { SelectorPropiedadEnlace } from "@/components/SelectorPropiedad";

export const dynamic = "force-dynamic";

type CategoriaRow = { id: string; nombre: string; tipo: string };
type EdificioRow = { id: string; nombre: string };
type UnidadRow = { id: string; codigo: string; edificio_id: string };

export type MovimientoRow = {
  id: string;
  edificio_id: string;
  unidad_id: string | null;
  fecha: string;
  tipo: string;
  categoria_id: string | null;
  concepto: string | null;
  comprobante: string | null;
  monto: number;
  saldo_caja: number;
};

const CANTIDAD_A_MOSTRAR = 60;

async function getDatos(propiedadIdPedida?: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const [
    { data: categorias, error: errorCategorias },
    { data: edificios, error: errorEdificios },
    { data: unidades, error: errorUnidades },
  ] = await Promise.all([
    supabase.from("categorias_movimiento").select("id, nombre, tipo").order("nombre"),
    supabase.from("edificios").select("id, nombre").order("nombre"),
    supabase.from("unidades").select("id, codigo, edificio_id").order("codigo"),
  ]);

  if (errorCategorias || errorEdificios || errorUnidades) return null;

  const edificiosRow = (edificios as EdificioRow[]) ?? [];
  // La propiedad pedida por la URL (?propiedad=) manda; si no viene, o ya no
  // existe, se cae a la primera propiedad en orden alfabético. Nunca se
  // mezclan movimientos de varias propiedades en esta lista — eso es a
  // propósito, para que una propiedad con muchos movimientos recientes
  // (p. ej. Blanco y Negro) no le "gane" el cupo de los últimos 60 a las
  // demás.
  const propiedadId =
    (propiedadIdPedida && edificiosRow.some((e) => e.id === propiedadIdPedida)
      ? propiedadIdPedida
      : edificiosRow[0]?.id) ?? null;

  const [{ count: totalMovimientos }, { data: movimientos, error: errorMovimientos }] =
    await Promise.all([
      propiedadId
        ? supabase
            .from("movimientos")
            .select("*", { count: "exact", head: true })
            .eq("edificio_id", propiedadId)
        : Promise.resolve({ count: 0 }),
      propiedadId
        ? supabase
            .from("v_movimientos_con_saldo")
            .select("*")
            .eq("edificio_id", propiedadId)
            .order("fecha", { ascending: false })
            .order("id", { ascending: false })
            .limit(CANTIDAD_A_MOSTRAR)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (errorMovimientos) return null;

  const edificiosConUnidades = edificiosRow.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    unidades: ((unidades as UnidadRow[]) ?? [])
      .filter((u) => u.edificio_id === e.id)
      .map((u) => ({ id: u.id, codigo: u.codigo })),
  }));

  const nombreUnidad = new Map(((unidades as UnidadRow[]) ?? []).map((u) => [u.id, u.codigo]));
  const nombreCategoria = new Map(
    ((categorias as CategoriaRow[]) ?? []).map((c) => [c.id, c.nombre])
  );

  return {
    categorias: (categorias as CategoriaRow[]) ?? [],
    edificios: edificiosConUnidades,
    propiedadId,
    totalMovimientos: totalMovimientos ?? 0,
    movimientos: (movimientos as MovimientoRow[]) ?? [],
    nombreUnidad,
    nombreCategoria,
  };
}

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ propiedad?: string }>;
}) {
  const { propiedad } = await searchParams;
  const datos = supabaseConfigured ? await getDatos(propiedad) : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        Movimientos
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        El libro de caja: cada ingreso y egreso, con el saldo acumulado. Cada propiedad tiene su
        propio libro — cámbiala arriba.
      </p>

      {!datos && (
        <div className="mt-8 rounded-xl border border-red-300 bg-red-50 p-5 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
          No se pudo leer la información de movimientos desde Supabase.
        </div>
      )}

      {datos && datos.edificios.length === 0 && (
        <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          Primero necesitas al menos un edificio registrado en Supabase para poder agregar
          movimientos.
        </div>
      )}

      {datos && datos.edificios.length > 1 && (
        <div className="mt-6">
          <SelectorPropiedadEnlace
            edificios={datos.edificios}
            seleccionId={datos.propiedadId ?? ""}
            hrefPara={(id) => `/movimientos?propiedad=${id}`}
          />
        </div>
      )}

      {datos && datos.edificios.length > 0 && (
        <div className="mt-8">
          <MovimientoForm
            categorias={datos.categorias}
            edificios={datos.edificios}
            valoresIniciales={datos.propiedadId ? { edificio_id: datos.propiedadId } : undefined}
            accion={crearMovimiento}
          />
        </div>
      )}

      {datos && (
        <>
          <h2 className="mt-10 text-lg font-medium text-stone-900 dark:text-stone-50">
            {datos.totalMovimientos === 0
              ? "Todavía no hay movimientos registrados en esta propiedad."
              : `${datos.totalMovimientos} movimiento(s) en esta propiedad`}
          </h2>
          {datos.movimientos.length > 0 && datos.totalMovimientos > datos.movimientos.length && (
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Mostrando los {datos.movimientos.length} más recientes de esta propiedad.
            </p>
          )}

          {datos.movimientos.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 shadow-sm dark:border-stone-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Concepto</th>
                    <th className="px-4 py-3 font-medium text-right">Monto</th>
                    <th className="px-4 py-3 font-medium text-right">Saldo</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {datos.movimientos.map((m) => (
                    <FilaMovimiento
                      key={m.id}
                      movimiento={m}
                      edificio={null}
                      unidad={m.unidad_id ? datos.nombreUnidad.get(m.unidad_id) ?? null : null}
                      categoria={
                        m.categoria_id ? datos.nombreCategoria.get(m.categoria_id) ?? null : null
                      }
                    />
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
