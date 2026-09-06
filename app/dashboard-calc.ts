// Lógica pura para calcular las métricas del dashboard ejecutivo, a partir de
// los datos crudos ya traídos de Supabase. Sin llamadas a la base de datos
// aquí, para que sea fácil de leer y de ajustar.

export type MovimientoAgg = {
  edificio_id: string;
  unidad_id: string | null;
  fecha: string; // YYYY-MM-DD
  tipo: string; // "Ingreso" | "Egreso"
  categoria_id: string | null;
  monto: number;
};

export type UnidadAgg = {
  id: string;
  edificio_id: string;
  estado: string;
  renta_vigente: number;
};

export type ObligacionAgg = {
  edificio_id: string;
  tipo: string;
  entidad_reguladora: string | null;
  fecha_vencimiento: string | null;
  estado: string;
  monto: number | null;
};

export type CategoriaAgg = { id: string; nombre: string; tipo: string };

export type SerieMes = { mes: string; ingreso: number; egreso: number };
export type CategoriaMonto = { nombre: string; monto: number };
export type Alerta = { severidad: "critical" | "warning"; mensaje: string };

export type MetricasPropiedad = {
  id: string; // id del edificio, o "todas"
  nombre: string;
  totalUnidades: number;
  unidadesOcupadas: number;
  rentaPotencialMensual: number;
  rentaRecaudadaMes: number;
  ingresosMes: number;
  egresosMes: number;
  saldoActual: number;
  ingresosYTD: number;
  egresosYTD: number;
  serieMensual: SerieMes[];
  gastosPorCategoria: CategoriaMonto[];
  alertas: Alerta[];
};

const MESES_ABR = [
  "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic",
];

function claveMes(fecha: string) {
  return fecha.slice(0, 7);
}

