"use client";

import { useState } from "react";
import Link from "next/link";
import { SelectorPropiedad } from "@/components/SelectorPropiedad";

type Edificio = { id: string; nombre: string };

type ObligacionRow = {
  id: string;
  edificio_id: string;
  tipo: string;
  entidad_reguladora: string | null;
  periodicidad: string | null;
  fecha_vencimiento: string | null;
  monto: number | null;
  estado: string;
};

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function chipEstado(estado: string) {
  const base = "rounded-full px-2 py-0.5 text-xs font-medium";
  if (estado === "Pagado")
    return `${base} bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300`;
  if (estado === "Vencido")
    return `${base} bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300`;
  if (estado === "Exento")
    return `${base} bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400`;
  return `${base} bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300`;
}

export function ObligacionesLista({
  edificios,
  obligaciones,
}: {
  edificios: Edificio[];
  obligaciones: ObligacionRow[];
}) {
  const [seleccion, setSeleccion] = useState(edificios[0]?.id ?? "");
  const obligacionesPropiedad = obligaciones.filter((o) => o.edificio_id === seleccion);

  return (
    <>
      {edificios.length > 1 && (
        <div className="mt-8">
          <SelectorPropiedad edificios={edificios} seleccionId={seleccion} onSeleccionar={setSeleccion} />
        </div>
      )}

      <h2 className="mt-6 text-lg font-medium text-stone-900 dark:text-stone-50">
        {obligacionesPropiedad.length === 0
          ? "Todavía no hay obligaciones registradas para esta propiedad."
          : `${obligacionesPropiedad.length} obligación(es) para esta propiedad`}
      </h2>

      {obligacionesPropiedad.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 shadow-sm dark:border-stone-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900">
              <tr>
                <th className="px-4 py-3 font-medium">Obligación</th>
                <th className="px-4 py-3 font-medium">Vence</th>
                <th className="px-4 py-3 font-medium text-right">Monto</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {obligacionesPropiedad.map((o) => (
                <tr
                  key={o.id}
                  className="bg-white transition-colors hover:bg-stone-50 dark:bg-stone-950 dark:hover:bg-stone-900/60"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-stone-900 dark:text-stone-50">{o.tipo}</span>
                    {o.entidad_reguladora && (
                      <span className="block text-xs text-stone-400">{o.entidad_reguladora}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                    {o.fecha_vencimiento ?? "—"}
                    {o.periodicidad && <span className="block text-xs text-stone-400">{o.periodicidad}</span>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-stone-900 dark:text-stone-50">
                    {o.monto != null ? formatoCOP.format(o.monto) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={chipEstado(o.estado)}>{o.estado}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/obligaciones/${o.id}`}
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
