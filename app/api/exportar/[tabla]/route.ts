import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { generarCSV } from "@/lib/csv";

export const dynamic = "force-dynamic";

const TABLAS = [
  "edificios",
  "unidades",
  "inquilinos",
  "movimientos",
  "dotacion",
  "proveedores",
  "cotizaciones",
] as const;
type Tabla = (typeof TABLAS)[number];

function esTabla(valor: string): valor is Tabla {
  return (TABLAS as readonly string[]).includes(valor);
}

export async function GET(_request: Request, { params }: { params: Promise<{ tabla: string }> }) {
  const { tabla } = await params;

  if (!esTabla(tabla)) {
    return new Response("Tabla no reconocida para exportar.", { status: 404 });
  }
  if (!supabaseConfigured) {
    return new Response("La base de datos no está conectada.", { status: 503 });
  }
  const supabase = await createClient();
  if (!supabase) {
    return new Response("La base de datos no está conectada.", { status: 503 });
  }

  const { encabezados, filas } = await construirExportacion(supabase, tabla);
  const csv = generarCSV(encabezados, filas);
  const fecha = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${tabla}_${fecha}.csv"`,
    },
  });
}

type Fila = (string | number | boolean | null | undefined)[];

async function construirExportacion(
  supabase: SupabaseClient,
  tabla: Tabla
): Promise<{ encabezados: string[]; filas: Fila[] }> {
  // Mapas de apoyo que casi todas las tablas necesitan para mostrar nombres
  // en vez de ids (igual que se hace en las pantallas de la app).
  const [{ data: edificios }, { data: unidades }] = await Promise.all([
    supabase.from("edificios").select("id, nombre"),
    supabase.from("unidades").select("id, edificio_id, codigo"),
  ]);
  const nombreEdificio = new Map<string, string>(
    (edificios ?? []).map((e: { id: string; nombre: string }) => [e.id, e.nombre])
  );
  const unidadInfo = new Map<string, { codigo: string; edificio_id: string }>(
    (unidades ?? []).map((u: { id: string; codigo: string; edificio_id: string }) => [
      u.id,
      { codigo: u.codigo, edificio_id: u.edificio_id },
    ])
  );
  const propiedadDeUnidad = (unidadId: string | null) =>
    unidadId ? nombreEdificio.get(unidadInfo.get(unidadId)?.edificio_id ?? "") ?? "" : "";
  const codigoDeUnidad = (unidadId: string | null) => (unidadId ? unidadInfo.get(unidadId)?.codigo ?? "" : "");

  switch (tabla) {
    case "edificios": {
      const { data } = await supabase
        .from("edificios")
        .select("nombre, direccion, ciudad, pais, pct_administracion, fecha_corte")
        .order("nombre");
      return {
        encabezados: ["Propiedad", "Dirección", "Ciudad", "País", "% Administración", "Fecha de corte"],
        filas: (data ?? []).map((e) => [
          e.nombre,
          e.direccion,
          e.ciudad,
          e.pais,
          e.pct_administracion != null ? `${(Number(e.pct_administracion) * 100).toFixed(1)}%` : "",
          e.fecha_corte,
        ]),
      };
    }

    case "unidades": {
      const { data } = await supabase
        .from("unidades")
        .select("edificio_id, codigo, torre, habitaciones, estado, renta_vigente")
        .order("codigo");
      return {
        encabezados: ["Propiedad", "Unidad", "Torre", "Habitaciones", "Estado", "Renta vigente"],
        filas: (data ?? []).map((u) => [
          nombreEdificio.get(u.edificio_id) ?? "",
          u.codigo,
          u.torre,
          u.habitaciones,
          u.estado,
          u.renta_vigente,
        ]),
      };
    }

    case "inquilinos": {
      const { data } = await supabase
        .from("inquilinos")
        .select(
          "unidad_id, nombre_arrendatario, telefono, email, nombre_codeudor, telefono_codeudor, fecha_inicio_contrato, contrato_activo, notas"
        )
        .order("fecha_inicio_contrato", { ascending: false });
      return {
        encabezados: [
          "Propiedad",
          "Unidad",
          "Arrendatario",
          "Teléfono",
          "Email",
          "Codeudor",
          "Teléfono codeudor",
          "Inicio de contrato",
          "Contrato activo",
          "Notas",
        ],
        filas: (data ?? []).map((i) => [
          propiedadDeUnidad(i.unidad_id),
          codigoDeUnidad(i.unidad_id),
          i.nombre_arrendatario,
          i.telefono,
          i.email,
          i.nombre_codeudor,
          i.telefono_codeudor,
          i.fecha_inicio_contrato,
          i.contrato_activo,
          i.notas,
        ]),
      };
    }

    case "movimientos": {
      const [{ data }, { data: categorias }] = await Promise.all([
        supabase
          .from("movimientos")
          .select("edificio_id, unidad_id, fecha, tipo, categoria_id, concepto, comprobante, monto")
          .order("fecha", { ascending: false }),
        supabase.from("categorias_movimiento").select("id, nombre"),
      ]);
      const nombreCategoria = new Map<string, string>(
        (categorias ?? []).map((c: { id: string; nombre: string }) => [c.id, c.nombre])
      );
      return {
        encabezados: [
          "Propiedad",
          "Unidad",
          "Fecha",
          "Tipo",
          "Categoría",
          "Concepto",
          "Comprobante",
          "Monto",
        ],
        filas: (data ?? []).map((m) => [
          nombreEdificio.get(m.edificio_id) ?? "",
          codigoDeUnidad(m.unidad_id),
          m.fecha,
          m.tipo,
          nombreCategoria.get(m.categoria_id ?? "") ?? "",
          m.concepto,
          m.comprobante,
          m.monto,
        ]),
      };
    }

    case "dotacion": {
      const { data } = await supabase
        .from("dotacion_unidad")
        .select("unidad_id, item, disponible")
        .order("item");
      return {
        encabezados: ["Propiedad", "Unidad", "Ítem", "Disponible"],
        filas: (data ?? []).map((d) => [
          propiedadDeUnidad(d.unidad_id),
          codigoDeUnidad(d.unidad_id),
          d.item,
          d.disponible,
        ]),
      };
    }

    case "proveedores": {
      const [{ data }, { data: categorias }] = await Promise.all([
        supabase
          .from("proveedores")
          .select(
            "nombre, categoria_proveedor_id, edificio_id, unidad_id, documento, contacto_nombre, telefono, email, direccion, calificacion, notas, activo"
          )
          .order("nombre"),
        supabase.from("categorias_proveedor").select("id, categoria, subcategoria"),
      ]);
      const categoriaPorId = new Map<string, { categoria: string; subcategoria: string }>(
        (categorias ?? []).map((c: { id: string; categoria: string; subcategoria: string }) => [
          c.id,
          { categoria: c.categoria, subcategoria: c.subcategoria },
        ])
      );
      return {
        encabezados: [
          "Nombre",
          "Categoría",
          "Subcategoría",
          "Propiedad",
          "Unidad",
          "Documento",
          "Contacto",
          "Teléfono",
          "Email",
          "Dirección",
          "Calificación",
          "Notas",
          "Activo",
        ],
        filas: (data ?? []).map((p) => {
          const cat = categoriaPorId.get(p.categoria_proveedor_id ?? "");
          return [
            p.nombre,
            cat?.categoria ?? "",
            cat?.subcategoria ?? "",
            p.edificio_id ? nombreEdificio.get(p.edificio_id) ?? "" : "",
            codigoDeUnidad(p.unidad_id),
            p.documento,
            p.contacto_nombre,
            p.telefono,
            p.email,
            p.direccion,
            p.calificacion,
            p.notas,
            p.activo,
          ];
        }),
      };
    }

    case "cotizaciones": {
      const [{ data }, { data: proveedores }] = await Promise.all([
        supabase
          .from("cotizaciones")
          .select("proveedor_id, edificio_id, unidad_id, fecha, descripcion, monto, estado, notas")
          .order("fecha", { ascending: false }),
        supabase.from("proveedores").select("id, nombre"),
      ]);
      const nombreProveedor = new Map<string, string>(
        (proveedores ?? []).map((p: { id: string; nombre: string }) => [p.id, p.nombre])
      );
      return {
        encabezados: ["Proveedor", "Propiedad", "Unidad", "Fecha", "Descripción", "Monto", "Estado", "Notas"],
        filas: (data ?? []).map((c) => [
          nombreProveedor.get(c.proveedor_id) ?? "",
          c.edificio_id ? nombreEdificio.get(c.edificio_id) ?? "" : "",
          codigoDeUnidad(c.unidad_id),
          c.fecha,
          c.descripcion,
          c.monto,
          c.estado,
          c.notas,
        ]),
      };
    }
  }
}
