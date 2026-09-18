import Link from "next/link";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { CotizacionForm } from "./CotizacionForm";
import { crearCotizacion } from "./actions";
import { CotizacionesLista } from "./CotizacionesLista";

export const dynamic = "force-dynamic";

type ProveedorRow = { id: string; nombre: string };
type EdificioRow = { id: string; nombre: string };
type UnidadRow = { id: string; codigo: string; edificio_id: string };

type CotizacionRow = {
  id: string;
  fecha: string;
  descripcion: string;
  monto: number;
  estado: string;
  edificio_id: string | null;
  proveedores: { nombre: string } | null;
  edificios: { nombre: string } | null;
  unidades: { codigo: string } | null;
};

async function getDatos() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [
    { data: proveedores, error: errorProveedores },
    { data: edificios, error: errorEdificios },
    { data: unidades, error: errorUnidades },
    { data: cotizaciones, error: errorCotizaciones },
  ] = await Promise.all([
    supabase.from("proveedores").select("id, nombre").order("nombre"),
    supabase.from("edificios").select("id, nombre").order("nombre"),
    supabase.from("unidades").select("id, codigo, edificio_id").order("codigo"),
    supabase
      .from("cotizaciones")
      .select(
        "id, fecha, descripcion, monto, estado, edificio_id, proveedores(nombre), edificios(nombre), unidades(codigo)"
      )
      .order("fecha", { ascending: false }),
  ]);

  if (errorProveedores || errorEdificios || errorUnidades || errorCotizaciones) return null;

  // Cotizaciones solo aplica a Blanco y Negro, igual que Proveedores.
  const edificiosConUnidades = ((edificios as EdificioRow[]) ?? [])
    .filter((e) => e.nombre === "Blanco y Negro")
    .map((e) => ({
      id: e.id,
      nombre: e.nombre,
      unidades: ((unidades as UnidadRow[]) ?? [])
        .filter((u) => u.edificio_id === e.id)
        .map((u) => ({ id: u.id, codigo: u.codigo })),
    }));

  return {
    proveedores: (proveedores as ProveedorRow[]) ?? [],
    edificios: edificiosConUnidades,
    cotizaciones: (cotizaciones as unknown as CotizacionRow[]) ?? [],
  };
}

export default async function CotizacionesPage() {
  const datos = supabaseConfigured ? await getDatos() : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        Cotizaciones
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        Registra las cotizaciones que te envían los proveedores y su estado (pendiente, aprobada
        o rechazada).
      </p>

      {!datos && (
        <div className="mt-8 rounded-xl border border-red-300 bg-red-50 p-5 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
          No se pudo leer la información de cotizaciones desde Supabase.
        </div>
      )}

      {datos && datos.proveedores.length === 0 && (
        <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          Primero registra al menos un{" "}
          <Link href="/proveedores" className="underline">
            proveedor
          </Link>{" "}
          para poder asociarle una cotización.
        </div>
      )}

      {datos && datos.proveedores.length > 0 && (
        <div className="mt-8">
          <CotizacionForm
            proveedores={datos.proveedores}
            edificios={datos.edificios}
            accion={crearCotizacion}
          />
        </div>
      )}

      {datos && datos.edificios.length > 0 && (
        <CotizacionesLista edificios={datos.edificios} cotizaciones={datos.cotizaciones} />
      )}
    </main>
  );
}
