import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { UnidadForm } from "../UnidadForm";
import { editarUnidad } from "../actions";
import { calcularAtrasoPago } from "../../dashboard-calc";

export const dynamic = "force-dynamic";

type EdificioRow = { id: string; nombre: string };
type CategoriaRow = { id: string; nombre: string };
type InquilinoHistRow = { id: string; nombre_arrendatario: string; fecha_inicio_contrato: string | null };
type PagoRentaRow = { id: string; fecha: string; monto: number };

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

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
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          La base de datos no está conectada.
        </div>
      </main>
    );
  }

  const [{ data: unidad }, { data: edificios }, { data: categorias }, { data: inquilinosHist }] =
    await Promise.all([
      supabase.from("unidades").select("*").eq("id", id).maybeSingle(),
      supabase.from("edificios").select("id, nombre").order("nombre"),
      supabase.from("categorias_movimiento").select("id, nombre"),
      supabase
        .from("inquilinos")
        .select("id, nombre_arrendatario, fecha_inicio_contrato")
        .eq("unidad_id", id)
        .order("fecha_inicio_contrato", { ascending: true }),
    ]);

  if (!unidad) notFound();

  const categoriaRentaId = ((categorias as CategoriaRow[]) ?? []).find((c) => c.nombre === "Renta")?.id;
  const inquilinos = ((inquilinosHist as InquilinoHistRow[]) ?? []).filter((i) => i.fecha_inicio_contrato);

  let pagos: PagoRentaRow[] = [];
  if (categoriaRentaId) {
    const { data } = await supabase
      .from("movimientos")
      .select("id, fecha, monto")
      .eq("unidad_id", id)
      .eq("tipo", "Ingreso")
      .eq("categoria_id", categoriaRentaId)
      .order("fecha", { ascending: false });
    pagos = (data as PagoRentaRow[]) ?? [];
  }

  // Para cada pago, se busca el inquilino cuyo contrato ya había empezado en
  // esa fecha (el más reciente de los que empezaron antes o el mismo día),
  // para poder comparar el pago contra el día esperado de ESE contrato.
  const pagosConDetalle = pagos.map((p) => {
    const inquilino = [...inquilinos]
      .filter((i) => (i.fecha_inicio_contrato as string) <= p.fecha)
      .sort((a, b) => (a.fecha_inicio_contrato! < b.fecha_inicio_contrato! ? 1 : -1))[0];
    return {
      ...p,
      inquilino: inquilino?.nombre_arrendatario ?? null,
      atraso: inquilino ? calcularAtrasoPago(inquilino.fecha_inicio_contrato as string, p.fecha) : null,
    };
  });
  const totalPagado = pagos.reduce((s, p) => s + Number(p.monto || 0), 0);
  const totalAtrasos = pagosConDetalle.filter((p) => p.atraso?.atrasado).length;

  const accionEditar = editarUnidad.bind(null, id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/unidades"
        className="text-sm text-stone-500 underline hover:text-stone-900 dark:hover:text-stone-50"
      >
        ← Volver a unidades
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
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

      <h2 className="mt-12 text-lg font-medium text-stone-900 dark:text-stone-50">
        Historial de pagos de renta de esta unidad
      </h2>
      {!categoriaRentaId && (
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          No se pudo encontrar la categoría &quot;Renta&quot; en Movimientos.
        </p>
      )}
      {categoriaRentaId && pagos.length === 0 && (
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          Todavía no hay pagos de renta registrados para esta unidad.
        </p>
      )}
      {categoriaRentaId && pagos.length > 0 && (
        <>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {pagos.length} pago(s) por {formatoCOP.format(totalPagado)} en total
            {totalAtrasos > 0
              ? ` · ${totalAtrasos} llegó(aron) más de 5 días después de la fecha esperada`
              : " · ninguno atrasado más de 5 días"}
            .
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 shadow-sm dark:border-stone-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900">
                <tr>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Inquilino</th>
                  <th className="px-4 py-3 font-medium text-right">Monto</th>
                  <th className="px-4 py-3 font-medium">Puntualidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {pagosConDetalle.map((p) => (
                  <tr
                    key={p.id}
                    className="bg-white transition-colors hover:bg-stone-50 dark:bg-stone-950 dark:hover:bg-stone-900/60"
                  >
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{p.fecha}</td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                      {p.inquilino ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-stone-900 dark:text-stone-50">
                      {formatoCOP.format(p.monto)}
                    </td>
                    <td className="px-4 py-3">
                      {p.atraso === null ? (
                        <span className="text-xs text-stone-400">—</span>
                      ) : p.atraso.atrasado ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                          Atrasado {p.atraso.diasAtraso} día(s)
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          A tiempo
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-stone-400">
            Se considera &quot;a tiempo&quot; un pago hecho hasta 5 días después del mismo día del mes en que
            empezó el contrato del inquilino correspondiente. Se asume que cada pago corresponde al
            mes en que se registró.
          </p>
        </>
      )}
    </main>
  );
}
