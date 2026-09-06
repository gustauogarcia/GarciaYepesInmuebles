import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { UnidadForm } from "../UnidadForm";
import { editarUnidad } from "../actions";

export const dynamic = "force-dynamic";

type EdificioRow = { id: string; nombre: string };

export default async function EditarUnidadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  if (!supabaseConfigured || !supabase) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          La base de datos no está conectada.
        </div>
      </main>
    );
  }

  const [{ data: unidad }, { data: edificios }] = await Promise.all([
    supabase.from("unidades").select("*").eq("id", id).maybeSingle(),
    supabase.from("edificios").select("id, nombre").order("nombre"),
  ]);

  if (!unidad) notFound();

  const accionEditar = editarUnidad.bind(null, id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/unidades"
        className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-50"
      >
        ← Volver a unidades
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Editar apartamento
      </h1>

      <div className="mt-8">
        <UnidadForm
          edificios={(edificios as EdificioRow[]) ?? []}
          valoresIniciales={unidad}
          accion={accionEditar}
          textoBoton="Guardar cambios"
        />
      </div>
    </main>
  );
}
