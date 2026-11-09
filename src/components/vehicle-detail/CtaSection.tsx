"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DUR, GSAP_EASE } from "@/lib/motion-tokens";
import { pegar } from "@/lib/texto";
import { registerGsap, prefersReduced, useMaskedLinesReveal } from "./useSectionReveal";

export function CtaSection({ isAMG }: { isAMG: boolean }) {
  const h2Ref = useRef<HTMLHeadingElement>(null);
  useMaskedLinesReveal(h2Ref);

  const containerRef = useRef<HTMLDivElement>(null);
  const primaryLabelRef = useRef<HTMLSpanElement>(null);
  const secondaryLabelRef = useRef<HTMLSpanElement>(null);
  const secondaryBorderRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (
      !el ||
      !primaryLabelRef.current ||
      !secondaryLabelRef.current ||
      !secondaryBorderRef.current
    )
      return;
    registerGsap();
    if (prefersReduced()) {
      gsap.set([primaryLabelRef.current, secondaryLabelRef.current], { yPercent: 0 });
      gsap.set(secondaryBorderRef.current, { scaleX: 1 });
      return;
    }
    gsap.set([primaryLabelRef.current, secondaryLabelRef.current], { yPercent: 100 });
    gsap.set(secondaryBorderRef.current, { scaleX: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.to(primaryLabelRef.current, {
      yPercent: 0,
      duration: DUR.element,
      ease: GSAP_EASE.secondary,
    });
    tl.to(
      secondaryLabelRef.current,
      { yPercent: 0, duration: DUR.element, ease: GSAP_EASE.secondary },
      "-=0.3"
    );
    tl.to(
      secondaryBorderRef.current,
      { scaleX: 1, duration: DUR.element, ease: GSAP_EASE.secondary },
      "<"
    );
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => tl.play(),
    });
    return () => {
      st.kill();
      tl.kill();
    };
  }, []);

  return (
    <section
      /* Sección blanca: en el celular el header se vuelve blanco al pasar (Navbar). */
      data-nav-mobile={isAMG ? undefined : "papel"}
      className={`py-32 md:py-40 relative ${
        isAMG
          ? "bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white"
          : "bg-white text-black"
      }`}
    >
      {isAMG && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amg-teal/40 to-transparent" />
      )}
      <div className="max-w-5xl mx-auto px-6 md:px-12 text-center" ref={containerRef}>
        <h2
          ref={h2Ref}
          className={`text-h1 font-light mb-6 tracking-tight ${
            isAMG ? "text-amg-teal" : ""
          }`}
        >
          ¿Te interesa este vehículo?
        </h2>
        <p
          className={`text-lg md:text-xl font-light mb-12 mx-auto ${
            isAMG ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {pegar("Contactame para conocer más detalles, disponibilidad y coordinar una visita personalizada")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Primario invertido — rectangular, sin rounded-full. */}
          <Link
            href="/contact"
            className={`inline-flex items-center justify-center px-10 py-4 font-light text-sm tracking-wider uppercase transition-colors duration-[var(--dur-element)] ease-[var(--ease-secondary)] ${
              isAMG
                ? "bg-amg-teal text-black hover:bg-amg-teal/90"
                : "bg-mb-black text-white hover:bg-neutral-800"
            }`}
          >
            <span className="block overflow-hidden">
              <span ref={primaryLabelRef} className="block">
                Contactame
              </span>
            </span>
          </Link>

          {/* Secundario outline — rectangular, sin rounded-full; borde se dibuja (scaleX). */}
          <Link
            href="/experiencia"
            className={`relative inline-flex items-center justify-center px-10 py-4 border border-transparent font-light text-sm tracking-wider uppercase transition-colors duration-[var(--dur-element)] ease-[var(--ease-secondary)] ${
              isAMG
                ? "text-white hover:bg-amg-teal/10"
                : "text-black hover:bg-black hover:text-white"
            }`}
          >
            <span
              aria-hidden
              data-chrome
              ref={secondaryBorderRef}
              className={`pointer-events-none absolute inset-0 origin-left border ${
                isAMG ? "border-amg-teal/50" : "border-black/30"
              }`}
            />
            <span className="relative block overflow-hidden">
              <span ref={secondaryLabelRef} className="block">
                Ver más vehículos
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
