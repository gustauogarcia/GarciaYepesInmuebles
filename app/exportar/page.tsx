import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { ExportarLista } from "./ExportarLista";

export const dynamic = "force-dynamic";

type EdificioRow = { id: string; nombre: string };

async function getEdificios() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase.from("edificios").select("id, nombre").order("nombre");
  return (data as EdificioRow[]) ?? [];
}

export default async function ExportarPage() {
  const edificios = supabaseConfigured ? await getEdificios() : [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        Exportar
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        Descarga cualquier tabla en un archivo <code className="font-mono">.csv</code> que Excel
        abre directamente (con tildes y ñ correctas). Útil para respaldos o para compartir la
        información fuera de la app.
      </p>

      <ExportarLista edificios={edificios} />
    </main>
  );
}
