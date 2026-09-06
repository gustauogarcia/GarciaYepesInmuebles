"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { type EstadoFormulario } from "./actions";

type Edificio = { id: string; nombre: string; unidades: { id: string; codigo: string }[] };

type AccionFormulario = (
  estadoAnterior: EstadoFormulario,
  formData: FormData
) => Promise<EstadoFormulario>;

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
    >
      {pending ? "Guardando…" : "Agregar ítem"}
    </button>
  );
}

const initialState: EstadoFormulario = null;

export function AgregarItemForm({ edificios, accion }: { edificios: Edificio[]; accion: AccionFormulario }) {
  const [estado, formAction] = useActionState(accion, initialState);
  const [edificioId, setEdificioId] = useState("");
  const edificioSeleccionado = edificios.find((e) => e.id === edificioId);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-black sm:grid-cols-2"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Edificio *</label>
        <select
          required
          value={edificioId}
          onChange={(e) => setEdificioId(e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="" disabled>
            Selecciona un edificio
          </option>
          {edificios.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Apartamento *</label>
        <select
          name="unidad_id"
          required
          disabled={!edificioSeleccionado}
          defaultValue=""
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="" disabled>
            {edificioSeleccionado ? "Selecciona un apartamento" : "Elige primero un edificio"}
          </option>
          {edificioSeleccionado?.unidades.map((u) => (
            <option key={u.id} value={u.id}>
              {u.codigo}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Ítem (Gas, Cocina, Closets…) *
        </label>
        <input
          type="text"
          name="item"
          required
          placeholder="Ej. Cocina integral"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <label className="flex items-center gap-2 self-end pb-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          name="disponible"
          defaultChecked
          className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
        />
        Disponible / instalado
      </label>

      <div className="flex items-center gap-3 sm:col-span-2">
        <BotonGuardar />
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
