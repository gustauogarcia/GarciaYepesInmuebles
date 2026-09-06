import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { InquilinoForm } from "../InquilinoForm";
import { editarInquilino, eliminarInquilino } from "../actions";
import { calcularAtrasoPago } from "../../dashboard-calc";

export const dynamic = "force-dynamic";

type EdificioRow = { id: string; nombre: string };
type UnidadRow = { id: string; codigo: string; edificio_id: string };
type CategoriaRow = { id: string; nombre: string };
type PagoRentaRow = { id: string; fecha: string; monto: number };

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default async function EditarInquilinoPage({
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

  const [{ data: inquilino }, { data: edificios }, { data: unidades }, { data: categorias }] =
    await Promise.all([
      supabase.from("inquilinos").select("*").eq("id", id).maybeSingle(),
      supabase.from("edificios").select("id, nombre").order("nombre"),
      supabase.from("unidades").select("id, codigo, edificio_id").order("codigo"),
      supabase.from("categorias_movimiento").select("id, nombre"),
    ]);

  if (!inquilino) notFound();

  const edificiosConUnidades = ((edificios as EdificioRow[]) ?? []).map((e) => ({
    id: e.id,
    nombre: e.nombre,
    unidades: ((unidades as UnidadRow[]) ?? [])
      .filter((u) => u.edificio_id === e.id)
      .map((u) => ({ id: u.id, codigo: u.codigo })),
  }));

  const categoriaRentaId = ((categorias as CategoriaRow[]) ?? []).find((c) => c.nombre === "Renta")?.id;

  let pagos: PagoRentaRow[] = [];
  if (categoriaRentaId) {
    let consulta = supabase
      .from("movimientos")
      .select("id, fecha, monto")
      .eq("unidad_id", inquilino.unidad_id)
      .eq("tipo", "Ingreso")
      .eq("categoria_id", categoriaRentaId)
      .order("fecha", { ascending: false });
    if (inquilino.fecha_inicio_contrato) {
      consulta = consulta.gte("fecha", inquilino.fecha_inicio_contrato);
    }
    const { data } = await consulta;
    pagos = (data as PagoRentaRow[]) ?? [];
  }

  const pagosConAtraso = pagos.map((p) => ({
    ...p,
    atraso: inquilino.fecha_inicio_contrato
      ? calcularAtrasoPago(inquilino.fecha_inicio_contrato, p.fecha)
      : { atrasado: false, diasAtraso: 0 },
  }));
  const totalPagado = pagos.reduce((s, p) => s + Number(p.monto || 0), 0);
  const totalAtrasos = pagosConAtraso.filter((p) => p.atraso.atrasado).length;

  const accionEditar = editarInquilino.bind(null, id);
  const accionEliminar = eliminarInquilino.bind(null, id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/inquilinos"
        className="text-sm text-stone-500 underline hover:text-stone-900 dark:hover:text-stone-50"
      >
        ← Volver a inquilinos
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        Editar inquilino
      </h1>

      <div className="mt-8">
        <InquilinoForm
          edificios={edificiosConUnidades}
          valoresIniciales={inquilino}
          accion={accionEditar}
          textoBoton="Guardar cambios"
        />
      </div>

      <form action={accionEliminar} className="mt-6">
        <button
          type="submit"
          className="text-sm text-red-700 underline hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
        >
          Eliminar este inquilino
        </button>
      </form>

      <h2 className="mt-12 text-lg font-medium text-stone-900 dark:text-stone-50">
        Historial de pagos de renta
      </h2>
      {!categoriaRentaId && (
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          No se pudo encontrar la categoría &quot;Renta&quot; en Movimientos.
        </p>
      )}
      {categoriaRentaId && pagos.length === 0 && (
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          Todavía no hay pagos de renta registrados para esta unidad desde el inicio del contrato.
        </p>
      )}
      {categoriaRentaId && pagos.length > 0 && (
        <>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {pagos.length} pago(s) por {formatoCOP.format(totalPagado)} en total
            {totalAtrasos > 0
              ? ` · ${totalAtrasos} llegó(aron) más de 10 días después de la fecha esperada`
              : " · ninguno atrasado más de 10 días"}
            .
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 shadow-sm dark:border-stone-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900">
                <tr>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium text-right">Monto</th>
                  <th className="px-4 py-3 font-medium">Puntualidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {pagosConAtraso.map((p) => (
                  <tr
                    key={p.id}
                    className="bg-white transition-colors hover:bg-stone-50 dark:bg-stone-950 dark:hover:bg-stone-900/60"
                  >
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{p.fecha}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-stone-900 dark:text-stone-50">
                      {formatoCOP.format(p.monto)}
                    </td>
                    <td className="px-4 py-3">
                      {p.atraso.atrasado ? (
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
            Se considera &quot;a tiempo&quot; un pago hecho hasta 10 días después del mismo día del mes en que
            empezó el contrato. Se asume que cada pago corresponde al mes en que se registró.
          </p>
        </>
      )}
    </main>
  );
}
