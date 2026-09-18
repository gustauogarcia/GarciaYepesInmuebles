"use client";

import { useState } from "react";
import { SelectorPropiedad } from "@/components/SelectorPropiedad";

type Edificio = { id: string; nombre: string };

type TablaInfo = {
  id: string;
  nombre: string;
  detalle: string;
  // Las tablas que existen por propiedad (una fila de Unidades, Inquilinos o
  // Movimientos siempre pertenece a una sola propiedad) se filtran con el
  // selector de arriba. Las demás (Propiedades, Dotación, Proveedores,
  // Cotizaciones) no varían por propiedad — Dotación/Proveedores/
  // Cotizaciones porque hoy solo aplican a Blanco y Negro, y Propiedades
  // porque esa tabla ES la lista de propiedades.
  porPropiedad: boolean;
};

const TABLAS: TablaInfo[] = [
  {
    id: "edificios",
    nombre: "Propiedades",
    detalle: "Nombre, dirección, % de administración, fecha de corte.",
    porPropiedad: false,
  },
  {
    id: "unidades",
    nombre: "Unidades",
    detalle: "Cada apartamento con su propiedad, estado y renta vigente.",
    porPropiedad: true,
  },
  {
    id: "inquilinos",
    nombre: "Inquilinos",
    detalle: "Arrendatarios, codeudor y vigencia del contrato.",
    porPropiedad: true,
  },
  {
    id: "movimientos",
    nombre: "Movimientos",
    detalle: "Todo el libro de caja: ingresos y egresos con categoría.",
    porPropiedad: true,
  },
  {
    id: "dotacion",
    nombre: "Dotación",
    detalle: "Ítems de dotación y mejoras por unidad (solo Blanco y Negro).",
    porPropiedad: false,
  },
  {
    id: "proveedores",
    nombre: "Proveedores",
    detalle: "Contacto y categoría de cada proveedor (solo Blanco y Negro).",
    porPropiedad: false,
  },
  {
    id: "cotizaciones",
    nombre: "Cotizaciones",
    detalle: "Cotizaciones recibidas, su estado y monto (solo Blanco y Negro).",
    porPropiedad: false,
  },
];

export function ExportarLista({ edificios }: { edificios: Edificio[] }) {
  const [seleccion, setSeleccion] = useState(edificios[0]?.id ?? "");

  return (
    <>
      {edificios.length > 1 && (
        <div className="mt-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">
            Propiedad para Unidades, Inquilinos y Movimientos
          </p>
          <SelectorPropiedad edificios={edificios} seleccionId={seleccion} onSeleccionar={setSeleccion} />
        </div>
      )}

      <div className="mt-8 divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 shadow-sm dark:divide-stone-800 dark:border-stone-800">
        {TABLAS.map((t) => {
          const href =
            t.porPropiedad && seleccion ? `/api/exportar/${t.id}?propiedad=${seleccion}` : `/api/exportar/${t.id}`;
          return (
            <div key={t.id} className="flex items-center justify-between gap-4 bg-white p-4 dark:bg-stone-950">
              <div>
                <div className="font-medium text-stone-900 dark:text-stone-50">{t.nombre}</div>
                <div className="text-xs text-stone-500 dark:text-stone-400">{t.detalle}</div>
              </div>
              <a
                href={href}
                className="shrink-0 rounded-md bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
              >
                Descargar CSV
              </a>
            </div>
          );
        })}
      </div>
    </>
  );
}
