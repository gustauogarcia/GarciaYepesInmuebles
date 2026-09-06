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
    tipo: String(formData.get("tipo") ?? "").trim(),
    entidad_reguladora: String(formData.get("entidad_reguladora") ?? "").trim() || null,
    numero_referencia: String(formData.get("numero_referencia") ?? "").trim() || null,
    periodicidad: String(formData.get("periodicidad") ?? "").trim() || null,
    fecha_vencimiento: String(formData.get("fecha_vencimiento") ?? "").trim() || null,
    monto: montoTexto ? Number(montoTexto) : null,
    estado: String(formData.get("estado") ?? "Pendiente").trim(),
    notas: String(formData.get("notas") ?? "").trim() || null,
  };
}

function validar(campos: ReturnType<typeof leerCamposComunes>) {
  if (!campos.edificio_id) return "Selecciona un edificio.";
  if (!campos.tipo) return "El tipo de obligación es obligatorio.";
  return null;
}

export async function crearObligacion(
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

  const { error: errorInsert } = await supabase.from("obligaciones_regulatorias").insert(campos);

  if (errorInsert) {
    return { ok: false, mensaje: `No se pudo guardar: ${errorInsert.message}` };
  }

  revalidatePath("/obligaciones");
  return { ok: true, mensaje: `Obligación "${campos.tipo}" agregada.` };
}

export async function editarObligacion(
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

  const { error: errorUpdate } = await supabase
    .from("obligaciones_regulatorias")
    .update(campos)
    .eq("id", id);

  if (errorUpdate) {
    return { ok: false, mensaje: `No se pudo guardar: ${errorUpdate.message}` };
  }

  revalidatePath("/obligaciones");
  revalidatePath(`/obligaciones/${id}`);
  return { ok: true, mensaje: "Cambios guardados." };
}

export async function eliminarObligacion(id: string) {
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.from("obligaciones_regulatorias").delete().eq("id", id);
  revalidatePath("/obligaciones");
  redirect("/obligaciones");
}
