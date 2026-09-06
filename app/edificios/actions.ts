"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EstadoFormulario = {
  ok: boolean;
  mensaje: string;
} | null;

function leerCamposComunes(formData: FormData) {
  const pctTexto = String(formData.get("pct_administracion") ?? "").trim();
  return {
    nombre: String(formData.get("nombre") ?? "").trim(),
    direccion: String(formData.get("direccion") ?? "").trim() || null,
    ciudad: String(formData.get("ciudad") ?? "").trim() || null,
    pais: String(formData.get("pais") ?? "Colombia").trim() || "Colombia",
    pct_administracion: pctTexto ? Number(pctTexto) / 100 : 0,
    fecha_corte: String(formData.get("fecha_corte") ?? "").trim() || null,
  };
}

function validar(campos: ReturnType<typeof leerCamposComunes>) {
  if (!campos.nombre) return "El nombre del edificio es obligatorio.";
  if (Number.isNaN(campos.pct_administracion)) {
    return "El porcentaje de administración debe ser un número.";
  }
  return null;
}

export async function crearEdificio(
  _estadoAnterior: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, mensaje: "La base de datos no está conectada." };
  }

  const campos = leerCamposComunes(formData);
  const error = validar(campos);
  if (error) return { ok: false, mensaje: error };

  const { error: errorInsert } = await supabase.from("edificios").insert(campos);

  if (errorInsert) {
    return { ok: false, mensaje: `No se pudo guardar: ${errorInsert.message}` };
  }

  revalidatePath("/edificios");
  revalidatePath("/");
  return { ok: true, mensaje: `Propiedad "${campos.nombre}" agregada.` };
}

export async function editarEdificio(
  id: string,
  _estadoAnterior: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, mensaje: "La base de datos no está conectada." };
  }

  const campos = leerCamposComunes(formData);
  const error = validar(campos);
  if (error) return { ok: false, mensaje: error };

  const { error: errorUpdate } = await supabase.from("edificios").update(campos).eq("id", id);

  if (errorUpdate) {
    return { ok: false, mensaje: `No se pudo guardar: ${errorUpdate.message}` };
  }

  revalidatePath("/edificios");
  revalidatePath(`/edificios/${id}`);
  revalidatePath("/");
  return { ok: true, mensaje: "Cambios guardados." };
}

// Nota: a propósito no hay una acción para borrar un edificio. Al borrarlo,
// la base de datos borraría en cascada TODAS sus unidades, inquilinos y
// movimientos históricos — demasiado riesgo para dejarlo a un clic desde la
// app. Si algún día hace falta, se hace directamente en Supabase con cuidado.
