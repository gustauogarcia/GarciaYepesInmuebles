"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { type EstadoFormulario } from "./actions";

type Edificio = { id: string; nombre: string };

type ValoresUnidad = {
  edificio_id?: string | null;
  codigo?: string | null;
  torre?: string | null;
  habitaciones?: string | null;
  estado?: string | null;
  renta_vigente?: number | null;
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

export function UnidadForm({
  edificios,
  valoresIniciales,
  accion,
  textoBoton = "Agregar apartamento",
}: {
  edificios: Edificio[];
  valoresIniciales?: ValoresUnidad;
  accion: AccionFormulario;
  textoBoton?: string;
}) {
  const [estado, formAction] = useActionState(accion, initialState);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-xl border border-stone-200 bg-white shadow-sm p-5 dark:border-stone-800 dark:bg-stone-950 sm:grid-cols-2"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Edificio *</label>
        <select
          name="edificio_id"
          required
          defaultValue={valoresIniciales?.edificio_id ?? ""}
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
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
          Código del apto *
        </label>
        <input
          type="text"
          name="codigo"
          required
          placeholder="Ej. 302"
          defaultValue={valoresIniciales?.codigo ?? ""}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Torre</label>
        <input
          type="text"
          name="torre"
          placeholder="Ej. Frente, Medio, Trasera"
          defaultValue={valoresIniciales?.torre ?? ""}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
          Habitaciones
        </label>
        <input
          type="text"
          name="habitaciones"
          placeholder="Ej. 2, Aparta estudio"
          defaultValue={valoresIniciales?.habitaciones ?? ""}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Estado</label>
        <select
          name="estado"
          defaultValue={valoresIniciales?.estado ?? "Vacante"}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        >
          <option value="Vacante">Vacante</option>
          <option value="Ocupado">Ocupado</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
          Renta vigente
        </label>
        <input
          type="number"
          name="renta_vigente"
          step="0.01"
          min="0"
          defaultValue={valoresIniciales?.renta_vigente ?? ""}
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
