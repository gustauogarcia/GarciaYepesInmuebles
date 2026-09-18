import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { InquilinoForm } from "./InquilinoForm";
import { crearInquilino } from "./actions";
import { InquilinosLista } from "./InquilinosLista";

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
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        Inquilinos
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        Contratos de arrendamiento por apartamento, con su codeudor y vigencia.
      </p>

      {!datos && (
        <div className="mt-8 rounded-xl border border-red-300 bg-red-50 p-5 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
          No se pudo leer la información de inquilinos desde Supabase.
        </div>
      )}

      {datos && datos.edificios.length === 0 && (
        <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          Primero necesitas al menos un edificio con unidades registradas en Supabase.
        </div>
      )}

      {datos && datos.edificios.length > 0 && (
        <div className="mt-8">
          <InquilinoForm edificios={datos.edificios} accion={crearInquilino} />
        </div>
      )}

      {datos && datos.edificios.length > 0 && (
        <InquilinosLista
          edificios={datos.edificios}
          inquilinos={datos.inquilinos}
          unidadPorId={datos.unidadPorId}
        />
      )}
    </main>
  );
}
