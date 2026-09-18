import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { ProveedorForm } from "./ProveedorForm";
import { crearProveedor } from "./actions";
import { ProveedoresLista } from "./ProveedoresLista";

export const dynamic = "force-dynamic";

type CategoriaRow = {
  id: string;
  categoria: string;
  subcategoria: string;
  orden: number;
};

type UnidadRow = { id: string; codigo: string };
type EdificioRow = { id: string; nombre: string };

type ProveedorRow = {
  id: string;
  nombre: string;
  contacto_nombre: string | null;
  telefono: string | null;
  edificio_id: string | null;
  categorias_proveedor: { categoria: string; subcategoria: string } | null;
  unidades: { codigo: string } | null;
};

async function getDatos() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [{ data: categorias, error: errorCategorias }, { data: edificios, error: errorEdificios }, { data: unidades, error: errorUnidades }, { data: proveedores, error: errorProveedores }] =
    await Promise.all([
      supabase.from("categorias_proveedor").select("id, categoria, subcategoria, orden").order("orden"),
      supabase.from("edificios").select("id, nombre").order("nombre"),
      supabase.from("unidades").select("id, codigo, edificio_id").order("codigo"),
      supabase
        .from("proveedores")
        .select(
          "id, nombre, contacto_nombre, telefono, edificio_id, categorias_proveedor(categoria, subcategoria), unidades(codigo)"
        )
        .order("nombre"),
    ]);

  if (errorCategorias || errorEdificios || errorUnidades || errorProveedores) return null;

  const grupos = agruparCategorias((categorias as CategoriaRow[]) ?? []);

  // Proveedores solo aplica a Blanco y Negro: las propiedades de arriendo
  // directo (Kostamar, Ufinet, Art Living, Estadio) no llevan proveedores
  // propios en la app, así que ni siquiera se ofrecen como opción aquí.
  const edificiosConUnidades = ((edificios as EdificioRow[]) ?? [])
    .filter((e) => e.nombre === "Blanco y Negro")
    .map((e) => ({
      id: e.id,
      nombre: e.nombre,
      unidades: ((unidades as (UnidadRow & { edificio_id: string })[]) ?? [])
        .filter((u) => u.edificio_id === e.id)
        .map((u) => ({ id: u.id, codigo: u.codigo })),
    }));

  return {
    grupos,
    edificios: edificiosConUnidades,
    proveedores: (proveedores as unknown as ProveedorRow[]) ?? [],
  };
}

function agruparCategorias(categorias: CategoriaRow[]) {
  const mapa = new Map<string, { id: string; subcategoria: string }[]>();
  for (const c of categorias) {
    if (!mapa.has(c.categoria)) mapa.set(c.categoria, []);
    mapa.get(c.categoria)!.push({ id: c.id, subcategoria: c.subcategoria });
  }
  return Array.from(mapa.entries()).map(([categoria, opciones]) => ({ categoria, opciones }));
}

export default async function ProveedoresPage() {
  const datos = supabaseConfigured ? await getDatos() : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        Proveedores
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        Registra aquí los proveedores del edificio: plomería, servicios públicos, seguridad,
        impuestos y demás.
      </p>

      {!datos && (
        <div className="mt-8 rounded-xl border border-red-300 bg-red-50 p-5 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
          No se pudo leer la información de proveedores desde Supabase.
        </div>
      )}

      {datos && (
        <>
          <div className="mt-8">
            <ProveedorForm grupos={datos.grupos} edificios={datos.edificios} accion={crearProveedor} />
          </div>

          {datos.edificios.length > 0 && (
            <ProveedoresLista edificios={datos.edificios} proveedores={datos.proveedores} />
          )}
        </>
      )}
    </main>
  );
}
