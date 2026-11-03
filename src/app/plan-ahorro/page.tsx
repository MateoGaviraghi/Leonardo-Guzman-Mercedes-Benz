"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { DUR, GSAP_EASE, HERO_DELAY } from "@/lib/motion-tokens";

// Tilt 3D (patrón Home / VehicleCard): rango contenido + spring de damping
// alto, sin overshoot — movimiento premium, geometría recta (cero radio).
const TILT_DEG = 6;
const TILT_SPRING = { stiffness: 260, damping: 30, mass: 0.6 };

function TiltCard({
  children,
  className = "",
  setRef,
}: {
  children: ReactNode;
  className?: string;
  setRef?: (el: HTMLDivElement | null) => void;
}) {
  const localRef = useRef<HTMLDivElement>(null);
  const tiltEnabled = useRef(false);

  useEffect(() => {
    tiltEnabled.current =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const rotateX = useSpring(rotateXRaw, TILT_SPRING);
  const rotateY = useSpring(rotateYRaw, TILT_SPRING);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!tiltEnabled.current || !localRef.current) return;
      const rect = localRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      rotateYRaw.set((px - 0.5) * TILT_DEG * 2);
      rotateXRaw.set(-(py - 0.5) * TILT_DEG * 2);
    },
    [rotateXRaw, rotateYRaw],
  );

  const handlePointerLeave = useCallback(() => {
    rotateXRaw.set(0);
    rotateYRaw.set(0);
  }, [rotateXRaw, rotateYRaw]);

  return (
    <div
      ref={(node) => {
        localRef.current = node;
        setRef?.(node);
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ perspective: 1200 }}
      className={className}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative flex h-full w-full flex-col will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}

