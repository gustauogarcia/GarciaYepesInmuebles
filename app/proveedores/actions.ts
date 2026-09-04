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
    nombre: String(formData.get("nombre") ?? "").trim(),
    categoria_proveedor_id: String(formData.get("categoria_proveedor_id") ?? "").trim() || null,
    edificio_id: String(formData.get("edificio_id") ?? "").trim() || null,
    unidad_id: String(formData.get("unidad_id") ?? "").trim() || null,
    documento: String(formData.get("documento") ?? "").trim() || null,
    contacto_nombre: String(formData.get("contacto_nombre") ?? "").trim() || null,
    telefono: String(formData.get("telefono") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    direccion: String(formData.get("direccion") ?? "").trim() || null,
    notas: String(formData.get("notas") ?? "").trim() || null,
  };
}

export async function crearProveedor(
  _estadoAnterior: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, mensaje: "La base de datos no está conectada." };
  }

  const campos = leerCamposComunes(formData);
  if (!campos.nombre) {
    return { ok: false, mensaje: "El nombre del proveedor es obligatorio." };
  }

  const { error } = await supabase.from("proveedores").insert(campos);

  if (error) {
    return { ok: false, mensaje: `No se pudo guardar: ${error.message}` };
  }

  revalidatePath("/proveedores");
  return { ok: true, mensaje: `Proveedor "${campos.nombre}" agregado.` };
}

export async function editarProveedor(
  id: string,
  _estadoAnterior: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, mensaje: "La base de datos no está conectada." };
  }

  const campos = leerCamposComunes(formData);
  if (!campos.nombre) {
    return { ok: false, mensaje: "El nombre del proveedor es obligatorio." };
  }

  const { error } = await supabase.from("proveedores").update(campos).eq("id", id);

  if (error) {
    return { ok: false, mensaje: `No se pudo guardar: ${error.message}` };
  }

  revalidatePath("/proveedores");
  revalidatePath(`/proveedores/${id}`);
  return { ok: true, mensaje: "Cambios guardados." };
}

export async function eliminarProveedor(id: string) {
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.from("proveedores").delete().eq("id", id);
  revalidatePath("/proveedores");
  redirect("/proveedores");
}
