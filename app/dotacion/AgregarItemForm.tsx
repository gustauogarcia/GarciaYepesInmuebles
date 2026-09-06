"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { type EstadoFormulario } from "./actions";
import { TIPOS_DOTACION } from "./tipos";

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
      className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900"
    >
      {pending ? "Guardando…" : "Agregar ítem"}
    </button>
  );
}

const initialState: EstadoFormulario = null;

export function AgregarItemForm({ edificios, accion }: { edificios: Edificio[]; accion: AccionFormulario }) {
  const [estado, formAction] = useActionState(accion, initialState);
  const [edificioId, setEdificioId] = useState("");
  const [item, setItem] = useState<string>(TIPOS_DOTACION[0]);
  const edificioSeleccionado = edificios.find((e) => e.id === edificioId);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-xl border border-stone-200 bg-white shadow-sm p-5 dark:border-stone-800 dark:bg-stone-950 sm:grid-cols-2"
    >
      <p className="text-xs text-stone-500 dark:text-stone-400 sm:col-span-2">
        Los tipos más comunes ya son columnas de la tabla de abajo (haz clic en una celda para
        marcarla). Usa este formulario solo para un ítem que no esté en la lista.
      </p>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Edificio *</label>
        <select
          required
          value={edificioId}
          onChange={(e) => setEdificioId(e.target.value)}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
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
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Apartamento *</label>
        <select
          name="unidad_id"
          required
          disabled={!edificioSeleccionado}
          defaultValue=""
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-stone-700 dark:bg-stone-950"
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
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Ítem *</label>
        <select
          name="item"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        >
          {TIPOS_DOTACION.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
          <option value="__otro__">Otro (especificar)…</option>
        </select>
      </div>

      {item === "__otro__" && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
            Nombre del ítem *
          </label>
          <input
            type="text"
            name="item_personalizado"
            required
            placeholder="Ej. Nevera"
            className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
          />
        </div>
      )}

      <label className="flex items-center gap-2 self-end pb-2 text-sm text-stone-700 dark:text-stone-300">
        <input
          type="checkbox"
          name="disponible"
          defaultChecked
          className="h-4 w-4 rounded border-stone-300 dark:border-stone-700"
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
