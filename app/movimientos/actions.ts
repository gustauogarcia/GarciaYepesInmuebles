"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstadoFormulario = {
  ok: boolean;
  mensaje: string;
} | null;

function leerCamposComunes(formData: FormData) {
  const montoTexto = String(formData.get("monto") ?? "").trim();
  return {
    edificio_id: String(formData.get("edificio_id") ?? "").trim() || null,
    unidad_id: String(formData.get("unidad_id") ?? "").trim() || null,
    fecha: String(formData.get("fecha") ?? "").trim() || null,
    tipo: String(formData.get("tipo") ?? "").trim(),
    categoria_id: String(formData.get("categoria_id") ?? "").trim() || null,
    concepto: String(formData.get("concepto") ?? "").trim() || null,
    comprobante: String(formData.get("comprobante") ?? "").trim() || null,
    monto: montoTexto ? Number(montoTexto) : null,
  };
}

function validar(campos: ReturnType<typeof leerCamposComunes>) {
  if (!campos.edificio_id) return "Selecciona un edificio.";
  if (!campos.fecha) return "La fecha es obligatoria.";
  if (campos.tipo !== "Ingreso" && campos.tipo !== "Egreso") {
    return "El tipo debe ser Ingreso o Egreso.";
  }
  if (campos.monto === null || Number.isNaN(campos.monto) || campos.monto <= 0) {
    return "El monto debe ser un número mayor que cero.";
  }
  return null;
}

export async function crearMovimiento(
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

  const { error: errorInsert } = await supabase.from("movimientos").insert(campos);

  if (errorInsert) {
    return { ok: false, mensaje: `No se pudo guardar: ${errorInsert.message}` };
  }

  revalidatePath("/movimientos");
  revalidatePath("/");
  return { ok: true, mensaje: `Movimiento registrado.` };
}

export async function editarMovimiento(
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

  const { error: errorUpdate } = await supabase.from("movimientos").update(campos).eq("id", id);

  if (errorUpdate) {
    return { ok: false, mensaje: `No se pudo guardar: ${errorUpdate.message}` };
  }

  revalidatePath("/movimientos");
  revalidatePath(`/movimientos/${id}`);
  revalidatePath("/");
  return { ok: true, mensaje: "Cambios guardados." };
}

export async function eliminarMovimiento(id: string) {
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.from("movimientos").delete().eq("id", id);
  revalidatePath("/movimientos");
  revalidatePath("/");
  redirect("/movimientos");
}
