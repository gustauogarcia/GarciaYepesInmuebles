import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { ProveedorForm } from "../ProveedorForm";
import { editarProveedor, eliminarProveedor } from "../actions";

export const dynamic = "force-dynamic";

type CategoriaRow = { id: string; categoria: string; subcategoria: string; orden: number };
type UnidadRow = { id: string; codigo: string; edificio_id: string };
type EdificioRow = { id: string; nombre: string };

export default async function EditarProveedorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  if (!supabaseConfigured || !supabase) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          La base de datos no está conectada.
        </div>
      </main>
    );
  }

  const [{ data: proveedor }, { data: categorias }, { data: edificios }, { data: unidades }] =
    await Promise.all([
      supabase.from("proveedores").select("*").eq("id", id).maybeSingle(),
      supabase.from("categorias_proveedor").select("id, categoria, subcategoria, orden").order("orden"),
      supabase.from("edificios").select("id, nombre").order("nombre"),
      supabase.from("unidades").select("id, codigo, edificio_id").order("codigo"),
    ]);

  if (!proveedor) notFound();

  const grupos = agruparCategorias((categorias as CategoriaRow[]) ?? []);
  const edificiosConUnidades = ((edificios as EdificioRow[]) ?? []).map((e) => ({
    id: e.id,
    nombre: e.nombre,
    unidades: ((unidades as UnidadRow[]) ?? [])
      .filter((u) => u.edificio_id === e.id)
      .map((u) => ({ id: u.id, codigo: u.codigo })),
  }));

  const accionEditar = editarProveedor.bind(null, id);
  const accionEliminar = eliminarProveedor.bind(null, id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/proveedores" className="text-sm text-stone-500 underline hover:text-stone-900 dark:hover:text-stone-50">
        ← Volver a proveedores
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        Editar proveedor
      </h1>

      <div className="mt-8">
        <ProveedorForm
          grupos={grupos}
          edificios={edificiosConUnidades}
          valoresIniciales={proveedor}
          accion={accionEditar}
          textoBoton="Guardar cambios"
        />
      </div>

      <form action={accionEliminar} className="mt-6">
        <button
          type="submit"
          className="text-sm text-red-700 underline hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
        >
          Eliminar este proveedor
        </button>
      </form>
    </main>
  );
}

function agruparCategorias(categorias: CategoriaRow[]) {
  const mapa = new Map<string, { id: string; subcategoria: string }[]>();
  for (const c of categorias) {
    if (!mapa.has(c.categoria)) mapa.set(c.categoria, []);
    mapa.get(c.categoria)!.push({ id: c.id, subcategoria: c.subcategoria });
  }
  return Array.from(mapa.entries()).map(([categoria, opciones]) => ({ categoria, opciones }));
}
