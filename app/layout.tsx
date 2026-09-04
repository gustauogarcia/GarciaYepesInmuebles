import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blanco y Negro — Administración",
  description: "App de administración del edificio Blanco y Negro",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
