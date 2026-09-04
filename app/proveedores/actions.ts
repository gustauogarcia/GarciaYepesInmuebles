"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export type EstadoFormulario = {
  ok: boolean;
  mensaje: string;
} | null;

export async function crearProveedor(
  _estadoAnterior: EstadoFormulario,
  formData: FormData
): Promise<EstadoFormulario> {
  if (!supabase) {
    return { ok: false, mensaje: "La base de datos no está conectada." };
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) {
    return { ok: false, mensaje: "El nombre del proveedor es obligatorio." };
  }

  const categoriaProveedorId = String(formData.get("categoria_proveedor_id") ?? "").trim() || null;
  const documento = String(formData.get("documento") ?? "").trim() || null;
  const contactoNombre = String(formData.get("contacto_nombre") ?? "").trim() || null;
  const telefono = String(formData.get("telefono") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const direccion = String(formData.get("direccion") ?? "").trim() || null;
  const notas = String(formData.get("notas") ?? "").trim() || null;

  const { error } = await supabase.from("proveedores").insert({
    nombre,
    categoria_proveedor_id: categoriaProveedorId,
    documento,
    contacto_nombre: contactoNombre,
    telefono,
    email,
    direccion,
    notas,
  });

  if (error) {
    return { ok: false, mensaje: `No se pudo guardar: ${error.message}` };
  }

  revalidatePath("/proveedores");
  return { ok: true, mensaje: `Proveedor "${nombre}" agregado.` };
}
