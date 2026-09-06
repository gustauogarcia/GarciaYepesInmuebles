import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { EdificioForm } from "../EdificioForm";
import { editarEdificio } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditarEdificioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  if (!supabaseConfigured || !supabase) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          La base de datos no está conectada.
        </div>
      </main>
    );
  }

  const { data: edificio } = await supabase.from("edificios").select("*").eq("id", id).maybeSingle();

  if (!edificio) notFound();

  const accionEditar = editarEdificio.bind(null, id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/edificios"
        className="text-sm text-stone-500 underline hover:text-stone-900 dark:hover:text-stone-50"
      >
        ← Volver a propiedades
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        Editar propiedad
      </h1>

      <div className="mt-8">
        <EdificioForm
          valoresIniciales={edificio}
          accion={accionEditar}
          textoBoton="Guardar cambios"
        />
      </div>

      <p className="mt-6 text-xs text-stone-400">
        Por seguridad, esta propiedad no se puede borrar desde la app (borraría en cascada sus
        unidades, inquilinos y movimientos). Si de verdad necesitas eliminarla, dímelo y lo hacemos
        con cuidado directamente en Supabase.
      </p>
    </main>
  );
}
