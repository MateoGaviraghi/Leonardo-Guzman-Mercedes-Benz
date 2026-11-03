import type { Metadata } from "next";
import type { ReactNode } from "react";

// contact.md §2 — metadata exportada desde un Server Component porque
// src/app/plan-ahorro/page.tsx es "use client" y no puede exportar `metadata`.
export const metadata: Metadata = {
  title: "Plan de Ahorro — Leonardo Guzmán | Mercedes-Benz, Paraná",
  description:
    "Accedé a tu Mercedes-Benz a través del plan de ahorro oficial. Consultá con Leonardo Guzmán en Automotores Mega S.A., Paraná, Entre Ríos.",
};

export default function PlanAhorroLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
