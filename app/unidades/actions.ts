"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EstadoFormulario = {
  ok: boolean;
  mensaje: string;
} | null;

function leerCamposComunes(formData: FormData) {
  const rentaTexto = String(formData.get("renta_vigente") ?? "").trim();
  return {
    edificio_id: String(formData.get("edificio_id") ?? "").trim() || null,
    codigo: String(formData.get("codigo") ?? "").trim(),
    torre: String(formData.get("torre") ?? "").trim() || null,
    habitaciones: String(formData.get("habitaciones") ?? "").trim() || null,
    estado: String(formData.get("estado") ?? "Vacante").trim(),
    renta_vigente: rentaTexto ? Number(rentaTexto) : 0,
  };
}

function validar(campos: ReturnType<typeof leerCamposComunes>) {
  if (!campos.edificio_id) return "Selecciona un edificio.";
  if (!campos.codigo) return "El código del apartamento es obligatorio.";
  if (Number.isNaN(campos.renta_vigente)) return "La renta debe ser un número válido.";
  return null;
}

export async function crearUnidad(
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

  const { error: errorInsert } = await supabase.from("unidades").insert(campos);

  if (errorInsert) {
    const mensaje = errorInsert.message.includes("unique")
      ? `Ya existe un apartamento "${campos.codigo}" en ese edificio.`
      : `No se pudo guardar: ${errorInsert.message}`;
    return { ok: false, mensaje };
  }

  revalidatePath("/unidades");
  revalidatePath("/");
  return { ok: true, mensaje: `Apartamento "${campos.codigo}" agregado.` };
}

export async function editarUnidad(
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

  const { error: errorUpdate } = await supabase.from("unidades").update(campos).eq("id", id);

  if (errorUpdate) {
    return { ok: false, mensaje: `No se pudo guardar: ${errorUpdate.message}` };
  }

  revalidatePath("/unidades");
  revalidatePath(`/unidades/${id}`);
  revalidatePath("/");
  return { ok: true, mensaje: "Cambios guardados." };
}
