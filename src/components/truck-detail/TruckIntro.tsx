"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import type { Vehicle } from "@/data/vehicles";
import { DUR, EASE } from "@/lib/motion-tokens";
import { usePrefersReducedMotion } from "@/components/vehicle-detail/usePrefersReducedMotion";
import { useMaskedLinesReveal } from "@/components/vehicle-detail/useSectionReveal";

/* ═══════════════════════════════════════════════
   TRUCK INTRO — intro editorial 5+7 (§T·4.3).
   Estructura intacta: grid 12 (título 5 col / descripción 7 col,
   items-start). Datos byte-a-byte:
     · equipmentGeneralTitle → h2 (SIN data-chrome, es dato)
     · equipmentGeneralDescription → p (SIN data-chrome, es dato)
   El h2 entra con líneas ENMASCARADAS (useMaskedLinesReveal) — no
   fade+y plano — y la CLASE cambia a DS (text-h2 md:text-h1); el
   texto/case es dato (no hay uppercase por CSS → sentence-case se
   conserva del string). Eyebrow "Acerca del modelo" → data-chrome
   (entra con clip horizontal 0.1 antes). Condicionales intactos.
   ═══════════════════════════════════════════════ */
export function TruckIntro({ vehicle }: { vehicle: Vehicle }) {
  const reduced = usePrefersReducedMotion();
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  useMaskedLinesReveal(h2Ref, { eyebrowRef });

  if (!(vehicle.equipmentGeneralTitle || vehicle.equipmentGeneralDescription)) {
    return null;
  }

  return (
    <section className="py-24 md:py-32 bg-black">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {vehicle.equipmentGeneralTitle && (
            <div className="lg:col-span-5">
              <p
                ref={eyebrowRef}
                data-chrome
                className="text-eyebrow font-mono uppercase tracking-[0.3em] text-silver-500 mb-6"
              >
                Acerca del modelo
              </p>
              <h2
                ref={h2Ref}
                className="text-h2 md:text-h1 font-light tracking-tight leading-[1.15] text-white text-balance"
              >
                {vehicle.equipmentGeneralTitle}
              </h2>
            </div>
          )}
          {vehicle.equipmentGeneralDescription && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              animate={reduced ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true }}
              transition={{ duration: DUR.element, ease: EASE.secondary, delay: 0.1 }}
              className="lg:col-span-7 lg:pt-14"
            >
              <p className="text-lead font-light text-silver-300 leading-relaxed">
                {vehicle.equipmentGeneralDescription}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
