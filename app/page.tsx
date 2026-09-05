import Link from "next/link";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic"; // siempre consulta datos frescos, no cachea

async function getResumen() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [{ count: totalUnidades }, { count: unidadesOcupadas }, { count: totalMovimientos }] =
    await Promise.all([
      supabase.from("unidades").select("*", { count: "exact", head: true }),
      supabase.from("unidades").select("*", { count: "exact", head: true }).eq("estado", "Ocupado"),
      supabase.from("movimientos").select("*", { count: "exact", head: true }),
    ]);

  const { data: ultimoSaldo } = await supabase
    .from("v_movimientos_con_saldo")
    .select("saldo_caja, fecha")
    .order("fecha", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    totalUnidades: totalUnidades ?? 0,
    unidadesOcupadas: unidadesOcupadas ?? 0,
    totalMovimientos: totalMovimientos ?? 0,
    saldoCaja: ultimoSaldo?.saldo_caja ?? null,
  };
}

export default async function Home() {
  const resumen = supabaseConfigured ? await getResumen() : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Administración del edificio
      </h1>

        {!supabaseConfigured && (
          <div className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
            <p className="font-medium">Falta conectar la base de datos.</p>
            <p className="mt-1 text-sm">
              Configura las variables{" "}
              <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
              <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (ver{" "}
              <code className="font-mono">.env.local.example</code>) y vuelve a cargar la página.
            </p>
          </div>
        )}

        {supabaseConfigured && !resumen && (
          <div className="mt-8 rounded-lg border border-red-300 bg-red-50 p-5 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200">
            No se pudo leer la base de datos. Revisa que la URL y la llave de Supabase sean
            correctas.
          </div>
        )}

        {resumen && (
          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 sm:grid-cols-4">
            <Stat label="Unidades" value={resumen.totalUnidades} />
            <Stat label="Ocupadas" value={resumen.unidadesOcupadas} />
            <Stat label="Movimientos" value={resumen.totalMovimientos} />
            <Stat
              label="Saldo de caja"
              value={
                resumen.saldoCaja !== null
                  ? new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      maximumFractionDigits: 0,
                    }).format(resumen.saldoCaja)
                  : "—"
              }
            />
          </div>
        )}

        <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">
          Este resumen confirma que la app está conectada a la base de datos real en Supabase.{" "}
          <Link href="/unidades" className="underline">
            Ver el detalle de las unidades
          </Link>{" "}
          ·{" "}
          <Link href="/movimientos" className="underline">
            Ver el libro de caja →
          </Link>
        </p>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white p-5 dark:bg-black">
      <div className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wide text-zinc-500">{label}</div>
    </div>
  );
}
