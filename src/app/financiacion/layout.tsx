import type { Metadata } from "next";
import type { ReactNode } from "react";

// contact.md §2 — metadata exportada desde un Server Component porque
// src/app/financiacion/page.tsx es "use client" y no puede exportar `metadata`.
export const metadata: Metadata = {
  title: "Financiación — Leonardo Guzmán | Mercedes-Benz, Paraná",
  description:
    "Financiación de vehículos Mercedes-Benz 0Km y usados, leasing y planes para flotas. Consultá con Leonardo Guzmán en Automotores Mega S.A., Paraná, Entre Ríos.",
};

export default function FinanciacionLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
