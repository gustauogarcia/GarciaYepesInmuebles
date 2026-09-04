"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { type EstadoFormulario } from "./actions";

type GrupoCategoria = {
  categoria: string;
  opciones: { id: string; subcategoria: string }[];
};

type Edificio = {
  id: string;
  nombre: string;
  unidades: { id: string; codigo: string }[];
};

type ValoresProveedor = {
  nombre?: string;
  categoria_proveedor_id?: string | null;
  edificio_id?: string | null;
  unidad_id?: string | null;
  documento?: string | null;
  contacto_nombre?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
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

export function ProveedorForm({
  grupos,
  edificios,
  valoresIniciales,
  accion,
  textoBoton = "Agregar proveedor",
}: {
  grupos: GrupoCategoria[];
  edificios: Edificio[];
  valoresIniciales?: ValoresProveedor;
  accion: AccionFormulario;
  textoBoton?: string;
}) {
  const [estado, formAction] = useActionState(accion, initialState);
  const [edificioId, setEdificioId] = useState(valoresIniciales?.edificio_id ?? "");

  const edificioSeleccionado = edificios.find((e) => e.id === edificioId);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-black sm:grid-cols-2"
    >
      <Campo label="Nombre" name="nombre" required defaultValue={valoresIniciales?.nombre} />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Categoría</label>
        <select
          name="categoria_proveedor_id"
          defaultValue={valoresIniciales?.categoria_proveedor_id ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">Sin clasificar</option>
          {grupos.map((grupo) => (
            <optgroup key={grupo.categoria} label={grupo.categoria}>
              {grupo.opciones.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.subcategoria}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Edificio</label>
        <select
          name="edificio_id"
          value={edificioId}
          onChange={(e) => setEdificioId(e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">General (todos los edificios)</option>
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
          <option value="">Todo el edificio (ningún apto en particular)</option>
          {edificioSeleccionado?.unidades.map((u) => (
            <option key={u.id} value={u.id}>
              {u.codigo}
            </option>
          ))}
        </select>
      </div>

      <Campo label="Documento (NIT / cédula)" name="documento" defaultValue={valoresIniciales?.documento} />
      <Campo label="Nombre de contacto" name="contacto_nombre" defaultValue={valoresIniciales?.contacto_nombre} />
      <Campo label="Teléfono" name="telefono" defaultValue={valoresIniciales?.telefono} />
      <Campo label="Email" name="email" type="email" defaultValue={valoresIniciales?.email} />
      <Campo
        label="Dirección"
        name="direccion"
        className="sm:col-span-2"
        defaultValue={valoresIniciales?.direccion}
      />
      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Notas</label>
        <textarea
          name="notas"
          rows={2}
          defaultValue={valoresIniciales?.notas ?? ""}
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

function Campo({
  label,
  name,
  type = "text",
  required = false,
  className = "",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
  defaultValue?: string | null;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
        {required && " *"}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      />
    </div>
  );
}
