import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { calcularMetricas, type MetricasPropiedad } from "./dashboard-calc";
import { DashboardView } from "./DashboardView";

export const dynamic = "force-dynamic"; // siempre consulta datos frescos, no cachea

type EdificioRow = { id: string; nombre: string };
type UnidadRow = {
  id: string;
  edificio_id: string;
  estado: string;
  renta_vigente: number;
  codigo: string;
};
type InquilinoRow = {
  unidad_id: string;
  nombre_arrendatario: string;
  fecha_inicio_contrato: string | null;
  contrato_activo: boolean;
};
type MovimientoRow = {
  edificio_id: string;
  unidad_id: string | null;
  fecha: string;
  tipo: string;
  categoria_id: string | null;
  monto: number;
};
type ObligacionRow = {
  edificio_id: string;
  tipo: string;
  entidad_reguladora: string | null;
  fecha_vencimiento: string | null;
  estado: string;
  monto: number | null;
};
type CategoriaRow = { id: string; nombre: string; tipo: string };

async function getDatos() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [
    { data: edificios, error: errorEdificios },
    { data: unidades, error: errorUnidades },
    { data: movimientos, error: errorMovimientos },
    { data: obligaciones, error: errorObligaciones },
    { data: categorias, error: errorCategorias },
    { data: inquilinos, error: errorInquilinos },
  ] = await Promise.all([
    supabase.from("edificios").select("id, nombre").order("nombre"),
    supabase.from("unidades").select("id, edificio_id, estado, renta_vigente, codigo"),
    supabase.from("movimientos").select("edificio_id, unidad_id, fecha, tipo, categoria_id, monto"),
    supabase
      .from("obligaciones_regulatorias")
      .select("edificio_id, tipo, entidad_reguladora, fecha_vencimiento, estado, monto"),
    supabase.from("categorias_movimiento").select("id, nombre, tipo"),
    supabase
      .from("inquilinos")
      .select("unidad_id, nombre_arrendatario, fecha_inicio_contrato, contrato_activo")
      .eq("contrato_activo", true),
  ]);

  if (
    errorEdificios ||
    errorUnidades ||
    errorMovimientos ||
    errorObligaciones ||
    errorCategorias ||
    errorInquilinos
  ) {
    return null;
  }

  const edificiosData = (edificios as EdificioRow[]) ?? [];
  const nombreEdificioPorId = new Map(edificiosData.map((e) => [e.id, e.nombre]));

  const params = {
    hoy: new Date(),
    movimientos: (movimientos as MovimientoRow[]) ?? [],
    unidades: (unidades as UnidadRow[]) ?? [],
    obligaciones: (obligaciones as ObligacionRow[]) ?? [],
    categorias: (categorias as CategoriaRow[]) ?? [],
    inquilinos: (inquilinos as InquilinoRow[]) ?? [],
    nombreEdificioPorId,
  };

  const metricas: Record<string, MetricasPropiedad> = {
    todas: calcularMetricas({ ...params, edificioId: null, nombre: "Todas las propiedades" }),
  };
  for (const e of edificiosData) {
    metricas[e.id] = calcularMetricas({ ...params, edificioId: e.id, nombre: e.nombre });
  }

  return {
    propiedades: edificiosData.map((e) => ({ id: e.id, nombre: e.nombre })),
    metricas,
  };
}

export default async function Home() {
  const datos = supabaseConfigured ? await getDatos() : null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Ocupación, ingresos y egresos, y alertas — por propiedad o consolidado.
      </p>

      {!supabaseConfigured && (
        <div className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <p className="font-medium">Falta conectar la base de datos.</p>
          <p className="mt-1 text-sm">
            Configura las variables <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (ver{" "}
            <code className="font-mono">.env.local.example</code>) y vuelve a cargar la página.
          </p>
        </div>
      )}

      {supabaseConfigured && !datos && (
        <div className="mt-8 rounded-lg border border-red-300 bg-red-50 p-5 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
          No se pudo leer la base de datos. Revisa que la URL y la llave de Supabase sean
          correctas.
        </div>
      )}

      {datos && datos.propiedades.length === 0 && (
        <div className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          Todavía no tienes ninguna propiedad registrada. Agrega la primera en Propiedades.
        </div>
      )}

      {datos && datos.propiedades.length > 0 && (
        <div className="mt-8">
          <DashboardView propiedades={datos.propiedades} metricas={datos.metricas} />
        </div>
      )}
    </main>
  );
}
