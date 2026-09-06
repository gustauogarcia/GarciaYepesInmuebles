"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Alerta, MetricasPropiedad } from "./dashboard-calc";

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function formatoCorto(v: number) {
  const signo = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${signo}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${signo}$${Math.round(abs / 1000)}K`;
  return `${signo}$${abs}`;
}

type TooltipEntrada = { dataKey: string; name: string; value: number; color: string };

function TooltipMoneda({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntrada[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--grid-line)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ color: "var(--text-secondary)", marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: 9999,
              background: p.color,
            }}
          />
          {p.name}: {formatoCOP.format(p.value)}
        </div>
      ))}
    </div>
  );
}

function variacionPct(actual: number, anterior: number): number | null {
  if (anterior === 0) return actual === 0 ? 0 : null;
  return Math.round(((actual - anterior) / anterior) * 1000) / 10;
}

function VariacionTexto({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const subiendo = pct > 0;
  const plano = pct === 0;
  return (
    <span style={{ color: "var(--text-muted)" }}>
      {plano ? "Igual que" : subiendo ? "▲" : "▼"} {plano ? "" : `${Math.abs(pct)}% `}vs. mes anterior
    </span>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: ReactNode }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm p-4 dark:border-stone-800 dark:bg-stone-950">
      <div className="text-xs uppercase tracking-wide text-stone-500">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-stone-900 dark:text-stone-50">
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-stone-400">{sub}</div>}
    </div>
  );
}

function chipClase(activo: boolean) {
  return (
    "rounded-full px-3 py-1.5 text-sm font-medium transition " +
    (activo
      ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
      : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800")
  );
}

function ListaAlertas({ alertas }: { alertas: Alerta[] }) {
  return (
    <div className="space-y-2">
      {alertas.map((a, i) => (
        <div
          key={i}
          className="flex items-start gap-2 rounded-md border px-3 py-2 text-sm"
          style={{
            borderColor: a.severidad === "critical" ? "var(--critical)" : "var(--warning)",
            background:
              a.severidad === "critical"
                ? "color-mix(in srgb, var(--critical) 10%, transparent)"
                : "color-mix(in srgb, var(--warning) 14%, transparent)",
          }}
        >
          <span aria-hidden style={{ color: a.severidad === "critical" ? "var(--critical)" : "var(--warning)" }}>
            {a.severidad === "critical" ? "⛔" : "⚠️"}
          </span>
          <span style={{ color: "var(--text-primary)" }}>{a.mensaje}</span>
        </div>
      ))}
    </div>
  );
}

export function DashboardView({
  propiedades,
  metricas,
}: {
  propiedades: { id: string; nombre: string }[];
  metricas: Record<string, MetricasPropiedad>;
}) {
  const [seleccion, setSeleccion] = useState<string>("todas");
  const m = metricas[seleccion] ?? metricas.todas;

  const ocupacionPct = m.totalUnidades > 0 ? Math.round((m.unidadesOcupadas / m.totalUnidades) * 100) : 0;
  const recaudoPct =
    m.rentaPotencialMensual > 0 ? Math.round((m.rentaRecaudadaMes / m.rentaPotencialMensual) * 100) : null;
  const utilidadYTD = m.ingresosYTD - m.egresosYTD;

  const alturaGastos = useMemo(() => Math.max(160, m.gastosPorCategoria.length * 42), [m]);

  return (
    <div className="viz-root">
      <div className="flex flex-wrap gap-2">
        <button className={chipClase(seleccion === "todas")} onClick={() => setSeleccion("todas")}>
          Todas las propiedades
        </button>
        {propiedades.map((p) => (
          <button key={p.id} className={chipClase(seleccion === p.id)} onClick={() => setSeleccion(p.id)}>
            {p.nombre}
          </button>
        ))}
      </div>

      {m.alertas.length > 0 && (
        <div className="mt-5">
          <ListaAlertas alertas={m.alertas} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile
          label="Ocupación"
          value={`${ocupacionPct}%`}
          sub={`${m.unidadesOcupadas} de ${m.totalUnidades} unidades`}
        />
        <StatTile
          label="Ingresos del mes"
          value={formatoCOP.format(m.ingresosMes)}
          sub={<VariacionTexto pct={variacionPct(m.ingresosMes, m.ingresosMesAnterior)} />}
        />
        <StatTile
          label="Egresos del mes"
          value={formatoCOP.format(m.egresosMes)}
          sub={<VariacionTexto pct={variacionPct(m.egresosMes, m.egresosMesAnterior)} />}
        />
        <StatTile label="Saldo de caja" value={formatoCOP.format(m.saldoActual)} />
        <StatTile
          label="Recaudo de renta (mes)"
          value={recaudoPct !== null ? `${recaudoPct}%` : "—"}
          sub={
            recaudoPct !== null
              ? `${formatoCOP.format(m.rentaRecaudadaMes)} de ${formatoCOP.format(m.rentaPotencialMensual)} potencial`
              : "Sin unidades ocupadas"
          }
        />
        <StatTile
          label="Utilidad YTD"
          value={formatoCOP.format(utilidadYTD)}
          sub={`Ingresos ${formatoCOP.format(m.ingresosYTD)} · Egresos ${formatoCOP.format(m.egresosYTD)}`}
        />
        <StatTile
          label="Margen YTD"
          value={m.margenYTDPct !== null ? `${m.margenYTDPct}%` : "—"}
          sub="Utilidad como % de los ingresos del año"
        />
      </div>

      <div className="mt-8 rounded-xl border border-stone-200 bg-white shadow-sm p-4 dark:border-stone-800 dark:bg-stone-950">
        <h2 className="text-sm font-medium text-stone-900 dark:text-stone-50">
          Ingresos y egresos — últimos 12 meses
        </h2>
        <div className="mt-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={m.serieMensual}>
              <CartesianGrid stroke="var(--grid-line)" vertical={false} />
              <XAxis
                dataKey="mes"
                stroke="var(--text-muted)"
                tickLine={false}
                axisLine={{ stroke: "var(--axis-line)" }}
                fontSize={12}
              />
              <YAxis
                stroke="var(--text-muted)"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={52}
                tickFormatter={formatoCorto}
              />
              <Tooltip content={<TooltipMoneda />} cursor={{ fill: "var(--grid-line)", opacity: 0.5 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
              <Bar dataKey="ingreso" name="Ingresos" fill="var(--series-1)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="egreso" name="Egresos" fill="var(--series-2)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300">
            Ver como tabla
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-stone-500">
                <tr>
                  <th className="py-1 pr-4">Mes</th>
                  <th className="py-1 pr-4 text-right">Ingresos</th>
                  <th className="py-1 text-right">Egresos</th>
                </tr>
              </thead>
              <tbody className="text-stone-700 dark:text-stone-300">
                {m.serieMensual.map((f) => (
                  <tr key={f.mes} className="border-t border-stone-100 dark:border-stone-900">
                    <td className="py-1 pr-4">{f.mes}</td>
                    <td className="py-1 pr-4 text-right tabular-nums">{formatoCOP.format(f.ingreso)}</td>
                    <td className="py-1 text-right tabular-nums">{formatoCOP.format(f.egreso)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>

      {m.gastosPorCategoria.length > 0 && (
        <div className="mt-6 rounded-xl border border-stone-200 bg-white shadow-sm p-4 dark:border-stone-800 dark:bg-stone-950">
          <h2 className="text-sm font-medium text-stone-900 dark:text-stone-50">
            Egresos por categoría — año en curso
          </h2>
          <div className="mt-2">
            <ResponsiveContainer width="100%" height={alturaGastos}>
              <BarChart data={m.gastosPorCategoria} layout="vertical" margin={{ left: 8, right: 32 }}>
                <CartesianGrid stroke="var(--grid-line)" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="var(--text-muted)"
                  tickFormatter={formatoCorto}
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  stroke="var(--text-secondary)"
                  width={140}
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value, name, props) => {
                    const pct = (props?.payload as { pct?: number })?.pct;
                    const monto = formatoCOP.format(Number(value) || 0);
                    return [pct != null ? `${monto} (${pct}% del total)` : monto, "Egresos"];
                  }}
                  contentStyle={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--grid-line)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  cursor={{ fill: "var(--grid-line)", opacity: 0.5 }}
                />
                <Bar dataKey="monto" name="Egresos" fill="var(--series-2)" radius={[0, 3, 3, 0]}>
                  <LabelList
                    dataKey="pct"
                    position="right"
                    formatter={(v) => `${Number(v) || 0}%`}
                    style={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300">
              Ver como tabla
            </summary>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-stone-500">
                  <tr>
                    <th className="py-1 pr-4">Categoría</th>
                    <th className="py-1 pr-4 text-right">Monto</th>
                    <th className="py-1 text-right">% del total</th>
                  </tr>
                </thead>
                <tbody className="text-stone-700 dark:text-stone-300">
                  {m.gastosPorCategoria.map((c) => (
                    <tr key={c.nombre} className="border-t border-stone-100 dark:border-stone-900">
                      <td className="py-1 pr-4">{c.nombre}</td>
                      <td className="py-1 pr-4 text-right tabular-nums">{formatoCOP.format(c.monto)}</td>
                      <td className="py-1 text-right tabular-nums">{c.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
