// Lógica pura para calcular las métricas del dashboard ejecutivo, a partir de
// los datos crudos ya traídos de Supabase. Sin llamadas a la base de datos
// aquí, para que sea fácil de leer y de ajustar.

export type MovimientoAgg = {
  edificio_id: string;
  unidad_id: string | null;
  fecha: string; // YYYY-MM-DD
  tipo: string; // "Ingreso" | "Egreso"
  categoria_id: string | null;
  concepto: string | null;
  monto: number;
};

export type UnidadAgg = {
  id: string;
  edificio_id: string;
  estado: string;
  renta_vigente: number;
  codigo?: string;
};

export type InquilinoAgg = {
  unidad_id: string;
  nombre_arrendatario: string;
  fecha_inicio_contrato: string | null;
  contrato_activo: boolean;
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
export type CategoriaMonto = { nombre: string; monto: number; pct: number };
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
  ingresosMesAnterior: number;
  egresosMesAnterior: number;
  saldoActual: number;
  ingresosYTD: number;
  egresosYTD: number;
  margenYTDPct: number | null;
  pagosAdminJaimeTotal: number;
  pagosAdminJaimeYTD: number;
  pagosDuenosTotal: number;
  pagosDuenosYTD: number;
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

function normalizarTexto(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Búsqueda por texto libre en el concepto del movimiento — no por categoría,
// porque un gasto de remodelación (materiales, mano de obra) puede quedar
// contabilizado en "Pagos a socios" sin que eso sea plata que se le pagó
// a los dueños; solo cuenta como pago a los dueños si el concepto de verdad
// nombra a Piedad, a Gustauo (con o sin apellido) o a "socios".
function esPagoADuenos(texto: string): boolean {
  return (
    /\bpiedad\b/.test(texto) ||
    /\bgusta[uv]o\b/.test(texto) ||
    /\bsocios?\b/.test(texto)
  );
}
const RE_ADMIN_JAIME = /administraci[o0]n|\badmon\b|jaime\s+yepes/;

// Meses completos transcurridos entre dos fechas (sin contar el mes en curso
// si todavía no se llega al día del aniversario).
function mesesTranscurridos(inicio: Date, hoy: Date): number {
  let meses = (hoy.getFullYear() - inicio.getFullYear()) * 12 + (hoy.getMonth() - inicio.getMonth());
  if (hoy.getDate() < inicio.getDate()) meses -= 1;
  return Math.max(0, meses);
}

/**
 * En qué mes (1 a 12) del ciclo anual de contrato está una fecha de inicio
 * dada. El ciclo se reinicia cada año en el aniversario de fecha_inicio.
 * Mes 12 = último mes antes de cumplir el año (hay que renovar y ajustar
 * el canon por inflación).
 */
export function calcularMesContrato(fechaInicioContrato: string, hoy: Date): number {
  const inicio = new Date(fechaInicioContrato + "T00:00:00");
  const meses = mesesTranscurridos(inicio, hoy);
  return (meses % 12) + 1;
}

export function calcularMetricas({
  edificioId,
  nombre,
  hoy,
  movimientos,
  unidades,
  obligaciones,
  categorias,
  inquilinos = [],
  nombreEdificioPorId,
}: {
  edificioId: string | null; // null = consolidado (todas las propiedades)
  nombre: string;
  hoy: Date;
  movimientos: MovimientoAgg[];
  unidades: UnidadAgg[];
  obligaciones: ObligacionAgg[];
  categorias: CategoriaAgg[];
  inquilinos?: InquilinoAgg[];
  nombreEdificioPorId: Map<string, string>;
}): MetricasPropiedad {
  const unidadPorId = new Map(unidades.map((u) => [u.id, u]));
  const movs = edificioId ? movimientos.filter((m) => m.edificio_id === edificioId) : movimientos;
  const unids = edificioId ? unidades.filter((u) => u.edificio_id === edificioId) : unidades;
  const obls = edificioId ? obligaciones.filter((o) => o.edificio_id === edificioId) : obligaciones;
  const inqs = edificioId
    ? inquilinos.filter((i) => unidadPorId.get(i.unidad_id)?.edificio_id === edificioId)
    : inquilinos;

  const totalUnidades = unids.length;
  const unidadesOcupadas = unids.filter((u) => u.estado === "Ocupado").length;
  const rentaPotencialMensual = unids
    .filter((u) => u.estado === "Ocupado")
    .reduce((s, u) => s + Number(u.renta_vigente || 0), 0);

  const anioActual = hoy.getFullYear();
  const mesActualClave = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  const mesAnteriorDate = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const mesAnteriorClave = `${mesAnteriorDate.getFullYear()}-${String(mesAnteriorDate.getMonth() + 1).padStart(2, "0")}`;
  const categoriaRentaId = categorias.find((c) => c.nombre === "Renta")?.id;
  // Se acepta el nombre nuevo ("Pagos a socios") y el viejo ("Retiros /
  // Socios") para que esto siga funcionando aunque todavía no hayas corrido
  // la migración 006 que renombra la categoría en Supabase.
  const categoriaPagosSociosId = categorias.find(
    (c) => c.nombre === "Pagos a socios" || c.nombre === "Retiros / Socios"
  )?.id;

  let ingresosMes = 0;
  let egresosMes = 0;
  let ingresosYTD = 0;
  let egresosYTD = 0;
  let rentaRecaudadaMes = 0;
  let saldoActual = 0;
  let pagosAdminJaimeTotal = 0;
  let pagosAdminJaimeYTD = 0;
  let pagosDuenosTotal = 0;
  let pagosDuenosYTD = 0;

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

    if (!esIngreso) {
      const texto = m.concepto ? normalizarTexto(m.concepto) : "";
      if (esPagoADuenos(texto)) {
        pagosDuenosTotal += monto;
        if (anio === anioActual) pagosDuenosYTD += monto;
      } else if (RE_ADMIN_JAIME.test(texto)) {
        // Un pago a Jaime Yepes contabilizado en "Pagos a socios" (p. ej. un
        // bono autorizado por los socios) cuenta como pago a los dueños, no
        // como gasto de administración — la categoría decide solo en este
        // caso puntual, nunca para gastos que no mencionan a Jaime ni a los
        // dueños (esos, aunque estén en Pagos a socios, no se cuentan aquí).
        const esPagosSocios = Boolean(categoriaPagosSociosId) && m.categoria_id === categoriaPagosSociosId;
        if (esPagosSocios) {
          pagosDuenosTotal += monto;
          if (anio === anioActual) pagosDuenosYTD += monto;
        } else {
          pagosAdminJaimeTotal += monto;
          if (anio === anioActual) pagosAdminJaimeYTD += monto;
        }
      }
    }

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

  // Top 5 categorías de gasto (año en curso) + "Otros", con su % del total.
  const categoriasOrdenadas = Array.from(porCategoriaEgreso.entries()).sort((a, b) => b[1] - a[1]);
  const top = categoriasOrdenadas.slice(0, 5);
  const resto = categoriasOrdenadas.slice(5).reduce((s, [, v]) => s + v, 0);
  const pctDe = (monto: number) => (egresosYTD > 0 ? Math.round((monto / egresosYTD) * 1000) / 10 : 0);
  const gastosPorCategoria: CategoriaMonto[] = top.map(([n, monto]) => ({ nombre: n, monto, pct: pctDe(monto) }));
  if (resto > 0) gastosPorCategoria.push({ nombre: "Otros", monto: resto, pct: pctDe(resto) });

  const ingresosMesAnterior = porMes.get(mesAnteriorClave)?.ingreso ?? 0;
  const egresosMesAnterior = porMes.get(mesAnteriorClave)?.egreso ?? 0;
  const margenYTDPct = ingresosYTD > 0 ? Math.round(((ingresosYTD - egresosYTD) / ingresosYTD) * 1000) / 10 : null;

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

  for (const i of inqs) {
    if (!i.contrato_activo || !i.fecha_inicio_contrato) continue;
    const mes = calcularMesContrato(i.fecha_inicio_contrato, hoy);
    if (mes === 12) {
      const unidad = unidadPorId.get(i.unidad_id);
      const prefijo = edificioId ? "" : `${nombreEdificioPorId.get(unidad?.edificio_id ?? "") ?? "?"} · `;
      const codigo = unidad?.codigo ? ` (unidad ${unidad.codigo})` : "";
      alertas.push({
        severidad: "warning",
        mensaje: `${prefijo}Contrato de ${i.nombre_arrendatario}${codigo} cumple un año este mes — renovar y ajustar el canon por inflación`,
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
    ingresosMesAnterior,
    egresosMesAnterior,
    saldoActual,
    ingresosYTD,
    egresosYTD,
    margenYTDPct,
    pagosAdminJaimeTotal,
    pagosAdminJaimeYTD,
    pagosDuenosTotal,
    pagosDuenosYTD,
    serieMensual,
    gastosPorCategoria,
    alertas,
  };
}
