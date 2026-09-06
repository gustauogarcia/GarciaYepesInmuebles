"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { iniciarSesion, type EstadoLogin } from "./actions";

function BotonEntrar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900"
    >
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

const estadoInicial: EstadoLogin = null;

export function LoginForm({ redirigir }: { redirigir: string }) {
  const [estado, formAction] = useActionState(iniciarSesion, estadoInicial);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-xl border border-stone-200 bg-white shadow-sm p-5 dark:border-stone-800 dark:bg-stone-950"
    >
      <input type="hidden" name="redirigir" value={redirigir} />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">Correo</label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
          Contraseña
        </label>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
        />
      </div>

      <div className="flex items-center gap-3">
        <BotonEntrar />
        {estado && !estado.ok && (
          <span className="text-sm text-red-700 dark:text-red-400">{estado.mensaje}</span>
        )}
      </div>
    </form>
  );
}
