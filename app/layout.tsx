import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blanco y Negro — Administración",
  description: "App de administración del edificio Blanco y Negro",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 font-sans dark:bg-black">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
