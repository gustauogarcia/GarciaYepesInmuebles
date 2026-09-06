import type { Metadata, Viewport } from "next";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "García-Yepes Inmuebles — Administración",
  description: "App de administración de propiedades de García-Yepes Inmuebles",
};

// Ancho real del celular (no la versión "de escritorio encogida") en
// cualquier sistema operativo o navegador — es lo que hace que el resto del
// diseño responsivo (tablas con scroll horizontal propio, tarjetas en 1-2
// columnas, menú que se acomoda) funcione igual en iPhone y en Android.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-stone-50 font-sans dark:bg-stone-950 text-stone-900 dark:text-stone-50">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
