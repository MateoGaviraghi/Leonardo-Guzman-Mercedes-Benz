import type { Metadata } from "next";

// about.md §2 — metadata exportada desde Server wrapper porque page.tsx
// es Client component (framer-motion). "Guzmán" con tilde acá y en alt/caption.
export const metadata: Metadata = {
  title:
    "Sobre mí — Leonardo Guzmán, asesor Mercedes-Benz | Automotores Mega, Paraná",
  description:
    "Promotor oficial Mercedes-Benz en Automotores Mega S.A., Paraná. 25 años de experiencia en el rubro automotriz. Atención personal en todas las etapas.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
