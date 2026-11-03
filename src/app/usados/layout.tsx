import type { Metadata } from "next";
import type { ReactNode } from "react";

// contact.md §2 — metadata exportada desde un Server Component porque
// src/app/usados/page.tsx es "use client" y no puede exportar `metadata`.
export const metadata: Metadata = {
  title: "Usados — Leonardo Guzmán | Mercedes-Benz, Paraná",
  description:
    "Vehículos usados Mercedes-Benz con calidad certificada e historia comprobada. Consultá el stock disponible con Leonardo Guzmán en Automotores Mega S.A., Paraná, Entre Ríos.",
};

export default function UsadosLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
