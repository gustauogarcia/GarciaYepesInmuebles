"use client";

import { useState } from "react";
import Link from "next/link";
import { SelectorPropiedad } from "@/components/SelectorPropiedad";
import { calcularMesContrato } from "../dashboard-calc";

type Edificio = { id: string; nombre: string };
type UnidadRow = { id: string; codigo: string; edificio_id: string };
type InquilinoRow = {
  id: string;
  unidad_id: string;
  nombre_arrendatario: string;
  telefono: string | null;
  email: string | null;
  nombre_codeudor: string | null;
  telefono_codeudor: string | null;
  fecha_inicio_contrato: string | null;
  contrato_activo: boolean;
  notas: string | null;
};

export function InquilinosLista({
  edificios,
  inquilinos,
  unidadPorId,
}: {
  edificios: Edificio[];
  inquilinos: InquilinoRow[];
  unidadPorId: Map<string, UnidadRow>;
}) {
  const [seleccion, setSeleccion] = useState(edificios[0]?.id ?? "");
  const inquilinosPropiedad = inquilinos.filter(
    (i) => unidadPorId.get(i.unidad_id)?.edificio_id === seleccion
  );

  return (
    <>
      {edificios.length > 1 && (
        <div className="mt-8">
          <SelectorPropiedad edificios={edificios} seleccionId={seleccion} onSeleccionar={setSeleccion} />
        </div>
      )}

      <h2 className="mt-6 text-lg font-medium text-stone-900 dark:text-stone-50">
        {inquilinosPropiedad.length === 0
          ? "Todavía no hay inquilinos registrados en esta propiedad."
          : `${inquilinosPropiedad.length} inquilino(s) en esta propiedad`}
      </h2>

      {inquilinosPropiedad.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 shadow-sm dark:border-stone-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900">
              <tr>
                <th className="px-4 py-3 font-medium">Unidad</th>
                <th className="px-4 py-3 font-medium">Arrendatario</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
                <th className="px-4 py-3 font-medium">Contrato</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {inquilinosPropiedad.map((i) => {
                const unidad = unidadPorId.get(i.unidad_id);
                return (
                  <tr
                    key={i.id}
                    className="bg-white transition-colors hover:bg-stone-50 dark:bg-stone-950 dark:hover:bg-stone-900/60"
                  >
                    <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-50">
                      {unidad?.codigo ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                      <span className="font-medium text-stone-900 dark:text-stone-50">
                        {i.nombre_arrendatario}
                      </span>
                      {i.nombre_codeudor && (
                        <span className="block text-xs text-stone-400">Codeudor: {i.nombre_codeudor}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                      {i.telefono ?? i.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-xs font-medium " +
                          (i.contrato_activo
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400")
                        }
                      >
                        {i.contrato_activo ? "Activo" : "Terminado"}
                      </span>
                      {i.fecha_inicio_contrato && (
                        <span className="block text-xs text-stone-400">Desde {i.fecha_inicio_contrato}</span>
                      )}
                      {i.contrato_activo &&
                        i.fecha_inicio_contrato &&
                        (() => {
                          const mes = calcularMesContrato(i.fecha_inicio_contrato as string, new Date());
                          return mes === 12 ? (
                            <span className="mt-1 block max-w-[16rem] rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                              Mes {mes}/12 — renovar y ajustar canon por inflación
                            </span>
                          ) : (
                            <span className="block text-xs text-stone-400">Mes {mes}/12 del ciclo</span>
                          );
                        })()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/inquilinos/${i.id}`}
                        className="text-xs font-medium text-stone-600 underline hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