/** CTA rectangular con fill-sweep (patrón Home/Financiación). Geometría recta, cero radio. */
function CtaSweep({
  href,
  children,
  onClick,
}: {
  href: string;
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const className =
    "group/cta relative inline-flex items-center justify-center gap-3 overflow-hidden border border-white/25 px-8 py-3.5 text-sm font-medium text-white transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] hover:border-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mb-blue";
  const inner = (
    <>
      <span
        aria-hidden
        className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-[var(--dur-element)] ease-[var(--ease-scrub)] group-hover/cta:scale-x-100"
      />
      <span className="relative z-10 flex items-center gap-3 transition-colors duration-[var(--dur-micro)] group-hover/cta:text-mb-black">
        {children}
      </span>
    </>
  );
  if (href.startsWith("#")) {
    return (
      <a href={href} onClick={onClick} className={className}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}

// Pilares: el "icono" ahora es el número — protagonista tipográfico en vez
// de glifos de librería. El pilar 01 conserva el counter GSAP (0→45, dato
// real); 02-04 son numerales grandes estáticos, misma familia visual.
// ─── Set de iconos custom premium (line-art propio, familia consistente:
// viewBox 32, stroke 1.3, currentColor — se adaptan a fondo negro/papel) ───
type IconName =
  | "shieldCheck"
  | "star"
  | "umbrella"
  | "coin"
  | "gavel"
  | "cycle"
  | "card"
  | "person"
  | "transfer";

const ICON_PATHS: Record<IconName, ReactNode> = {
  shieldCheck: (
    <>
      <path d="M16 3 27 7v8c0 7.5-5.5 12-11 14C10.5 27 5 22.5 5 15V7Z" />
      <path d="M11 15.5 14.5 19 21 12" />
    </>
  ),
  star: (
    <>
      <circle cx="16" cy="16" r="13" />
      <path d="M16 16V3" />
      <path d="M16 16 4.7 22.5" />
      <path d="M16 16 27.3 22.5" />
    </>
  ),
  umbrella: (
    <>
      <path d="M3 15c0-6.3 6-11 13-11s13 4.7 13 11" />
      <path d="M3 15c2-2.5 5-2.5 6.5 0C11 12.5 14 12.5 16 15c2-2.5 5-2.5 6.5 0C24 12.5 27 12.5 29 15" />
      <path d="M16 15v10" />
      <path d="M16 25c0 2.5-2.2 3.5-4 2.2" />
    </>
  ),
  coin: (
    <>
      <circle cx="16" cy="16" r="12" />
      <path d="M16 8v16" />
      <path d="M20 11.5c0-1.7-1.8-2.5-4-2.5-2.8 0-4.5 1.3-4.5 3 0 3.2 8.5 2.5 8.5 6 0 1.9-1.8 3-4 3-2.5 0-4.2-.9-4.2-2.6" />
    </>
  ),
  gavel: (
    <>
      <path d="M4 27h10" />
      <path d="M17 10 8 19" />
      <path d="M13 4 22 13" />
      <path d="M11 6 15 2" />
      <path d="M20 15 24 11" />
    </>
  ),
  cycle: (
    <>
      <path d="M7 16A9 9 0 0 1 22 9.5" />
      <path d="M22 4.5v5h-5" />
      <path d="M25 16a9 9 0 0 1-15 6.5" />
      <path d="M10 27.5v-5h5" />
    </>
  ),
  card: (
    <>
      <rect x="4" y="8" width="24" height="16" />
      <path d="M4 13h24" />
      <path d="M8 19h7" />
    </>
  ),
  person: (
    <>
      <circle cx="16" cy="11" r="5" />
      <path d="M7 26c0-5.5 4-8.5 9-8.5s9 3 9 8.5" />
    </>
  ),
  transfer: (
    <>
      <circle cx="9" cy="10" r="3.5" />
      <path d="M4 20c0-3.5 2.2-5.5 5-5.5s5 2 5 5.5" />
      <circle cx="23" cy="10" r="3.5" />
      <path d="M18 20c0-3.5 2.2-5.5 5-5.5s5 2 5 5.5" />
      <path d="M12.5 25h7" />
      <path d="M17.5 23 19.5 25 17.5 27" />
    </>
  ),
};

function PlanIcon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

type Pillar = {
  num: string;
  variant: "counter" | "numeral";
  icon?: IconName;
  caption: ReactNode;
};

const PILLARS: Pillar[] = [
  {
    num: "01",
    variant: "counter",
    caption: (
      <>
        <span className="font-medium text-white">Años en el mercado</span>
        <br />y más de 40.000 unidades entregadas.
      </>
    ),
  },
  {
    num: "02",
    variant: "numeral",
    icon: "shieldCheck",
    caption: (
      <>
        Con el{" "}
        <span className="font-medium text-white">respaldo y garantía</span> de
        Mercedes-Benz Argentina y Mercedes-Benz Camiones y Buses Argentina.
      </>
    ),
  },
  {
    num: "03",
    variant: "numeral",
    icon: "star",
    caption: (
      <>
        <span className="font-medium text-white">Todos los productos</span>{" "}
        Mercedes-Benz, sin intermediarios, sin bancos.
      </>
    ),
  },
  {
    num: "04",
    variant: "numeral",
    icon: "umbrella",
    caption: (
      <>
        <span className="font-medium text-white">Protegés tus ahorros</span>{" "}
        con nuestros planes.
      </>
    ),
  },
];

type Benefit = { num: string; icon: IconName; text: string };

const BENEFITS: Benefit[] = [
  { num: "01", icon: "coin", text: "84 cuotas en pesos y sin interés." },
  {
    num: "02",
    icon: "gavel",
    text: "Podés participar en el acto de adjudicación desde la primera cuota.",
  },
  {
    num: "03",
    icon: "cycle",
    text: "Flexibilidad: podés adelantar, licitar o integrar cuotas.",
  },
  {
    num: "04",
    icon: "card",
    text: "Tenemos las mejores facilidades para abonar la cuota de tu plan.",
  },
  {
    num: "05",
    icon: "person",
    text: "Atención personalizada en todas las etapas del plan.",
  },
  {
    num: "06",
    icon: "transfer",
    text: "La titularidad del contrato puede ser transferida a otra persona.",
  },
];

export default function PlanAhorroPage() {
  // Refs — Hero
  const heroSectionRef = useRef<HTMLElement>(null);
  const heroImgWrapRef = useRef<HTMLDivElement>(null);
  const heroEyebrowRef = useRef<HTMLParagraphElement>(null);
  const heroEyebrowLineRef = useRef<HTMLSpanElement>(null);
  const heroH1Ref = useRef<HTMLHeadingElement>(null);
  const heroParaRef = useRef<HTMLDivElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);

  // Refs — Nosotros (papel)
  const nosotrosHeadingRef = useRef<HTMLHeadingElement>(null);
  const nosotrosRuleRef = useRef<HTMLDivElement>(null);
  const nosotrosParaRef = useRef<HTMLParagraphElement>(null);

  // Refs — Por qué elegirnos (negro)
  const elegirnosHeadingRef = useRef<HTMLHeadingElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const pillarRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Refs — Beneficios (papel)
  const benefitRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Refs — CTA final (negro)
  const ctaParaRef = useRef<HTMLParagraphElement>(null);
  const ctaBtnRef = useRef<HTMLDivElement>(null);

  // ==========================================================================
  // HERO — cine: grade oscuro + parallax de escala, SplitText en el H1
  // (líneas enmascaradas), filete + corner ticks + scroll cue coreografiados
  // en la misma timeline. Full-height real (-mt-20 cancela el pt-20 global).
  // ==========================================================================
  useEffect(() => {
    if (typeof window === "undefined" || !heroSectionRef.current) return;

    const w = window as Window & {
      __gsapScrollTriggerRegistered?: boolean;
      __gsapSplitTextRegistered?: boolean;
      __gsapScrollToRegistered?: boolean;
    };
    if (!w.__gsapScrollTriggerRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      w.__gsapScrollTriggerRegistered = true;
    }
    if (!w.__gsapSplitTextRegistered) {
      gsap.registerPlugin(SplitText);
      w.__gsapSplitTextRegistered = true;
    }
    if (!w.__gsapScrollToRegistered) {
      gsap.registerPlugin(ScrollToPlugin);
      w.__gsapScrollToRegistered = true;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const copyEls = [
      heroEyebrowRef.current,
      heroParaRef.current,
      heroCtaRef.current,
    ].filter((el): el is NonNullable<typeof el> => Boolean(el));

    if (reduced) {
      gsap.set(copyEls, { opacity: 1, y: 0 });
      if (heroEyebrowLineRef.current)
        gsap.set(heroEyebrowLineRef.current, { scaleX: 1 });
      if (heroH1Ref.current) gsap.set(heroH1Ref.current, { opacity: 1 });
      if (heroImgWrapRef.current)
        gsap.set(heroImgWrapRef.current, { scale: 1 });
      return;
    }

    gsap.set(copyEls, { opacity: 0, y: 16 });
    if (heroEyebrowLineRef.current)
      gsap.set(heroEyebrowLineRef.current, { scaleX: 0 });
    if (heroH1Ref.current) gsap.set(heroH1Ref.current, { autoAlpha: 0 });
    if (heroImgWrapRef.current)
      gsap.set(heroImgWrapRef.current, { scale: 1.08 });

    const tl = gsap.timeline({ delay: HERO_DELAY });
    tl.to(
      heroEyebrowRef.current,
      {
        opacity: 1,
        y: 0,
        duration: DUR.element,
        ease: GSAP_EASE.secondary,
      },
      0,
    )
      .to(
        heroEyebrowLineRef.current,
        {
          scaleX: 1,
          duration: DUR.element,
          ease: GSAP_EASE.primary,
        },
        0.1,
      )
      .to(
        heroParaRef.current,
        {
          opacity: 1,
          y: 0,
          duration: DUR.element,
          ease: GSAP_EASE.secondary,
        },
        "-=0.3",
      )
      .to(
        heroCtaRef.current,
        {
          opacity: 1,
          y: 0,
          duration: DUR.element,
          ease: GSAP_EASE.secondary,
        },
        "-=0.3",
      );

    if (heroImgWrapRef.current) {
      gsap.to(heroImgWrapRef.current, {
        scale: 1,
        duration: DUR.hero * 1.3,
        ease: GSAP_EASE.secondary,
        delay: 0.1,
      });
    }

    // El H1 nunca debe quedar atrapado invisible si SplitText tarda o falla.
    const safety = window.setTimeout(() => {
      if (heroH1Ref.current) gsap.set(heroH1Ref.current, { autoAlpha: 1 });
    }, 1500);

    let split: SplitText | undefined;
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled) return;
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

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
      tl.kill();
      split?.revert();
    };
  }, []);

  // Scroll animado (GSAP) del CTA hero hacia el contenido.
  const handleHeroCtaClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const target = document.getElementById("contenido");
      if (!target) return;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduced) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
      gsap.to(window, {
        duration: 1.1,
        scrollTo: { y: target, offsetY: 96 },
        ease: GSAP_EASE.primary,
      });
    },
    [],
  );

  // ---- Counter GSAP 0 → 45 (expo.out / --dur-hero). Once, reduced-motion:
  // valor final sin tween. Mecanismo conservado tal cual el original. ----
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as Window & { __gsapScrollTriggerRegistered?: boolean };
    if (!w.__gsapScrollTriggerRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      w.__gsapScrollTriggerRegistered = true;
    }

    const el = counterRef.current;
    if (!el) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      el.textContent = "45";
      return;
    }

    el.textContent = "0";

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        const obj = { value: 0 };
        el.style.willChange = "contents";
        gsap.to(obj, {
          value: 45,
          duration: DUR.hero,
          ease: GSAP_EASE.primary,
          onUpdate: () => {
            el.textContent = Math.round(obj.value).toString();
          },
          onComplete: () => {
            el.style.willChange = "auto";
          },
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  // ==========================================================================
  // Reveals de scroll — encabezados (SplitText lines), párrafos (clip wipe),
  // filetes (scaleX), pilares (wipe alternado L/R) y beneficios (slide +
  // rotación alternada). Carácter distinto por grupo, cero fade-up uniforme.
  // ==========================================================================
  useEffect(() => {
    if (typeof window === "undefined") return;
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

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const triggers: ScrollTrigger[] = [];
    const splits: SplitText[] = [];

    const revealLinesHeading = (el: HTMLElement | null, start = "top 82%") => {
      if (!el) return;
      if (reduced) {
        gsap.set(el, { opacity: 1 });
        return;
      }
      gsap.set(el, { autoAlpha: 0 });
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start,
          once: true,
          onEnter: () => {
            document.fonts.ready.then(() => {
              const split = SplitText.create(el, {
                type: "lines",
                mask: "lines",
                autoSplit: true,
                onSplit(self) {
                  return gsap
                    .timeline()
                    .set(el, { autoAlpha: 1 })
                    .from(self.lines, {
                      yPercent: 110,
                      duration: DUR.element,
                      ease: GSAP_EASE.primary,
                      stagger: 0.08,
                    });
                },
              });
              splits.push(split);
            });
          },
        }),
      );
    };

    const revealClip = (el: HTMLElement | null, start = "top 82%") => {
      if (!el) return;
      if (reduced) {
        gsap.set(el, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" });
        return;
      }
      gsap.set(el, { opacity: 0, clipPath: "inset(0% 0% 100% 0%)" });
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start,
          once: true,
          onEnter: () =>
            gsap.to(el, {
              opacity: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: DUR.hero,
              ease: GSAP_EASE.primary,
            }),
        }),
      );
    };

    const revealRule = (el: HTMLElement | null, start = "top 85%") => {
      if (!el) return;
      if (reduced) {
        gsap.set(el, { scaleX: 1 });
        return;
      }
      gsap.set(el, { scaleX: 0 });
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start,
          once: true,
          onEnter: () =>
            gsap.to(el, {
              scaleX: 1,
              duration: DUR.hero,
              ease: GSAP_EASE.primary,
            }),
        }),
      );
    };

    revealLinesHeading(nosotrosHeadingRef.current);
    revealRule(nosotrosRuleRef.current);
    revealClip(nosotrosParaRef.current, "top 80%");
    revealLinesHeading(elegirnosHeadingRef.current);

    // Pilares: reveal alternado (par = entra desde la izquierda, impar =
    // desde la derecha) vía transform/opacity — distinto del fade-up plano.
    pillarRefs.current.forEach((el, i) => {
      if (!el) return;
      if (reduced) {
        gsap.set(el, { opacity: 1, x: 0 });
        return;
      }
      const fromX = i % 2 === 0 ? -24 : 24;
      gsap.set(el, { opacity: 0, x: fromX });
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () =>
            gsap.to(el, {
              opacity: 1,
              x: 0,
              duration: DUR.element,
              ease: GSAP_EASE.secondary,
              delay: (i % 4) * 0.08,
            }),
        }),
      );
    });

    // Beneficios: slide + leve rotación alternada (carácter propio, no
    // repite el wipe de los pilares).
    benefitRefs.current.forEach((el, i) => {
      if (!el) return;
      if (reduced) {
        gsap.set(el, { opacity: 1, x: 0, rotate: 0 });
        return;
      }
      const fromX = i % 2 === 0 ? -28 : 28;
      const fromRotate = i % 2 === 0 ? -1 : 1;
      gsap.set(el, { opacity: 0, x: fromX, rotate: fromRotate });
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () =>
            gsap.to(el, {
              opacity: 1,
              x: 0,
              rotate: 0,
              duration: DUR.element,
              ease: GSAP_EASE.secondary,
              delay: (i % 6) * 0.06,
            }),
        }),
      );
    });

    revealClip(ctaParaRef.current, "top 82%");

    if (ctaBtnRef.current) {
      if (reduced) {
        gsap.set(ctaBtnRef.current, { opacity: 1, y: 0 });
      } else {
        gsap.set(ctaBtnRef.current, { opacity: 0, y: 16 });
        triggers.push(
          ScrollTrigger.create({
            trigger: ctaBtnRef.current,
            start: "top 90%",
            once: true,
            onEnter: () =>
              gsap.to(ctaBtnRef.current, {
                opacity: 1,
                y: 0,
                duration: DUR.element,
                ease: GSAP_EASE.secondary,
                delay: 0.15,
              }),
          }),
        );
      }
    }

    return () => {
      triggers.forEach((t) => t.kill());
      splits.forEach((s) => s.revert());
    };
  }, []);

  return (
    <div className="-mt-20">
      {/* ============================= HERO — NEGRO CINE =============================
          Full-height real: -mt-20 cancela el pt-20 que MainWrapper agrega en
          rutas no full-bleed, así el hero arranca en el borde superior real
          del viewport, detrás del navbar transparente. */}
      <section
        ref={heroSectionRef}
        className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-mb-black"
      >
        <div
          ref={heroImgWrapRef}
          className="absolute inset-0 will-change-transform"
        >
          {/* Mobile */}
          <Image
            src="/hero-plan-ahorro/hero-mobile.jpg"
            alt="Plan de Ahorro Mercedes-Benz"
            fill
            sizes="100vw"
            priority
            className="object-cover md:hidden"
          />
          {/* Desktop */}
          <Image
            src="/hero-plan-ahorro/hero-desktop.jpg"
            alt="Plan de Ahorro Mercedes-Benz"
            fill
            sizes="100vw"
            priority
            quality={100}
            unoptimized
            className="hidden object-cover md:block"
          />
        </div>

        {/* Grade cinematográfico portado de financiacion */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.6)_38%,rgba(0,0,0,0.14)_72%),linear-gradient(to_top,rgba(0,0,0,0.8)_0%,transparent_46%),radial-gradient(ellipse_at_top,transparent_45%,rgba(0,0,0,0.45)_100%)]" />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-mb-black to-transparent"
        />

        <div className="relative mx-auto flex h-full max-w-[1400px] items-center px-6 md:px-12">
          <div className="max-w-2xl">
            <p
              ref={heroEyebrowRef}
              className="text-eyebrow mb-4 font-mono uppercase tracking-[0.14em] text-silver-300"
            >
              Plan de Ahorro
            </p>
            <span
              ref={heroEyebrowLineRef}
              aria-hidden
              className="mb-6 block h-px w-16 origin-left scale-x-0 bg-white/30"
            />
            <h1
              ref={heroH1Ref}
              className="text-display-1 mb-6 text-balance font-display font-medium text-white [letter-spacing:-0.01em]"
            >
              Armá tu plan a la medida
            </h1>
            <div ref={heroParaRef}>
              <p className="text-lead mb-10 max-w-xl font-light text-silver-100">
                Accedé a tu Mercedes-Benz a través del plan de ahorro oficial.
              </p>
            </div>
            <div ref={heroCtaRef}>
              <CtaSweep href="#contenido" onClick={handleHeroCtaClick}>
                Conocé el plan
                <ArrowRight
                  size={14}
                  className="transition-transform duration-[var(--dur-micro)] ease-[var(--ease-micro)] group-hover/cta:translate-x-1"
                />
              </CtaSweep>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= NOSOTROS — BLANCO =============================
          Corte duro negro→papel, sin transición de gradiente. Apertura
          editorial asimétrica: título grande a la izquierda, texto a la
          derecha — no el bloque centrado genérico de antes. */}
      <section
        id="contenido"
        data-nav-theme="papel"
        className="section-paper scroll-mt-24 py-[var(--spacing-section)]"
      >
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-16">
            <div className="lg:col-span-4">
              <h2
                ref={nosotrosHeadingRef}
                className="text-display-2 font-display font-medium text-ink"
              >
                Nosotros
              </h2>
              <div
                ref={nosotrosRuleRef}
                className="mt-6 h-px w-16 origin-left bg-stroke-ink"
              />
            </div>

            <div className="lg:col-span-8 lg:pt-3">
              <p
                ref={nosotrosParaRef}
                className="max-w-[62ch] text-lg font-light leading-relaxed text-ink md:text-xl"
              >
                Por más de 45 años, con el respaldo y la garantía de
                Mercedes-Benz Argentina y Mercedes-Benz Camiones y Buses
                Argentina, te ofrecemos la posibilidad de acceder a la compra
                del vehículo que vos y tu negocio necesitan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= POR QUÉ ELEGIRNOS — NEGRO =============================
          Corte duro papel→negro. Grid tipo "spec sheet": hairlines blancas
          sobre negro puro, sin cards grises flotando — la tipografía y el
          número son el protagonista. */}
      <section className="bg-mb-black py-[var(--spacing-section)]">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <h2
            ref={elegirnosHeadingRef}
            className="text-display-2 mb-16 text-center font-display font-medium text-white md:text-left"
          >
            Por qué elegirnos:
          </h2>

          {/* 4 pilares — grid con bordes propios (sin relleno gris), tilt 3D
              al interactuar. El número reemplaza al icono. */}
          <div className="grid grid-cols-1 border-l border-t border-white/15 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar, i) => (
              <div
                key={pillar.num}
                ref={(el) => {
                  pillarRefs.current[i] = el;
                }}
                className="group relative border-b border-r border-white/15 transition-colors duration-300 hover:bg-white/[0.03]"
              >
                <TiltCard
                  className="relative flex h-full flex-col items-center px-8 py-14 text-center"
                >
                  <span className="absolute right-4 top-4 font-mono text-[10px] tracking-[0.2em] text-white/30">
                    {pillar.num}
                  </span>

                  <div className="mb-8 flex h-24 items-center justify-center">
                    {pillar.variant === "counter" ? (
                      <div
                        ref={counterRef}
                        className="font-display text-7xl font-thin text-white transition-colors duration-300 group-hover:text-silver-300 md:text-8xl"
                      >
                        45
                      </div>
                    ) : (
                      <PlanIcon
                        name={pillar.icon!}
                        className="h-14 w-14 text-white/85 transition-colors duration-300 group-hover:text-white"
                      />
                    )}
                  </div>

                  <div className="mx-auto mb-6 h-px w-14 bg-white/20" />

                  <p className="text-sm font-light leading-relaxed text-silver-300 md:text-base">
                    {pillar.caption}
                  </p>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= 6 BENEFICIOS — BLANCO =============================
          Corte duro negro→papel. Lista numerada tipo ficha técnica: bordes
          finos color tinta, numeral grande como único protagonista visual. */}
      <section data-nav-theme="papel" className="section-paper py-[var(--spacing-section)]">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 border-l border-t border-stroke-ink sm:grid-cols-2">
            {BENEFITS.map((benefit, i) => (
              <div
                key={benefit.num}
                ref={(el) => {
                  benefitRefs.current[i] = el;
                }}
                className="group border-b border-r border-stroke-ink transition-colors duration-300 hover:bg-ink/[0.025]"
              >
                <TiltCard
                  className="relative flex h-full items-start gap-5 px-6 py-10 md:px-10"
                >
                  <span className="absolute right-5 top-5 font-mono text-[10px] tracking-[0.2em] text-ink/30">
                    {benefit.num}
                  </span>
                  <PlanIcon
                    name={benefit.icon}
                    className="mt-0.5 h-11 w-11 shrink-0 text-ink/70 transition-colors duration-300 group-hover:text-ink"
                  />
                  <p className="pt-1 text-base leading-relaxed text-ink md:text-lg">
                    {benefit.text}
                  </p>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= CTA FINAL — NEGRO ============================= */}
      <section className="bg-mb-black py-[var(--spacing-section)]">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-12">
          <p
            ref={ctaParaRef}
            className="mb-10 font-display text-[2rem] leading-tight text-silver-300 md:text-[3.25rem]"
          >
            Subite a tu próximo Mercedes-Benz, con
            <br />
            <span className="font-normal text-white">
              Mercedes-Benz Plan de Ahorro.
            </span>
          </p>

          <div ref={ctaBtnRef}>
            <CtaSweep href="/contact">CONTACTAME</CtaSweep>
          </div>
        </div>
      </section>
    </div>
  );
}
