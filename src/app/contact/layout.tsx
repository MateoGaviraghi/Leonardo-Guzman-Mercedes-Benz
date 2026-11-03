import type { Metadata } from "next";
import type { ReactNode } from "react";

// contact.md §2 — metadata exportada desde un Server Component porque
// src/app/contact/page.tsx es "use client" y no puede exportar `metadata`.
export const metadata: Metadata = {
  title: "Contacto — Leonardo Guzmán | Mercedes-Benz, Paraná",
  description:
    "Escribile a Leonardo Guzmán por WhatsApp. Automotores Mega S.A., Acceso Norte República de Entre Ríos 5660, Paraná, Entre Ríos.",
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
