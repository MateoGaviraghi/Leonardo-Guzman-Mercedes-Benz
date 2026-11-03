"use client";

import { useRef } from "react";
import Link from "next/link";
import type { Vehicle } from "@/data/vehicles";
import { MultiFormatImage } from "@/components/vehicle-detail/MultiFormatImage";
import { useMaskedLinesReveal } from "@/components/vehicle-detail/useSectionReveal";

/* ═══════════════════════════════════════════════
   TRUCK CTA — imagen + scrim aprobado, sin blur
   ═══════════════════════════════════════════════ */
export function TruckCta({
  vehicle,
  basePath,
  pdfs,
  onOpenModels,
}: {
  vehicle: Vehicle;
  basePath: string;
  pdfs: NonNullable<Vehicle["truckPdfs"]>;
  onOpenModels: () => void;
}) {
  const h2Ref = useRef<HTMLHeadingElement>(null);
  useMaskedLinesReveal(h2Ref);

  return (
    <section className="relative py-28 md:py-40 overflow-hidden bg-mb-black text-white">
      <div className="absolute inset-0" aria-hidden data-chrome>
        <MultiFormatImage
          basePath={`${basePath}/hero-mobile`}
          alt=""
          fill
          className="object-cover md:hidden"
        />
        <MultiFormatImage
          basePath={`${basePath}/hero`}
          alt=""
          fill
          className="object-cover hidden md:block"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.9),rgba(0,0,0,0.55)_60%,rgba(0,0,0,0.7))]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <p data-chrome className="text-eyebrow uppercase tracking-[0.3em] text-silver-500 mb-6">
          Leonardo Guzmán
        </p>

        <h2
          ref={h2Ref}
          data-chrome
          className="text-h1 font-light tracking-tight mb-6 leading-[1.1]"
        >
          Potencia que mueve
          <br />
          <span className="text-silver-300">tu negocio</span>
        </h2>

        <p data-chrome className="text-lead text-silver-300 mb-14 max-w-md mx-auto leading-relaxed">
          Consultanos por el {vehicle.name}, financiación y disponibilidad.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact"
            data-chrome
            className="inline-flex items-center justify-center bg-white text-black px-10 py-4 font-light text-sm tracking-wider uppercase transition-colors duration-[var(--dur-element)] ease-[var(--ease-secondary)] hover:bg-white/90"
          >
            Contactame
          </Link>
          {pdfs.length > 0 && (
            <button
              onClick={onOpenModels}
              data-chrome
              className="inline-flex items-center justify-center border border-white/30 text-white px-10 py-4 font-light text-sm tracking-wider uppercase transition-colors duration-[var(--dur-element)] ease-[var(--ease-secondary)] hover:border-white/60 hover:bg-white/5"
            >
              Ver modelos
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
