"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EstadoFormulario = {
  ok: boolean;
  mensaje: string;
} | null;

// Alterna un ítem del tipo estándar para una unidad: si ya existe, invierte su
// disponibilidad; si todavía no se ha registrado para esa unidad, lo crea
// como disponible. Así la tabla se puede llenar con un clic por celda.
export async function alternarItemPorTipo(unidadId: string, item: string) {
  const supabase = await createClient();
  if (!supabase) return;

  const { data: existente } = await supabase
    .from("dotacion_unidad")
    .select("id, disponible")
    .eq("unidad_id", unidadId)
    .eq("item", item)
    .maybeSingle();

  if (existente) {
    await supabase
      .from("dotacion_unidad")
      .update({ disponible: !existente.disponible })
      .eq("id", existente.id);
  } else {
    await supabase.from("dotacion_unidad").insert({ unidad_id: unidadId, item, disponible: true });
  }

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
  const itemSeleccionado = String(formData.get("item") ?? "").trim();
  const itemPersonalizado = String(formData.get("item_personalizado") ?? "").trim();
  const item = itemSeleccionado === "__otro__" ? itemPersonalizado : itemSeleccionado;
  const disponible = formData.get("disponible") === "on";

  if (!unidad_id) return { ok: false, mensaje: "Selecciona el apartamento." };
  if (!item) return { ok: false, mensaje: "Escribe o selecciona el ítem." };

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
