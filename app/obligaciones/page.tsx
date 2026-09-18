import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { ObligacionForm } from "./ObligacionForm";
import { crearObligacion } from "./actions";
import { ObligacionesLista } from "./ObligacionesLista";

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
  };
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

      {datos && datos.edificios.length > 0 && (
        <ObligacionesLista edificios={datos.edificios} obligaciones={datos.obligaciones} />
      )}
    </main>
  );
}
