"use client";

import { useRef } from "react";
import { ColorCarousel } from "./ColorCarousel";
import { useMaskedLinesReveal } from "./useSectionReveal";
import { waLink } from "@/lib/site";

export function ColorsSection({
  vehicleId,
  vehicleName,
  colorImages,
  isAMG,
}: {
  vehicleId: string;
  vehicleName?: string;
  colorImages?: { num: number; format: string }[];
  isAMG: boolean;
}) {
  // El carrusel muestra los colores que tenemos en foto; puede haber más en el mercado
  // (2026-11-06, Mateo: "pone en algún lado consultanos para más colores").
  const consulta = waLink(
    // "del GLA" / "del Clase G" no suena bien: el nombre va entre paréntesis
    `Hola Leonardo, quería consultar por otros colores${vehicleName ? ` (${vehicleName.trim()})` : ""}.`
  );
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

        <ColorCarousel vehicleId={vehicleId} images={colorImages} isAMG={isAMG} />

        {/* En el celular, una oración por línea (regla de saltos de línea) y con aire
            para que el botón flotante de "volver arriba" no tape el link. */}
        <p
          className={`mt-12 text-center text-sm max-sm:px-12 ${
            isAMG ? "text-white/60" : "text-ink-60"
          }`}
        >
          <span className="whitespace-nowrap max-sm:block">¿Buscás otro color?</span>{" "}
          <a
            href={consulta}
            target="_blank"
            rel="noopener noreferrer"
            className={`whitespace-nowrap max-sm:inline-block max-sm:mt-1 underline underline-offset-4 decoration-1 transition-colors duration-[var(--dur-micro)] ${
              isAMG ? "text-white hover:text-amg-teal" : "text-ink hover:text-ink-60"
            }`}
          >
            Consultanos por más colores
          </a>
        </p>
      </div>
    </section>
  );
}
