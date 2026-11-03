"use client";

import { motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { Vehicle } from "@/data/vehicles";
import { DUR, EASE } from "@/lib/motion-tokens";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { useMaskedLinesReveal } from "./useSectionReveal";

// Layout effect que funciona en SSR (client component) sin warning.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Parser determinístico del valor de un aspecto.
 * Divide el string en:
 *  - prefix: prosa ANTES del primer dígito (trimmed) — puede quedar vacío.
 *  - hero:   desde el primer dígito hasta el final (número(s) + unidades).
 * Sin dígitos -> todo prosa (hero = string completo, prefix vacío).
 * NINGÚN token del string original se pierde (prefix + hero cubren todo el contenido).
 */
function splitValor(valor: string): { prefix: string; hero: string } {
  const idx = valor.search(/\d/);
  if (idx < 0) {
    return { prefix: "", hero: valor.trim() };
  }
  return {
    prefix: valor.slice(0, idx).trim(),
    hero: valor.slice(idx).trim(),
  };
}

/**
 * Héroe numérico RESALTADO (no enorme) en una sola línea (whitespace-nowrap: JAMÁS corta ni wrapea).
 * Si el string excepcionalmente no entra en su columna, baja el font-size SOLO de esta
 * carta hasta que quepa (fit-to-width). Nunca corta, nunca oculta.
 */
function HeroValue({
  text,
  reduced,
  delay,
  isAMG,
}: {
  text: string;
  reduced: boolean;
  delay: number;
  isAMG: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      // Reset al tamaño natural (clamp del className) antes de medir.
      el.style.fontSize = "";
      // scrollWidth > clientWidth -> el nowrap desborda su columna: encoger.
      if (el.scrollWidth > el.clientWidth + 1) {
        const current = parseFloat(getComputedStyle(el).fontSize);
        const scaled = current * (el.clientWidth / el.scrollWidth) * 0.97;
        el.style.fontSize = `${Math.floor(scaled)}px`;
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: "100%" }}
      whileInView={reduced ? undefined : { opacity: 1, y: "0%" }}
      animate={reduced ? { opacity: 1, y: "0%" } : undefined}
      viewport={{ once: true }}
      transition={{ duration: DUR.element, ease: EASE.secondary, delay }}
      className={`min-w-0 whitespace-nowrap font-light leading-[1.0] tracking-tight tabular-nums text-[clamp(1.75rem,6vw,2rem)] lg:text-[clamp(2.25rem,2vw+1rem,3rem)] ${
        isAMG ? "text-amg-teal" : "text-white"
      }`}
    >
      {text}
    </motion.div>
  );
}

export function AspectosSection({ vehicle, isAMG }: { vehicle: Vehicle; isAMG: boolean }) {
  const reduced = usePrefersReducedMotion();
  const h2Ref = useRef<HTMLHeadingElement>(null);
  useMaskedLinesReveal(h2Ref);

  if (!vehicle.aspecto1Valor) return null;

  const aspectoCount = [1, 2, 3, 4].filter(
    (n) => vehicle[`aspecto${n}Valor` as keyof Vehicle]
  ).length;
  const gridColsClass =
    aspectoCount === 4 ? "lg:grid-cols-4"
    : aspectoCount === 3 ? "lg:grid-cols-3"
    : aspectoCount === 2 ? "lg:grid-cols-2"
    : "lg:grid-cols-1";

  let order = -1;

  return (
    <section
      className={`py-16 sm:py-20 md:py-24 lg:py-32 text-white relative overflow-hidden ${
        isAMG ? "bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950" : "bg-black"
      }`}
    >
      {isAMG && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amg-teal/40 to-transparent" />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Título degradado a eyebrow mono tracked silver, arriba-izquierda (ya NO display centrado) */}
        <h2
          ref={h2Ref}
          data-chrome
          className={`text-eyebrow font-mono uppercase tracking-[0.25em] mb-10 sm:mb-14 md:mb-20 text-left ${
            isAMG ? "text-amg-teal" : "text-silver-500"
          }`}
        >
          Aspectos Destacados
        </h2>

        {/* Data Ledger — desktop: N columnas izq, gap>=64px, sin cajas.
            Mobile: filas apiladas full-bleed, hairline estructural entre filas. */}
        <div
          className={`grid grid-cols-1 ${gridColsClass} gap-0 lg:gap-16 divide-y lg:divide-y-0 ${
            isAMG ? "divide-amg-teal/15" : "divide-white/10"
          }`}
        >
          {[1, 2, 3, 4].map((num) => {
            const valor = vehicle[`aspecto${num}Valor` as keyof Vehicle] as string | undefined;
            const label = vehicle[`aspecto${num}Label` as keyof Vehicle] as string | undefined;
            if (!valor) return null;
            order += 1;
            const delay = order * 0.07; // stagger 70ms (INTENT: DETAIL 60-80ms); delay != duration -> kill-list OK

            const { prefix, hero } = splitValor(valor);

            return (
              <div key={num} className="min-w-0 py-8 lg:py-0 text-left">
                {/* Prefix: prosa descriptiva ARRIBA del héroe. Wrap NORMAL por palabras
                    (overflow-wrap: normal) — PROHIBIDO break-words/break-all/hyphens.
                    Fila de altura fija -> baseline compartido entre columnas (con/sin prefix). */}
                <div className="min-w-0 flex items-start lg:min-h-[1.5rem]">
                  {prefix && (
                    <motion.p
                      initial={reduced ? false : { opacity: 0, y: 8 }}
                      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                      animate={reduced ? { opacity: 1, y: 0 } : undefined}
                      viewport={{ once: true }}
                      transition={{ duration: DUR.element, ease: EASE.secondary, delay }}
                      className="max-w-[22ch] text-sm leading-snug text-silver-300 [overflow-wrap:normal]"
                    >
                      {prefix}
                    </motion.p>
                  )}
                </div>

                {/* HÉROE numérico RESALTADO — clip vertical (mask overflow-hidden) + reveal */}
                <div className="mt-2 overflow-hidden">
                  <HeroValue text={hero} reduced={reduced} delay={delay + 0.06} isAMG={isAMG} />
                </div>

                {/* Label (eyebrow mono): eyebrow ABAJO del héroe */}
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                  animate={reduced ? { opacity: 1, y: 0 } : undefined}
                  viewport={{ once: true }}
                  transition={{ duration: DUR.element, ease: EASE.secondary, delay: delay + 0.12 }}
                  className={`mt-3 min-w-0 text-eyebrow font-mono uppercase tracking-[0.2em] ${
                    isAMG ? "text-amg-teal/80" : "text-silver-500"
                  }`}
                >
                  {label}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
