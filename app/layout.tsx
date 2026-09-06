import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "García-Yepes Inmuebles — Administración",
  description: "App de administración de propiedades de García-Yepes Inmuebles",
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
