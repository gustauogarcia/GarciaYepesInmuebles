"use client";

import { useState } from "react";
import Link from "next/link";
import { SelectorPropiedad } from "@/components/SelectorPropiedad";

type Edificio = { id: string; nombre: string };
type Unidad = {
  id: string;
  edificio_id: string;
  codigo: string;
  torre: string | null;
  estado: string;
  renta_vigente: number;
  inquilino: string | null;
  mesContrato: number | null;
};

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function UnidadesLista({ edificios, unidades }: { edificios: Edificio[]; unidades: Unidad[] }) {
  const [seleccion, setSeleccion] = useState(edificios[0]?.id ?? "");
  const unidadesPropiedad = unidades.filter((u) => u.edificio_id === seleccion);

  return (
    <>
      {edificios.length > 1 && (
        <div className="mt-8">
          <SelectorPropiedad edificios={edificios} seleccionId={seleccion} onSeleccionar={setSeleccion} />
        </div>
      )}

      <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
        {unidadesPropiedad.length} unidad(es) en esta propiedad.
      </p>

      {unidadesPropiedad.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 shadow-sm dark:border-stone-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900">
              <tr>
                <th className="px-4 py-3 font-medium">Unidad</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Inquilino</th>
                <th className="px-4 py-3 font-medium text-right">Renta vigente</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {unidadesPropiedad.map((u) => (
                <tr
                  key={u.id}
                  className="bg-white transition-colors hover:bg-stone-50 dark:bg-stone-950 dark:hover:bg-stone-900/60"
                >
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-50">
                    {u.codigo}
                    {u.torre && <span className="block text-xs text-stone-400">{u.torre}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-xs font-medium " +
                        (u.estado === "Ocupado"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400")
                      }
                    >
                      {u.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                    {u.inquilino ?? "—"}
                    {u.mesContrato != null &&
                      (u.mesContrato === 12 ? (
                        <span className="mt-1 block max-w-[14rem] rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                          Mes 12/12 — renovar y ajustar canon
                        </span>
                      ) : (
                        <span className="block text-xs text-stone-400">Mes {u.mesContrato}/12 del ciclo</span>
                      ))}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-stone-900 dark:text-stone-50">
                    {formatoCOP.format(u.renta_vigente)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/unidades/${u.id}`}
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
