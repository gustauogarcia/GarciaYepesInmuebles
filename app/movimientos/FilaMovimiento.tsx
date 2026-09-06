import Link from "next/link";
import type { MovimientoRow } from "./page";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function FilaMovimiento({
  movimiento,
  edificio,
  unidad,
  categoria,
}: {
  movimiento: MovimientoRow;
  edificio: string | null;
  unidad: string | null;
  categoria: string | null;
}) {
  const esIngreso = movimiento.tipo === "Ingreso";

  return (
    <tr className="bg-white dark:bg-black">
      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{movimiento.fecha}</td>
      <td className="px-4 py-3">
        <span className="font-medium text-zinc-900 dark:text-zinc-50">
          {movimiento.concepto || categoria || "—"}
        </span>
        <span className="block text-xs text-zinc-400">
          {[edificio, unidad ? `Apto ${unidad}` : null, categoria].filter(Boolean).join(" · ")}
        </span>
        {movimiento.comprobante && (
          <span className="block text-xs text-zinc-400">
            Comprobante: {movimiento.comprobante}
          </span>
        )}
      </td>
      <td
        className={
          "px-4 py-3 text-right tabular-nums " +
          (esIngreso
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-red-700 dark:text-red-400")
        }
      >
        {esIngreso ? "+" : "−"}
        {formatoCOP.format(movimiento.monto)}
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-zinc-900 dark:text-zinc-50">
        {formatoCOP.format(movimiento.saldo_caja)}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/movimientos/${movimiento.id}`}
          className="text-xs font-medium text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Editar
        </Link>
      </td>
    </tr>
  );
}
