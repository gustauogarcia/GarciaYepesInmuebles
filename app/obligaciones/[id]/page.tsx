import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { ObligacionForm } from "../ObligacionForm";
import { editarObligacion, eliminarObligacion } from "../actions";

export const dynamic = "force-dynamic";

type EdificioRow = { id: string; nombre: string };
type CategoriaRow = { subcategoria: string };
type ProveedorRow = { nombre: string };

export default async function EditarObligacionPage({
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

  const [{ data: obligacion }, { data: edificios }, { data: categorias }, { data: proveedores }] =
    await Promise.all([
      supabase.from("obligaciones_regulatorias").select("*").eq("id", id).maybeSingle(),
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
    ]);

  if (!obligacion) notFound();

  const accionEditar = editarObligacion.bind(null, id);
  const accionEliminar = eliminarObligacion.bind(null, id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/obligaciones"
        className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50"
      >
        ← Volver a impuestos y obligaciones
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Editar obligación
      </h1>

      <div className="mt-8">
        <ObligacionForm
          edificios={(edificios as EdificioRow[]) ?? []}
          tiposSugeridos={((categorias as CategoriaRow[]) ?? []).map((c) => c.subcategoria)}
          entidadesSugeridas={((proveedores as unknown as ProveedorRow[]) ?? []).map(
            (p) => p.nombre
          )}
          valoresIniciales={obligacion}
          accion={accionEditar}
          textoBoton="Guardar cambios"
        />
      </div>

      <form action={accionEliminar} className="mt-6">
        <button
          type="submit"
          className="text-sm text-red-700 underline hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
        >
          Eliminar esta obligación
        </button>
      </form>
    </main>
  );
}
