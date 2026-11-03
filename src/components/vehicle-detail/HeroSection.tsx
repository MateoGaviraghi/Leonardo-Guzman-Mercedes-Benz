"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { Vehicle } from "@/data/vehicles";
import { DUR, EASE, GSAP_EASE, HERO_DELAY, DETAIL } from "@/lib/motion-tokens";
import { MultiFormatImage } from "./MultiFormatImage";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export function HeroSection({
  vehicle,
  isAMG,
  basePath,
  heroImageBase,
}: {
  vehicle: Vehicle;
  isAMG: boolean;
  basePath: string;
  heroImageBase?: { desktop: string; mobile: string };
}) {
  const reduced = usePrefersReducedMotion();
  const heroBase = heroImageBase ?? {
    desktop: `${basePath}/hero/hero`,
    mobile: `${basePath}/hero/hero-mobile`,
  };

  const heroRef = useRef<HTMLElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroCategoryRef = useRef<HTMLParagraphElement>(null);
  const heroH1Ref = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroIndicatorRef = useRef<HTMLDivElement>(null);
  const heroSwipeRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const kenBurnsRef = useRef<HTMLDivElement>(null);

  // Pre-hide sincrónico (antes del paint) de la tipografía para que no haya
  // flash antes de la secuencia de entrada. En reduced-motion se muestra
  // estático.
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const isReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const copyEls = [
      heroBadgeRef.current,
      heroCategoryRef.current,
      heroSubRef.current,
      heroIndicatorRef.current,
      heroSwipeRef.current,
    ].filter((el): el is NonNullable<typeof el> => Boolean(el));

    if (isReduced) {
      gsap.set(copyEls, { opacity: 1, y: 0 });
      if (heroH1Ref.current) gsap.set(heroH1Ref.current, { autoAlpha: 1 });
      if (kenBurnsRef.current) gsap.set(kenBurnsRef.current, { scale: 1 });
    } else {
      gsap.set(copyEls, { opacity: 0, y: 16 });
      if (heroH1Ref.current) gsap.set(heroH1Ref.current, { autoAlpha: 0 });
    }
  }, []);

  // ---- Hero cinematográfico canónico: SplitText chars + Ken Burns + parallax
  useEffect(() => {
    if (typeof window === "undefined" || !heroRef.current) return;

    const w = window as Window & {
      __gsapScrollTriggerRegistered?: boolean;
      __gsapSplitTextRegistered?: boolean;
    };
    if (!w.__gsapScrollTriggerRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      w.__gsapScrollTriggerRegistered = true;
    }
    if (!w.__gsapSplitTextRegistered) {
      gsap.registerPlugin(SplitText);
      w.__gsapSplitTextRegistered = true;
    }

    const isReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const copyEls = [
      heroBadgeRef.current,
      heroCategoryRef.current,
      heroSubRef.current,
      heroIndicatorRef.current,
      heroSwipeRef.current,
    ].filter((el): el is NonNullable<typeof el> => Boolean(el));

    if (isReduced) {
      // Estado estático ya seteado por el layout effect; nada que animar.
      gsap.set(copyEls, { opacity: 1, y: 0 });
      if (heroH1Ref.current) gsap.set(heroH1Ref.current, { opacity: 1 });
      if (kenBurnsRef.current) gsap.set(kenBurnsRef.current, { scale: 1 });
      return;
    }

    gsap.set(copyEls, { opacity: 0, y: 16 });
    if (heroH1Ref.current) gsap.set(heroH1Ref.current, { autoAlpha: 0 });

    // Secuencia copy: categoría → (h1 vía SplitText) → subtitle → indicator.
    const tl = gsap.timeline({ delay: HERO_DELAY });
    if (heroBadgeRef.current)
      tl.to(heroBadgeRef.current, {
        opacity: 1,
        y: 0,
        duration: DUR.element,
        ease: GSAP_EASE.secondary,
      });
    tl.to(
      heroCategoryRef.current,
      {
        opacity: 1,
        y: 0,
        duration: DUR.element,
        ease: GSAP_EASE.secondary,
      },
      heroBadgeRef.current ? "-=0.35" : 0,
    )
      .to(
        heroSubRef.current,
        {
          opacity: 1,
          y: 0,
          duration: DUR.element,
          ease: GSAP_EASE.secondary,
        },
        "-=0.35",
      )
      .to(
        [heroIndicatorRef.current, heroSwipeRef.current].filter(Boolean),
        {
          opacity: 1,
          y: 0,
          duration: DUR.element,
          ease: GSAP_EASE.secondary,
        },
        "-=0.3",
      );

    // El H1 nunca debe quedar atrapado invisible si SplitText tarda o falla.
    const safety = window.setTimeout(() => {
      if (heroH1Ref.current) gsap.set(heroH1Ref.current, { autoAlpha: 1 });
    }, 1500);

    let split: SplitText | undefined;
    document.fonts.ready.then(() => {
      window.clearTimeout(safety);
      if (!heroH1Ref.current) return;
      split = SplitText.create(heroH1Ref.current, {
        type: "chars, words",
        mask: "chars",
        autoSplit: true,
        onSplit(self) {
          return gsap
            .timeline({ delay: HERO_DELAY + 0.05 })
            .set(heroH1Ref.current, { autoAlpha: 1 })
            .from(self.chars, {
              yPercent: 120,
              duration: DUR.hero,
              ease: GSAP_EASE.primary,
              stagger: 0.018,
            });
        },
      });
    });

    // Ken Burns: la imagen entra 1.08 → 1 (solo transform).
    let kenBurns: gsap.core.Tween | undefined;
    if (kenBurnsRef.current) {
      kenBurns = gsap.fromTo(
        kenBurnsRef.current,
        { scale: 1.08 },
        {
          scale: 1,
          duration: DETAIL.kenBurns,
          ease: GSAP_EASE.primary,
        },
      );
    }

    // Parallax scrub: travel menor en mobile (personalidad propia).
    let parallax: ScrollTrigger | undefined;
    if (parallaxRef.current) {
      const yPercent = window.matchMedia("(max-width: 767px)").matches
        ? DETAIL.parallaxYPercentMobile
        : DETAIL.parallaxYPercent;
      const tween = gsap.to(parallaxRef.current, {
        yPercent,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      parallax = tween.scrollTrigger;
    }

    return () => {
      window.clearTimeout(safety);
      tl.kill();
      split?.revert();
      kenBurns?.kill();
      parallax?.kill();
    };
  }, []);

  // Bloque tipográfico compartido — texto y refs idénticos.
  const heroCopy = (
    <>
      {isAMG && (
        <div ref={heroBadgeRef} className="inline-flex items-center gap-3 mb-4 sm:mb-5">
          <span className="text-eyebrow tracking-[0.3em] text-amg-teal uppercase bg-amg-teal/10 px-3 py-1.5 border border-amg-teal/30">
            AMG Performance
          </span>
        </div>
      )}
      <p
        ref={heroCategoryRef}
        className={`text-eyebrow tracking-[0.2em] mb-3 uppercase ${
          isAMG ? "text-amg-teal/80" : "text-white/70"
        }`}
      >
        {vehicle.category}
      </p>
      <h1
        ref={heroH1Ref}
        className="text-display-1 font-display font-medium mb-6 text-balance text-white [letter-spacing:-0.025em]"
      >
        {vehicle.name}
      </h1>
      {vehicle.subtitle && (
        <p
          ref={heroSubRef}
          className={`text-lead max-w-2xl font-light ${
            isAMG ? "text-gray-300" : "text-white/80"
          }`}
        >
          {vehicle.subtitle}
        </p>
      )}
    </>
  );

  // ======================= FULL-BLEED (idéntico a hoy) ==================
  return (
    <section
      ref={heroRef}
      className="relative h-[100svh] w-full overflow-hidden bg-[linear-gradient(160deg,var(--color-silver-700)_0%,var(--color-surface-2)_100%),radial-gradient(ellipse_160%_110%_at_50%_100%,color-mix(in_srgb,var(--color-silver-500)_45%,transparent)_0%,transparent_70%)] md:bg-[linear-gradient(135deg,var(--color-silver-700),var(--color-surface-2))]"
    >
      {/* Capa de imagen — parallax (outer) + Ken Burns (inner). Buffer de 6%
          para que el parallax nunca revele el borde del gradiente. */}
      <div
        ref={parallaxRef}
        className="absolute inset-x-0 -top-[6%] h-[112%] will-change-transform"
      >
        <div ref={kenBurnsRef} className="relative h-full w-full will-change-transform">
          {/* Mobile Hero - visible only on screens < 768px */}
          <MultiFormatImage
            basePath={heroBase.mobile}
            alt={vehicle.name}
            className="object-cover md:hidden"
            priority
            sizes="100vw"
          />

          <MultiFormatImage
            basePath={heroBase.desktop}
            alt={vehicle.name}
            fill
            className="object-cover hidden md:block"
            priority
            sizes="100vw"
          />
        </div>
      </div>

      {/* Scrim en capas — legibilidad sobre imagen; sobre el gradiente silver
          (empty-state) el tercio superior sigue mostrando el silver. */}
      <div
        aria-hidden
        className={`absolute inset-0 ${
          isAMG
            ? "bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,color-mix(in_srgb,var(--color-amg-teal)_6%,transparent)_45%,transparent_70%),radial-gradient(ellipse_70%_60%_at_18%_92%,rgba(0,0,0,0.55),transparent_60%)]"
            : "bg-[linear-gradient(to_top,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.22)_42%,transparent_68%),radial-gradient(ellipse_70%_60%_at_18%_92%,rgba(0,0,0,0.55),transparent_60%)]"
        }`}
      />

      {/* AMG Corner Accent */}
      {isAMG && (
        <div
          aria-hidden
          className="absolute top-0 right-0 w-64 h-64 opacity-30 pointer-events-none"
        >
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-amg-teal/30 to-transparent" />
        </div>
      )}

      {/* Contenido del hero */}
      <div className="absolute inset-0 flex items-end">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pb-16 sm:pb-20 md:pb-24">
          {heroCopy}
        </div>
      </div>

      {/* Scroll indicator desktop (mouse) — se conserva. */}
      <div
        ref={heroIndicatorRef}
        aria-hidden
        className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
          <motion.div
            animate={reduced ? undefined : { y: [0, 12, 0] }}
            transition={
              reduced
                ? undefined
                : { duration: DUR.hero, repeat: Infinity, ease: EASE.micro }
            }
            className="w-1 h-2 bg-white/60 rounded-full"
          />
        </div>
      </div>

      {/* Swipe hint mobile — personalidad propia: chevron descendente suave. */}
      <div
        ref={heroSwipeRef}
        aria-hidden
        className="md:hidden absolute bottom-7 left-1/2 -translate-x-1/2 text-white/55"
      >
        <motion.div
          animate={reduced ? undefined : { y: [0, 8, 0] }}
          transition={
            reduced
              ? undefined
              : { duration: DUR.hero, repeat: Infinity, ease: EASE.micro }
          }
        >
          <ChevronDown size={26} strokeWidth={1.5} />
        </motion.div>
      </div>
    </section>
  );
}
