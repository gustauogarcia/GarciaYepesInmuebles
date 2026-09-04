"use server";

import { redirect } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

export type EstadoLogin = {
  ok: boolean;
  mensaje: string;
} | null;

export async function iniciarSesion(
  _estadoAnterior: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  if (!supabaseConfigured) {
    return { ok: false, mensaje: "La base de datos no está conectada." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirigirA = String(formData.get("redirigir") ?? "/") || "/";

  if (!email || !password) {
    return { ok: false, mensaje: "Ingresa tu correo y tu contraseña." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, mensaje: "La base de datos no está conectada." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, mensaje: "Correo o contraseña incorrectos." };
  }

  redirect(redirigirA.startsWith("/") ? redirigirA : "/");
}

export async function cerrarSesion() {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/login");
}
