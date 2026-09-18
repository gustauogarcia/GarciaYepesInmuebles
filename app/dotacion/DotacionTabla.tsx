"use client";

import { useState } from "react";
import { SelectorPropiedad } from "@/components/SelectorPropiedad";
import { TIPOS_DOTACION } from "./tipos";

type Edificio = { id: string; nombre: string };
type ItemRow = { id: string; unidad_id: string; item: string; disponible: boolean };
type Fila = {
  id: string;
  edificio_id: string;
  codigo: string;
  itemsPorTipo: Record<string, ItemRow>;
  extras: ItemRow[];
};

function CeldaItem({
  unidadId,
  tipo,
  item,
  alternarItemPorTipo,
}: {
  unidadId: string;
  tipo: string;
  item?: ItemRow;
  alternarItemPorTipo: (unidadId: string, item: string) => Promise<void>;
}) {
  const accion = alternarItemPorTipo.bind(null, unidadId, tipo);
  const disponible = item?.disponible ?? false;
  const registrado = item != null;
  return (
    <form action={accion}>
      <button
        type="submit"
        title={registrado ? tipo : `Marcar "${tipo}" como disponible`}
        className={
          "flex h-7 w-7 items-center justify-center rounded-md text-sm font-medium transition-colors " +
          (disponible
            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
            : registrado
              ? "bg-stone-100 text-stone-400 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-600 dark:hover:bg-stone-800"
              : "text-stone-300 hover:bg-stone-100 hover:text-stone-500 dark:text-stone-700 dark:hover:bg-stone-900 dark:hover:text-stone-400")
        }
      >
        {disponible ? "✓" : registrado ? "—" : "+"}
      </button>
    </form>
  );
}

export function DotacionTabla({
  edificios,
  filas,
  alternarItemPorTipo,
  eliminarItem,
}: {
  edificios: Edificio[];
  filas: Fila[];
  alternarItemPorTipo: (unidadId: string, item: string) => Promise<void>;
  eliminarItem: (id: string) => Promise<void>;
}) {
  const [seleccion, setSeleccion] = useState(edificios[0]?.id ?? "");
  const filasPropiedad = filas.filter((f) => f.edificio_id === seleccion);

  return (
    <>
      {edificios.length > 1 && (
        <div className="mt-8">
          <SelectorPropiedad edificios={edificios} seleccionId={seleccion} onSeleccionar={setSeleccion} />
        </div>
      )}

      {filasPropiedad.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 shadow-sm dark:border-stone-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Unidad</th>
                {TIPOS_DOTACION.map((t) => (
                  <th key={t} className="px-2 py-3 text-center font-medium">
                    <span className="block max-w-[5rem] mx-auto leading-tight">{t}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {filasPropiedad.map((u) => (
                <tr
                  key={u.id}
                  className="bg-white transition-colors hover:bg-stone-50 dark:bg-stone-950 dark:hover:bg-stone-900/60"
                >
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-stone-900 dark:text-stone-50">
                    {u.codigo}
                  </td>
                  {TIPOS_DOTACION.map((t) => (
                    <td key={t} className="px-2 py-2 text-center">
                      <CeldaItem
                        unidadId={u.id}
                        tipo={t}
                        item={u.itemsPorTipo[t]}
                        alternarItemPorTipo={alternarItemPorTipo}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filasPropiedad.some((u) => u.extras.length > 0) && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Otros ítems (fuera de la lista estándar)
          </h2>
          <div className="mt-2 space-y-2">
            {filasPropiedad
              .filter((u) => u.extras.length > 0)
              .map((u) => (
                <div key={u.id} className="flex flex-wrap items-center gap-1.5 text-sm">
                  <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    {u.codigo}
                  </span>
                  {u.extras.map((it) => {
                    const accionBorrar = eliminarItem.bind(null, it.id);
                    return (
                      <span
                        key={it.id}
                        className={
                          "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium " +
                          (it.disponible
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                            : "border-stone-200 bg-stone-50 text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-500")
                        }
                      >
                        {it.disponible ? "✓" : "—"} {it.item}
                        <form action={accionBorrar}>
                          <button
                            type="submit"
                            title="Quitar ítem"
                            className="text-stone-400 hover:text-red-600 dark:hover:text-red-400"
                          >
                            ×
                          </button>
                        </form>
                      </span>
                    );
                  })}
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
