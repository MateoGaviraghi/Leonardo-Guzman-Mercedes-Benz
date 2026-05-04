"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Smooth scroll global con Lenis + sincronización GSAP/ScrollTrigger.
 *
 * - Skip total si `prefers-reduced-motion: reduce`
 * - Skip en mobile (< 1024px) — el momentum nativo iOS/Android es superior
 * - Usa `gsap.ticker` como rAF central para que Lenis y ScrollTrigger lean el mismo frame
 * - `lenis.on("scroll", ScrollTrigger.update)` — sin esto los pin/scrub saltan
 * - Guard global anti-double-register de ScrollTrigger durante HMR
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Registrar ScrollTrigger PRIMERO — el resto de la app lo usa aunque el
    // smooth-scroll esté apagado (mobile / reduced-motion). Idempotente con
    // guard global anti-double-register en HMR.
    const w = window as Window & { __gsapScrollTriggerRegistered?: boolean };
    if (!w.__gsapScrollTriggerRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      w.__gsapScrollTriggerRegistered = true;
    }

    // Respect reduced-motion: ScrollTrigger sigue activo, pero sin Lenis.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    // Mobile / tablet portrait: scroll nativo es mejor.
    if (window.innerWidth < 1024) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      smoothWheel: true,
    });

    // Sync: cada vez que Lenis emite scroll, ScrollTrigger recalcula triggers.
    lenis.on("scroll", ScrollTrigger.update);

    // Ticker compartido: GSAP avanza el rAF, Lenis tickea con el mismo time.
    const ticker = (time: number) => {
      // gsap.ticker entrega el time en segundos; Lenis espera ms.
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
