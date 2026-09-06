"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { type EstadoFormulario } from "./actions";

type Proveedor = { id: string; nombre: string };
type Edificio = { id: string; nombre: string; unidades: { id: string; codigo: string }[] };

type ValoresCotizacion = {
  proveedor_id?: string | null;
  edificio_id?: string | null;
  unidad_id?: string | null;
  fecha?: string | null;
  descripcion?: string | null;
  monto?: number | null;
  estado?: string | null;
  notas?: string | null;
};

type AccionFormulario = (
  estadoAnterior: EstadoFormulario,
  formData: FormData
) => Promise<EstadoFormulario>;

function BotonGuardar({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900"
    >
      {pending ? "Guardando…" : texto}
    </button>
  );
}

const initialState: EstadoFormulario = null;
const hoy = () => new Date().toISOString().slice(0, 10);

export function CotizacionForm({
  proveedores,
  edificios,
  valoresIniciales,
  accion,
  textoBoton = "Agregar cotización",
}: {
  proveedores: Proveedor[];
  edificios: Edificio[];
  valoresIniciales?: ValoresCotizacion;
  accion: AccionFormulario;
  textoBoton?: string;
}) {
  const [estado, formAction] = useActionState(accion, initialState);
  const [edificioId, setEdificioId] = useState(valoresIniciales?.edificio_id ?? "");
  const edificioSeleccionado = edificios.find((e) => e.id === edificioId);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-xl border border-stone-200 bg-white shadow-sm p-5 dark:border-stone-800 dark:bg-stone-950 sm:grid-cols-2"
    >
      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
          Proveedor *
        </label>
        <select
          name="proveedor_id"
          required
          defaultValue={valoresIniciales?.proveedor_id ?? ""}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        >
          <option value="" disabled>
            Selecciona un proveedor
          </option>
          {proveedores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Edificio</label>
        <select
          name="edificio_id"
          value={edificioId}
          onChange={(e) => setEdificioId(e.target.value)}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        >
          <option value="">Sin especificar</option>
          {edificios.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
          Apartamento
        </label>
        <select
          name="unidad_id"
          defaultValue={valoresIniciales?.unidad_id ?? ""}
          disabled={!edificioSeleccionado}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-stone-700 dark:bg-stone-950"
        >
          <option value="">Todo el edificio</option>
          {edificioSeleccionado?.unidades.map((u) => (
            <option key={u.id} value={u.id}>
              {u.codigo}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Fecha</label>
        <input
          type="date"
          name="fecha"
          defaultValue={valoresIniciales?.fecha ?? hoy()}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Monto *</label>
        <input
          type="number"
          name="monto"
          step="0.01"
          required
          defaultValue={valoresIniciales?.monto ?? ""}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        />
      </div>

      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
          Descripción *
        </label>
        <input
          type="text"
          name="descripcion"
          required
          placeholder="Ej. Reparación de tubería baño principal"
          defaultValue={valoresIniciales?.descripcion ?? ""}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Estado</label>
        <select
          name="estado"
          defaultValue={valoresIniciales?.estado ?? "Pendiente"}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Aprobada">Aprobada</option>
          <option value="Rechazada">Rechazada</option>
        </select>
      </div>

      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Notas</label>
        <textarea
          name="notas"
          rows={2}
          defaultValue={valoresIniciales?.notas ?? ""}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        />
      </div>

      <div className="flex items-center gap-3 sm:col-span-2">
        <BotonGuardar texto={textoBoton} />
        {estado && (
          <span
            className={
              estado.ok
                ? "text-sm text-emerald-700 dark:text-emerald-400"
                : "text-sm text-red-700 dark:text-red-400"
            }
          >
            {estado.mensaje}
          </span>
        )}
      </div>
    </form>
  );
}
