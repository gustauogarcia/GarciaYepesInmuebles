"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstadoFormulario = {
  ok: boolean;
  mensaje: string;
} | null;

function leerCamposComunes(formData: FormData) {
  return {
    unidad_id: String(formData.get("unidad_id") ?? "").trim() || null,
    nombre_arrendatario: String(formData.get("nombre_arrendatario") ?? "").trim(),
    telefono: String(formData.get("telefono") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    nombre_codeudor: String(formData.get("nombre_codeudor") ?? "").trim() || null,
    telefono_codeudor: String(formData.get("telefono_codeudor") ?? "").trim() || null,
    fecha_inicio_contrato: String(formData.get("fecha_inicio_contrato") ?? "").trim() || null,
    contrato_activo: formData.get("contrato_activo") === "on",
    notas: String(formData.get("notas") ?? "").trim() || null,
  };
}

function validar(campos: ReturnType<typeof leerCamposComunes>) {
  if (!campos.unidad_id) return "Selecciona el apartamento.";
  if (!campos.nombre_arrendatario) return "El nombre del arrendatario es obligatorio.";
  return null;
}

// Actualiza el estado de la unidad (Ocupado/Vacante) según si le queda algún
// contrato activo. Se llama después de crear, editar o borrar un inquilino.
async function sincronizarEstadoUnidad(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  unidadId: string
) {
  const { data: activos } = await supabase
    .from("inquilinos")
    .select("id")
    .eq("unidad_id", unidadId)
    .eq("contrato_activo", true)
    .limit(1);

  await supabase
    .from("unidades")
    .update({ estado: activos && activos.length > 0 ? "Ocupado" : "Vacante" })
    .eq("id", unidadId);
}

export async function crearInquilino(
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

  const { error: errorInsert } = await supabase.from("inquilinos").insert(campos);

  if (errorInsert) {
    return { ok: false, mensaje: `No se pudo guardar: ${errorInsert.message}` };
  }

  await sincronizarEstadoUnidad(supabase, campos.unidad_id as string);

  revalidatePath("/inquilinos");
  revalidatePath("/unidades");
  revalidatePath("/");
  return { ok: true, mensaje: `Inquilino "${campos.nombre_arrendatario}" agregado.` };
}

export async function editarInquilino(
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

  const { error: errorUpdate } = await supabase.from("inquilinos").update(campos).eq("id", id);

  if (errorUpdate) {
    return { ok: false, mensaje: `No se pudo guardar: ${errorUpdate.message}` };
  }

  await sincronizarEstadoUnidad(supabase, campos.unidad_id as string);

  revalidatePath("/inquilinos");
  revalidatePath(`/inquilinos/${id}`);
  revalidatePath("/unidades");
  revalidatePath("/");
  return { ok: true, mensaje: "Cambios guardados." };
}

export async function eliminarInquilino(id: string) {
  const supabase = await createClient();
  if (!supabase) return;

  const { data: inquilino } = await supabase
    .from("inquilinos")
    .select("unidad_id")
    .eq("id", id)
    .maybeSingle();

  await supabase.from("inquilinos").delete().eq("id", id);

  if (inquilino?.unidad_id) {
    await sincronizarEstadoUnidad(supabase, inquilino.unidad_id);
  }

  revalidatePath("/inquilinos");
  revalidatePath("/unidades");
  revalidatePath("/");
  redirect("/inquilinos");
}
