"use client";

import { useState } from "react";
import Link from "next/link";
import { SelectorPropiedad } from "@/components/SelectorPropiedad";

type Edificio = { id: string; nombre: string };

type ProveedorRow = {
  id: string;
  nombre: string;
  contacto_nombre: string | null;
  telefono: string | null;
  edificio_id: string | null;
  categorias_proveedor: { categoria: string; subcategoria: string } | null;
  unidades: { codigo: string } | null;
};

export function ProveedoresLista({
  edificios,
  proveedores,
}: {
  edificios: Edificio[];
  proveedores: ProveedorRow[];
}) {
  const [seleccion, setSeleccion] = useState(edificios[0]?.id ?? "");
  // Un proveedor sin edificio_id es "general" (no depende de una sola
  // propiedad, p. ej. un contador que atiende todas): se muestra en
  // cualquier pestaña que elijas, en vez de desaparecer.
  const proveedoresPropiedad = proveedores.filter(
    (p) => p.edificio_id === null || p.edificio_id === seleccion
  );

  return (
    <>
      {edificios.length > 1 && (
        <div className="mt-8">
          <SelectorPropiedad edificios={edificios} seleccionId={seleccion} onSeleccionar={setSeleccion} />
        </div>
      )}

      <h2 className="mt-6 text-lg font-medium text-stone-900 dark:text-stone-50">
        {proveedoresPropiedad.length === 0
          ? "Todavía no hay proveedores para esta propiedad."
          : `${proveedoresPropiedad.length} proveedor(es) para esta propiedad`}
      </h2>

      {proveedoresPropiedad.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 shadow-sm dark:border-stone-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Alcance</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {proveedoresPropiedad.map((p) => (
                <tr
                  key={p.id}
                  className="bg-white transition-colors hover:bg-stone-50 dark:bg-stone-950 dark:hover:bg-stone-900/60"
                >
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-50">{p.nombre}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                    {p.categorias_proveedor?.subcategoria ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                    {p.edificio_id === null ? (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                        General
                      </span>
                    ) : (
                      p.unidades?.codigo ? `Apto ${p.unidades.codigo}` : "Esta propiedad"
                    )}
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
  );
}
