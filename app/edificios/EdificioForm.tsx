"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { type EstadoFormulario } from "./actions";

type ValoresEdificio = {
  nombre?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  pais?: string | null;
  pct_administracion?: number | null;
  fecha_corte?: string | null;
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

export function EdificioForm({
  valoresIniciales,
  accion,
  textoBoton = "Agregar propiedad",
}: {
  valoresIniciales?: ValoresEdificio;
  accion: AccionFormulario;
  textoBoton?: string;
}) {
  const [estado, formAction] = useActionState(accion, initialState);
  const pctInicial =
    valoresIniciales?.pct_administracion != null
      ? Math.round(valoresIniciales.pct_administracion * 10000) / 100
      : 35;

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-black sm:grid-cols-2"
    >
      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Nombre de la propiedad *
        </label>
        <input
          type="text"
          name="nombre"
          required
          placeholder="Ej. Blanco y Negro"
          defaultValue={valoresIniciales?.nombre ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Dirección</label>
        <input
          type="text"
          name="direccion"
          defaultValue={valoresIniciales?.direccion ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Ciudad</label>
        <input
          type="text"
          name="ciudad"
          defaultValue={valoresIniciales?.ciudad ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">País</label>
        <input
          type="text"
          name="pais"
          defaultValue={valoresIniciales?.pais ?? "Colombia"}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          % de administración
        </label>
        <input
          type="number"
          name="pct_administracion"
          step="0.01"
          min="0"
          max="100"
          defaultValue={pctInicial}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Fecha de corte
        </label>
        <input
          type="date"
          name="fecha_corte"
          defaultValue={valoresIniciales?.fecha_corte ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
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