export function calcularMetricas({
  edificioId,
  nombre,
  hoy,
  movimientos,
  unidades,
  obligaciones,
  categorias,
  nombreEdificioPorId,
}: {
  edificioId: string | null; // null = consolidado (todas las propiedades)
  nombre: string;
  hoy: Date;
  movimientos: MovimientoAgg[];
  unidades: UnidadAgg[];
  obligaciones: ObligacionAgg[];
  categorias: CategoriaAgg[];
  nombreEdificioPorId: Map<string, string>;
}): MetricasPropiedad {
  const movs = edificioId ? movimientos.filter((m) => m.edificio_id === edificioId) : movimientos;
  const unids = edificioId ? unidades.filter((u) => u.edificio_id === edificioId) : unidades;
  const obls = edificioId ? obligaciones.filter((o) => o.edificio_id === edificioId) : obligaciones;

  const totalUnidades = unids.length;
  const unidadesOcupadas = unids.filter((u) => u.estado === "Ocupado").length;
  const rentaPotencialMensual = unids
    .filter((u) => u.estado === "Ocupado")
    .reduce((s, u) => s + Number(u.renta_vigente || 0), 0);

  const anioActual = hoy.getFullYear();
  const mesActualClave = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  const categoriaRentaId = categorias.find((c) => c.nombre === "Renta")?.id;

  let ingresosMes = 0;
  let egresosMes = 0;
  let ingresosYTD = 0;
  let egresosYTD = 0;
  let rentaRecaudadaMes = 0;
  let saldoActual = 0;

  const porMes = new Map<string, { ingreso: number; egreso: number }>();
  const porCategoriaEgreso = new Map<string, number>();
  const unidadesConRentaEsteMes = new Set<string>();

  for (const m of movs) {
    const monto = Number(m.monto) || 0;
    const clave = claveMes(m.fecha);
    const anio = Number(m.fecha.slice(0, 4));
    const esIngreso = m.tipo === "Ingreso";

    saldoActual += esIngreso ? monto : -monto;

    const bucket = porMes.get(clave) ?? { ingreso: 0, egreso: 0 };
    if (esIngreso) bucket.ingreso += monto;
    else bucket.egreso += monto;
    porMes.set(clave, bucket);

    if (clave === mesActualClave) {
      if (esIngreso) {
        ingresosMes += monto;
        if (categoriaRentaId && m.categoria_id === categoriaRentaId) {
          rentaRecaudadaMes += monto;
          if (m.unidad_id) unidadesConRentaEsteMes.add(m.unidad_id);
        }
      } else {
        egresosMes += monto;
      }
    }

    if (anio === anioActual) {
      if (esIngreso) {
        ingresosYTD += monto;
      } else {
        egresosYTD += monto;
        const catNombre = categorias.find((c) => c.id === m.categoria_id)?.nombre ?? "Sin categoría";
        porCategoriaEgreso.set(catNombre, (porCategoriaEgreso.get(catNombre) ?? 0) + monto);
      }
    }
  }

  // Últimos 12 meses, incluyendo el actual.
  const serieMensual: SerieMes[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = porMes.get(clave) ?? { ingreso: 0, egreso: 0 };
    serieMensual.push({
      mes: `${MESES_ABR[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      ingreso: bucket.ingreso,
      egreso: bucket.egreso,
    });
  }

  // Top 5 categorías de gasto (año en curso) + "Otros".
  const categoriasOrdenadas = Array.from(porCategoriaEgreso.entries()).sort((a, b) => b[1] - a[1]);
  const top = categoriasOrdenadas.slice(0, 5);
  const resto = categoriasOrdenadas.slice(5).reduce((s, [, v]) => s + v, 0);
  const gastosPorCategoria: CategoriaMonto[] = top.map(([n, monto]) => ({ nombre: n, monto }));
  if (resto > 0) gastosPorCategoria.push({ nombre: "Otros", monto: resto });

  // Alertas: obligaciones vencidas / próximas a vencer, y renta sin registrar.
  const alertas: Alerta[] = [];
  const hoyStr = hoy.toISOString().slice(0, 10);
  const en30 = new Date(hoy);
  en30.setDate(en30.getDate() + 30);
  const en30Str = en30.toISOString().slice(0, 10);

  for (const o of obls) {
    if (o.estado === "Pagado" || o.estado === "Exento") continue;
    if (!o.fecha_vencimiento) continue;
    const prefijo = edificioId ? "" : `${nombreEdificioPorId.get(o.edificio_id) ?? "?"} · `;
    if (o.fecha_vencimiento < hoyStr) {
      alertas.push({
        severidad: "critical",
        mensaje: `${prefijo}${o.tipo} vencida desde ${o.fecha_vencimiento}${
          o.entidad_reguladora ? ` (${o.entidad_reguladora})` : ""
        }`,
      });
    } else if (o.fecha_vencimiento <= en30Str) {
      alertas.push({
        severidad: "warning",
        mensaje: `${prefijo}${o.tipo} vence el ${o.fecha_vencimiento}${
          o.entidad_reguladora ? ` (${o.entidad_reguladora})` : ""
        }`,
      });
    }
  }

  if (categoriaRentaId) {
    const unidadesSinRenta = unids.filter(
      (u) => u.estado === "Ocupado" && !unidadesConRentaEsteMes.has(u.id)
    );
    if (unidadesSinRenta.length > 0) {
      const prefijo = edificioId ? "" : `${nombre} · `;
      alertas.push({
        severidad: "warning",
        mensaje: `${prefijo}${unidadesSinRenta.length} unidad(es) ocupada(s) sin un ingreso de "Renta" registrado este mes`,
      });
    }
  }

  // Vencidas primero, luego próximas.
  alertas.sort((a, b) => (a.severidad === b.severidad ? 0 : a.severidad === "critical" ? -1 : 1));

  return {
    id: edificioId ?? "todas",
    nombre,
    totalUnidades,
    unidadesOcupadas,
    rentaPotencialMensual,
    rentaRecaudadaMes,
    ingresosMes,
    egresosMes,
    saldoActual,
    ingresosYTD,
    egresosYTD,
    serieMensual,
    gastosPorCategoria,
    alertas,
  };
}
