"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { type EstadoFormulario } from "./actions";

type Edificio = { id: string; nombre: string };

type ValoresObligacion = {
  edificio_id?: string | null;
  tipo?: string | null;
  entidad_reguladora?: string | null;
  numero_referencia?: string | null;
  periodicidad?: string | null;
  fecha_vencimiento?: string | null;
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

export function ObligacionForm({
  edificios,
  tiposSugeridos,
  entidadesSugeridas,
  valoresIniciales,
  accion,
  textoBoton = "Agregar obligación",
}: {
  edificios: Edificio[];
  tiposSugeridos: string[];
  entidadesSugeridas: string[];
  valoresIniciales?: ValoresObligacion;
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
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Tipo *</label>
        <input
          type="text"
          name="tipo"
          required
          list="tipos-obligacion"
          placeholder="Ej. Impuesto predial"
          defaultValue={valoresIniciales?.tipo ?? ""}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        />
        <datalist id="tipos-obligacion">
          {tiposSugeridos.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
          Entidad reguladora
        </label>
        <input
          type="text"
          name="entidad_reguladora"
          list="entidades-reguladoras"
          placeholder="Ej. Alcaldía de Rionegro"
          defaultValue={valoresIniciales?.entidad_reguladora ?? ""}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        />
        <datalist id="entidades-reguladoras">
          {entidadesSugeridas.map((e) => (
            <option key={e} value={e} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
          Número de referencia
        </label>
        <input
          type="text"
          name="numero_referencia"
          placeholder="Folio, matrícula inmobiliaria, chip catastral…"
          defaultValue={valoresIniciales?.numero_referencia ?? ""}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
          Periodicidad
        </label>
        <select
          name="periodicidad"
          defaultValue={valoresIniciales?.periodicidad ?? ""}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        >
          <option value="">Sin especificar</option>
          <option value="Anual">Anual</option>
          <option value="Bimestral">Bimestral</option>
          <option value="Único">Único</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
          Fecha de vencimiento
        </label>
        <input
          type="date"
          name="fecha_vencimiento"
          defaultValue={valoresIniciales?.fecha_vencimiento ?? ""}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Monto</label>
        <input
          type="number"
          name="monto"
          step="0.01"
          min="0"
          defaultValue={valoresIniciales?.monto ?? ""}
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
          <option value="Pagado">Pagado</option>
          <option value="Vencido">Vencido</option>
          <option value="Exento">Exento</option>
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
