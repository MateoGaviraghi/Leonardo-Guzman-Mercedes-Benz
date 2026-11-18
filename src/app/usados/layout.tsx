import type { Metadata } from "next";
import type { ReactNode } from "react";

// contact.md §2 — metadata exportada desde un Server Component porque
// src/app/usados/page.tsx es "use client" y no puede exportar `metadata`.
export const metadata: Metadata = {
  title: "Usados — Leonardo Guzmán | Mercedes-Benz, Paraná",
  description:
    "Autos, utilitarios y camiones Mercedes-Benz usados en Automotores Mega SA, Paraná, Entre Ríos. Consultá las unidades disponibles con Leonardo Guzmán.",
};

export default function UsadosLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
