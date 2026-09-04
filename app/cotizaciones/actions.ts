"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export type EstadoFormulario = {
  ok: boolean;
  mensaje: string;
} | null;

function leerCamposComunes(formData: FormData) {
  const montoTexto = String(formData.get("monto") ?? "").trim();
  return {
    proveedor_id: String(formData.get("proveedor_id") ?? "").trim() || null,
    edificio_id: String(formData.get("edificio_id") ?? "").trim() || null,
    unidad_id: String(formData.get("unidad_id") ?? "").trim() || null,
    fecha: String(formData.get("fecha") ?? "").trim() || null,
    descripcion: String(formData.get("descripcion") ?? "").trim(),
    monto: montoTexto ? Number(montoTexto) : null,
    estado: String(formData.get("estado") ?? "Pendiente").trim(),
    notas: String(formData.get("notas") ?? "").trim() || null,
  };
}

export async function crearCotizacion(
  _estadoAnterior: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  if (!supabase) {
    return { ok: false, mensaje: "La base de datos no está conectada." };
  }

  const campos = leerCamposComunes(formData);
  if (!campos.proveedor_id) {
    return { ok: false, mensaje: "Selecciona un proveedor." };
  }
  if (!campos.descripcion) {
    return { ok: false, mensaje: "La descripción es obligatoria." };
  }
  if (campos.monto === null || Number.isNaN(campos.monto)) {
    return { ok: false, mensaje: "El monto debe ser un número válido." };
  }

  const { error } = await supabase.from("cotizaciones").insert(campos);

  if (error) {
    return { ok: false, mensaje: `No se pudo guardar: ${error.message}` };
  }

  revalidatePath("/cotizaciones");
  return { ok: true, mensaje: "Cotización agregada." };
}

export async function editarCotizacion(
  id: string,
  _estadoAnterior: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  if (!supabase) {
    return { ok: false, mensaje: "La base de datos no está conectada." };
  }

  const campos = leerCamposComunes(formData);
  if (!campos.proveedor_id) {
    return { ok: false, mensaje: "Selecciona un proveedor." };
  }
  if (!campos.descripcion) {
    return { ok: false, mensaje: "La descripción es obligatoria." };
  }
  if (campos.monto === null || Number.isNaN(campos.monto)) {
    return { ok: false, mensaje: "El monto debe ser un número válido." };
  }

  const { error } = await supabase.from("cotizaciones").update(campos).eq("id", id);

  if (error) {
    return { ok: false, mensaje: `No se pudo guardar: ${error.message}` };
  }

  revalidatePath("/cotizaciones");
  revalidatePath(`/cotizaciones/${id}`);
  return { ok: true, mensaje: "Cambios guardados." };
}

export async function eliminarCotizacion(id: string) {
  if (!supabase) return;
  await supabase.from("cotizaciones").delete().eq("id", id);
  revalidatePath("/cotizaciones");
  redirect("/cotizaciones");
}
