"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { type EstadoFormulario } from "./actions";

type Categoria = { id: string; nombre: string; tipo: string };
type Edificio = { id: string; nombre: string; unidades: { id: string; codigo: string }[] };

type ValoresMovimiento = {
  edificio_id?: string | null;
  unidad_id?: string | null;
  fecha?: string | null;
  tipo?: string | null;
  categoria_id?: string | null;
  concepto?: string | null;
  comprobante?: string | null;
  monto?: number | null;
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
const hoy = () => new Date().toISOString().slice(0, 10);

export function MovimientoForm({
  categorias,
  edificios,
  valoresIniciales,
  accion,
  textoBoton = "Agregar movimiento",
}: {
  categorias: Categoria[];
  edificios: Edificio[];
  valoresIniciales?: ValoresMovimiento;
  accion: AccionFormulario;
  textoBoton?: string;
}) {
  const [estado, formAction] = useActionState(accion, initialState);
  const [edificioId, setEdificioId] = useState(valoresIniciales?.edificio_id ?? "");
  const [tipo, setTipo] = useState(valoresIniciales?.tipo ?? "Egreso");

  const edificioSeleccionado = edificios.find((e) => e.id === edificioId);
  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-black sm:grid-cols-2"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Tipo *</label>
        <select
          name="tipo"
          required
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="Egreso">Egreso (sale dinero)</option>
          <option value="Ingreso">Ingreso (entra dinero)</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Fecha *</label>
        <input
          type="date"
          name="fecha"
          required
          defaultValue={valoresIniciales?.fecha ?? hoy()}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Edificio *</label>
        <select
          name="edificio_id"
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
          Apartamento
        </label>
        <select
          name="unidad_id"
          defaultValue={valoresIniciales?.unidad_id ?? ""}
          disabled={!edificioSeleccionado}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">General (todo el edificio)</option>
          {edificioSeleccionado?.unidades.map((u) => (
            <option key={u.id} value={u.id}>
              {u.codigo}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Categoría</label>
        <select
          name="categoria_id"
          defaultValue={valoresIniciales?.categoria_id ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">Sin clasificar</option>
          {categoriasFiltradas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Monto *</label>
        <input
          type="number"
          name="monto"
          step="0.01"
          min="0.01"
          required
          defaultValue={valoresIniciales?.monto ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Concepto</label>
        <input
          type="text"
          name="concepto"
          placeholder="Ej. Renta apto 302 - agosto"
          defaultValue={valoresIniciales?.concepto ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Comprobante
        </label>
        <input
          type="text"
          name="comprobante"
          placeholder="Número de factura, recibo o referencia (opcional)"
          defaultValue={valoresIniciales?.comprobante ?? ""}
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
