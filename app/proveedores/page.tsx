import Link from "next/link";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { ProveedorForm } from "./ProveedorForm";
import { crearProveedor } from "./actions";

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
  categorias_proveedor: { categoria: string; subcategoria: string } | null;
  edificios: { nombre: string } | null;
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
          "id, nombre, contacto_nombre, telefono, categorias_proveedor(categoria, subcategoria), edificios(nombre), unidades(codigo)"
        )
        .order("nombre"),
    ]);

  if (errorCategorias || errorEdificios || errorUnidades || errorProveedores) return null;

  const grupos = agruparCategorias((categorias as CategoriaRow[]) ?? []);

  const edificiosConUnidades = ((edificios as EdificioRow[]) ?? []).map((e) => ({
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

          <h2 className="mt-10 text-lg font-medium text-stone-900 dark:text-stone-50">
            {datos.proveedores.length === 0
              ? "Todavía no hay proveedores registrados."
              : `${datos.proveedores.length} proveedor(es) registrado(s)`}
          </h2>

          {datos.proveedores.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 shadow-sm dark:border-stone-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nombre</th>
                    <th className="px-4 py-3 font-medium">Categoría</th>
                    <th className="px-4 py-3 font-medium">Edificio / apto</th>
                    <th className="px-4 py-3 font-medium">Contacto</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {datos.proveedores.map((p) => (
                    <tr key={p.id} className="bg-white transition-colors hover:bg-stone-50 dark:bg-stone-950 dark:hover:bg-stone-900/60">
                      <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-50">
                        {p.nombre}
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                        {p.categorias_proveedor?.subcategoria ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                        {p.edificios?.nombre ?? "—"}
                        {p.unidades?.codigo ? ` · Apto ${p.unidades.codigo}` : ""}
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                        {p.contacto_nombre ?? p.telefono ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/proveedores/${p.id}`}
                          className="text-xs font-medium text-stone-600 underline hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
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
