import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CIRSOC 301 — Columnas Armadas | Sistema Integral de Cálculo",
  description:
    "Diseño y verificación de Columnas Armadas según CIRSOC 301-2018 / AISC 360-16. Fase 1: Columnas Empresilladas con perfiles UPN.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
