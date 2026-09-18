import Link from "next/link";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { UnidadForm } from "./UnidadForm";
import { crearUnidad } from "./actions";
import { calcularMesContrato } from "../dashboard-calc";
import { UnidadesLista } from "./UnidadesLista";

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

export default async function UnidadesPage() {
  const datos = supabaseConfigured ? await getDatos() : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        Unidades
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        {datos ? `${datos.unidades.length} unidades registradas en total.` : ""}
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

      {datos && datos.edificios.length > 0 && (
        <UnidadesLista edificios={datos.edificios} unidades={datos.unidades} />
      )}
    </main>
  );
}
