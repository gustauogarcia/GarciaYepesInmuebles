"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { crearProveedor, type EstadoFormulario } from "./actions";

type GrupoCategoria = {
  categoria: string;
  opciones: { id: string; subcategoria: string }[];
};

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
    >
      {pending ? "Guardando…" : "Agregar proveedor"}
    </button>
  );
}

const initialState: EstadoFormulario = null;

export function ProveedorForm({ grupos }: { grupos: GrupoCategoria[] }) {
  const [estado, formAction] = useActionState(crearProveedor, initialState);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-black sm:grid-cols-2"
    >
      <Campo label="Nombre" name="nombre" required />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Categoría</label>
        <select
          name="categoria_proveedor_id"
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
      <Campo label="Documento (NIT / cédula)" name="documento" />
      <Campo label="Nombre de contacto" name="contacto_nombre" />
      <Campo label="Teléfono" name="telefono" />
      <Campo label="Email" name="email" type="email" />
      <Campo label="Dirección" name="direccion" className="sm:col-span-2" />
      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Notas</label>
        <textarea
          name="notas"
          rows={2}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <div className="flex items-center gap-3 sm:col-span-2">
        <BotonGuardar />
        {estado && (
          <span className={estado.ok ? "text-sm text-emerald-700 dark:text-emerald-400" : "text-sm text-red-700 dark:text-red-400"}>
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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
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
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      />
    </div>
  );
}
