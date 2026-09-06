"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EstadoFormulario = {
  ok: boolean;
  mensaje: string;
} | null;

export async function alternarDisponible(id: string, nuevoValor: boolean) {
  const supabase = await createClient();
  if (!supabase) return;

  await supabase.from("dotacion_unidad").update({ disponible: nuevoValor }).eq("id", id);

  revalidatePath("/dotacion");
}

export async function agregarItem(
  _estadoAnterior: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, mensaje: "La base de datos no está conectada." };
  }

  const unidad_id = String(formData.get("unidad_id") ?? "").trim();
  const item = String(formData.get("item") ?? "").trim();
  const disponible = formData.get("disponible") === "on";

  if (!unidad_id) return { ok: false, mensaje: "Selecciona el apartamento." };
  if (!item) return { ok: false, mensaje: "Escribe el nombre del ítem." };

  const { error } = await supabase.from("dotacion_unidad").insert({ unidad_id, item, disponible });

  if (error) {
    const mensaje = error.message.includes("unique")
      ? `Ese apartamento ya tiene un ítem "${item}".`
      : `No se pudo guardar: ${error.message}`;
    return { ok: false, mensaje };
  }

  revalidatePath("/dotacion");
  return { ok: true, mensaje: `"${item}" agregado.` };
}

export async function eliminarItem(id: string) {
  const supabase = await createClient();
  if (!supabase) return;

  await supabase.from("dotacion_unidad").delete().eq("id", id);

  revalidatePath("/dotacion");
}
