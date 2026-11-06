"use client";

import { useRef } from "react";
import { ColorCarousel } from "./ColorCarousel";
import { useMaskedLinesReveal } from "./useSectionReveal";

export function ColorsSection({
  vehicleId,
  isAMG,
}: {
  vehicleId: string;
  isAMG: boolean;
}) {
  const h2Ref = useRef<HTMLHeadingElement>(null);
  useMaskedLinesReveal(h2Ref);

  return (
    <section
      /* Sección blanca: en el celular el header se vuelve blanco al pasar (Navbar). */
      data-nav-mobile={isAMG ? undefined : "papel"}
      className={`py-24 md:py-32 relative ${
        isAMG
          ? "bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white"
          : "bg-white text-black"
      }`}
    >
      {isAMG && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amg-teal/40 to-transparent" />
      )}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h2
          ref={h2Ref}
          className={`text-h1 font-light mb-16 text-center ${
            isAMG ? "text-amg-teal" : ""
          }`}
        >
          Colores Disponibles
        </h2>

        <ColorCarousel vehicleId={vehicleId} isAMG={isAMG} />
      </div>
    </section>
  );
}
