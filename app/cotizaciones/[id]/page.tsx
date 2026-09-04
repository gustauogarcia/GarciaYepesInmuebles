import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { CotizacionForm } from "../CotizacionForm";
import { editarCotizacion, eliminarCotizacion } from "../actions";

export const dynamic = "force-dynamic";

type ProveedorRow = { id: string; nombre: string };
type EdificioRow = { id: string; nombre: string };
type UnidadRow = { id: string; codigo: string; edificio_id: string };

export default async function EditarCotizacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  if (!supabaseConfigured || !supabase) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          La base de datos no está conectada.
        </div>
      </main>
    );
  }

  const [{ data: cotizacion }, { data: proveedores }, { data: edificios }, { data: unidades }] =
    await Promise.all([
      supabase.from("cotizaciones").select("*").eq("id", id).maybeSingle(),
      supabase.from("proveedores").select("id, nombre").order("nombre"),
      supabase.from("edificios").select("id, nombre").order("nombre"),
      supabase.from("unidades").select("id, codigo, edificio_id").order("codigo"),
    ]);

  if (!cotizacion) notFound();

  const edificiosConUnidades = ((edificios as EdificioRow[]) ?? []).map((e) => ({
    id: e.id,
    nombre: e.nombre,
    unidades: ((unidades as UnidadRow[]) ?? [])
      .filter((u) => u.edificio_id === e.id)
      .map((u) => ({ id: u.id, codigo: u.codigo })),
  }));

  const accionEditar = editarCotizacion.bind(null, id);
  const accionEliminar = eliminarCotizacion.bind(null, id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/cotizaciones"
        className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50"
      >
        ← Volver a cotizaciones
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Editar cotización
      </h1>

      <div className="mt-8">
        <CotizacionForm
          proveedores={(proveedores as ProveedorRow[]) ?? []}
          edificios={edificiosConUnidades}
          valoresIniciales={cotizacion}
          accion={accionEditar}
          textoBoton="Guardar cambios"
        />
      </div>

      <form action={accionEliminar} className="mt-6">
        <button
          type="submit"
          className="text-sm text-red-700 underline hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
        >
          Eliminar esta cotización
        </button>
      </form>
    </main>
  );
}
