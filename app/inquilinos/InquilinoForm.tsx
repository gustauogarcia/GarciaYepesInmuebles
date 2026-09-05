"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { type EstadoFormulario } from "./actions";

type Edificio = { id: string; nombre: string; unidades: { id: string; codigo: string }[] };

type ValoresInquilino = {
  unidad_id?: string | null;
  nombre_arrendatario?: string | null;
  telefono?: string | null;
  email?: string | null;
  nombre_codeudor?: string | null;
  telefono_codeudor?: string | null;
  fecha_inicio_contrato?: string | null;
  contrato_activo?: boolean | null;
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
      className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
    >
      {pending ? "Guardando…" : texto}
    </button>
  );
}

const initialState: EstadoFormulario = null;

// Averigua a qué edificio pertenece la unidad ya elegida, para dejar
// preseleccionado el <select> de edificio al editar un inquilino existente.
function edificioDeUnidad(edificios: Edificio[], unidadId?: string | null) {
  if (!unidadId) return "";
  return edificios.find((e) => e.unidades.some((u) => u.id === unidadId))?.id ?? "";
}

export function InquilinoForm({
  edificios,
  valoresIniciales,
  accion,
  textoBoton = "Agregar inquilino",
}: {
  edificios: Edificio[];
  valoresIniciales?: ValoresInquilino;
  accion: AccionFormulario;
  textoBoton?: string;
}) {
  const [estado, formAction] = useActionState(accion, initialState);
  const [edificioId, setEdificioId] = useState(() =>
    edificioDeUnidad(edificios, valoresIniciales?.unidad_id)
  );

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
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Apartamento *
        </label>
        <select
          name="unidad_id"
          required
          disabled={!edificioSeleccionado}
          defaultValue={valoresIniciales?.unidad_id ?? ""}
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
          Nombre del arrendatario *
        </label>
        <input
          type="text"
          name="nombre_arrendatario"
          required
          defaultValue={valoresIniciales?.nombre_arrendatario ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Fecha de inicio de contrato
        </label>
        <input
          type="date"
          name="fecha_inicio_contrato"
          defaultValue={valoresIniciales?.fecha_inicio_contrato ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Teléfono</label>
        <input
          type="text"
          name="telefono"
          defaultValue={valoresIniciales?.telefono ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Correo</label>
        <input
          type="email"
          name="email"
          defaultValue={valoresIniciales?.email ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Codeudor</label>
        <input
          type="text"
          name="nombre_codeudor"
          defaultValue={valoresIniciales?.nombre_codeudor ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Teléfono del codeudor
        </label>
        <input
          type="text"
          name="telefono_codeudor"
          defaultValue={valoresIniciales?.telefono_codeudor ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Notas</label>
        <textarea
          name="notas"
          rows={2}
          defaultValue={valoresIniciales?.notas ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 sm:col-span-2">
        <input
          type="checkbox"
          name="contrato_activo"
          defaultChecked={valoresIniciales?.contrato_activo ?? true}
          className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
        />
        Contrato activo (marca la unidad como &quot;Ocupado&quot;)
      </label>

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
