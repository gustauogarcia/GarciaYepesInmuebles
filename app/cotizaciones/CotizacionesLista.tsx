"use client";

import { useState } from "react";
import Link from "next/link";
import { SelectorPropiedad } from "@/components/SelectorPropiedad";

type Edificio = { id: string; nombre: string };

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

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function chipEstado(estado: string) {
  const base = "rounded-full px-2 py-0.5 text-xs font-medium";
  if (estado === "Aprobada")
    return `${base} bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300`;
  if (estado === "Rechazada")
    return `${base} bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300`;
  return `${base} bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300`;
}

export function CotizacionesLista({
  edificios,
  cotizaciones,
}: {
  edificios: Edificio[];
  cotizaciones: CotizacionRow[];
}) {
  const [seleccion, setSeleccion] = useState(edificios[0]?.id ?? "");
  // Igual que en Proveedores: una cotización sin propiedad asignada se
  // muestra en cualquier pestaña, no solo en una.
  const cotizacionesPropiedad = cotizaciones.filter(
    (c) => c.edificio_id === null || c.edificio_id === seleccion
  );

  return (
    <>
      {edificios.length > 1 && (
        <div className="mt-8">
          <SelectorPropiedad edificios={edificios} seleccionId={seleccion} onSeleccionar={setSeleccion} />
        </div>
      )}

      <h2 className="mt-6 text-lg font-medium text-stone-900 dark:text-stone-50">
        {cotizacionesPropiedad.length === 0
          ? "Todavía no hay cotizaciones para esta propiedad."
          : `${cotizacionesPropiedad.length} cotización(es) para esta propiedad`}
      </h2>

      {cotizacionesPropiedad.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 shadow-sm dark:border-stone-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Proveedor</th>
                <th className="px-4 py-3 font-medium">Descripción</th>
                <th className="px-4 py-3 font-medium text-right">Monto</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {cotizacionesPropiedad.map((c) => (
                <tr
                  key={c.id}
                  className="bg-white transition-colors hover:bg-stone-50 dark:bg-stone-950 dark:hover:bg-stone-900/60"
                >
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{c.fecha}</td>
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-50">
                    {c.proveedores?.nombre ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                    {c.descripcion}
                    {c.edificio_id === null && (
                      <span className="block text-xs text-stone-400">General</span>
                    )}
                    {c.unidades?.codigo && (
                      <span className="block text-xs text-stone-400">Apto {c.unidades.codigo}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-stone-900 dark:text-stone-50">
                    {formatoCOP.format(c.monto)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={chipEstado(c.estado)}>{c.estado}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/cotizaciones/${c.id}`}
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
