"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { DUR, GSAP_EASE, HERO_DELAY } from "@/lib/motion-tokens";

import { pegar } from "@/lib/texto";
// Registro de plugins a nivel de módulo: los componentes hijos (ProductVisual
// / ProductCopy) crean su propio ScrollTrigger en su primer efecto, que en
// React corre ANTES que el efecto del padre — si el registro viviera en un
// useEffect del padre, esos triggers dispararían sin el plugin registrado.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrollToPlugin);
}

interface FinancingOption {
  title: string;
  description: string;
  benefits: string[];
  image: string;
}

type Theme = "dark" | "light";

// Contenido verbatim — NO tocar ni una palabra, dato o ruta de imagen.
const financingOptions: FinancingOption[] = [
  {
    title: "Financiación.",
    description:
      "Mercedes-Benz Financiera ofrece en la Argentina una amplia gama de opciones financieras especialmente diseñadas para que puedas acceder de la forma más ágil y transparente a los vehículos de la marca Mercedes-Benz.",
    benefits: [
      "Tasa Fija en pesos",
      "Financiación de vehículos 0Km y Usados",
      "Planes a la medida de las necesidades de nuestros clientes",
    ],
    image: "/financiacion/imageFinanciacion.jpg",
  },
  {
    title: "Leasing.",
    description:
      "El Leasing es una alternativa para la adquisición o renovación de tu vehículo Mercedes-Benz, mediante la cual se otorga el uso de la unidad por un plazo determinado, con la opción a comprar o renovar la unidad.",
    benefits: [
      "Financiación 100% de la unidad",
      "No estar alcanzado por el impuesto a los activos",
      "Diferimiento del IVA",
      "Amortización acelerada del bien",
      "Servicios de Administración",
    ],
    image: "/financiacion/leasing.png",
  },
  {
    title: "Flotas.",
    description:
      '"Desarrollar alternativas de financiación para flotas es uno de nuestros mayores desafíos." La posibilidad de acceder a su flota con cualquiera de nuestros productos financieros está hoy al alcance de su mano. Las coberturas de seguros, mantenimientos preventivos y correctivos son elementos diferenciales a la hora de elegir un plan de financiación. Además, todo el asesoramiento técnico y financiero de parte del grupo líder del sector automotriz como así también líder en el mundo en la administración de flotas. No dude en contactarse para obtener información adicional.',
    benefits: [],
    image: "/financiacion/flotas.jpg",
  },
  {
    title: "Seguros.",
    description:
      "Tu mejor inversión exige la mejor protección. Por eso, Mercedes-Benz Financiera junto a Aon Risk Services Argentina, broker líder en administración de riesgos y seguros, pone a tu alcance aseguradoras de primer nivel. Porque nuestro compromiso con la seguridad va más allá del vehículo. Podrás elegir la cobertura a la medida de tus necesidades, con las Compañías de Seguro de primera línea.",
    benefits: [],
    image: "/financiacion/seguros.jpg",
  },
];

/**
 * CTA rectangular con fill-sweep al hover (mismo patrón que Home/Contact).
 * Geometría recta siempre — cero border-radius. Soporta:
 *  - href externo (target=_blank)
 *  - href interno de ruta (Next Link)
 *  - href de ancla "#..." con onClick propio (scroll GSAP a sección)
 */
function CtaSweep({
  href,
  children,
  variant = "ghost",
  external = false,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "ghost" | "whatsapp";
  external?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const isWhatsapp = variant === "whatsapp";
  const className = `group/cta relative inline-flex items-center justify-center gap-3 overflow-hidden border px-8 py-3.5 text-sm font-medium transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
    isWhatsapp
      ? "border-whatsapp bg-whatsapp text-white focus-visible:outline-ink"
      : "border-white/25 text-white hover:border-white/70 focus-visible:outline-mb-blue"
  }`;

  const inner = (
    <>
      <span
        aria-hidden
        className={`absolute inset-0 origin-left scale-x-0 transition-transform duration-[var(--dur-element)] ease-[var(--ease-scrub)] group-hover/cta:scale-x-100 ${
          isWhatsapp ? "bg-white/20" : "bg-white"
        }`}
      />
      <span
        className={`relative z-10 flex items-center gap-3 transition-colors duration-[var(--dur-micro)] ${
          isWhatsapp ? "" : "group-hover/cta:text-mb-black"
        }`}
      >
        {children}
      </span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {inner}
      </a>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} onClick={onClick}>
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

// Tilt 3D — patrón idéntico al de Home (paperPhoto) / VehicleCard:
// spring de damping alto, sin overshoot. Cada instancia es un componente
// propio para respetar las Rules of Hooks al mapear las 4 cards.
const TILT_DEG = 7;
const TILT_SPRING = { stiffness: 260, damping: 30, mass: 0.6 };

/**
 * Visual de producto: frame con tilt 3D al mouse, y reveal de
 * scroll por clip-path direccional (asimétrico: alterna el lado desde el
 * que "aparece" según en qué columna vive la imagen — nada de fade-up
 * genérico uniforme). El frame se reskinea según el color comprometido de
 * la sección que lo aloja (negro/papel) — misma geometría, misma física.
 */
function ProductVisual({
  src,
  alt,
  revealFrom,
  theme,
}: {
  src: string;
  alt: string;
  revealFrom: "left" | "right";
  theme: Theme;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
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
      if (!tiltEnabled.current || !frameRef.current) return;
      const rect = frameRef.current.getBoundingClientRect();
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

  useEffect(() => {
    if (typeof window === "undefined" || !frameRef.current) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const el = frameRef.current;
    const hiddenClip =
      revealFrom === "left" ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)";

    if (reduced) {
      gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)" });
      return;
    }

    gsap.set(el, { clipPath: hiddenClip });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 82%",
      once: true,
      onEnter: () =>
        gsap.to(el, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: DUR.hero,
          ease: GSAP_EASE.primary,
        }),
    });
    return () => trigger.kill();
  }, [revealFrom]);

  const frameSkin =
    theme === "dark"
      ? "border-white/10 bg-surface-2"
      : "border-ink/10 bg-paper-1 shadow-[var(--shadow-e2)]";

  return (
    <div
      ref={frameRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ perspective: 1200 }}
      className={`group relative aspect-[4/3] overflow-hidden border ${frameSkin}`}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-[var(--ease-secondary)] group-hover:scale-[1.04]"
        />
      </motion.div>
    </div>
  );
}

/** Check cuadrado (cero border-radius) que se "dibuja" al entrar en viewport
 *  — reemplazo de marca propia del CheckCircle2 redondeado original. El
 *  acento (mb-blue) es el mismo sobre negro o sobre papel: es la marca. */
function BenefitMark() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 flex-shrink-0" aria-hidden>
      <rect
        x="0.5"
        y="0.5"
        width="15"
        height="15"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
      />
      <path
        data-benefit-check
        d="M3.5 8.3 L6.4 11.2 L12.5 4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
        strokeLinejoin="miter"
        pathLength={1}
        style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
      />
    </svg>
  );
}

/**
 * Copy de producto: numeral editorial + título + descripción + beneficios.
 * Título con SplitText mask-reveal (líneas suben desde una máscara — un
 * wipe con carácter, no un fade genérico). Descripción y beneficios entran
 * en X (dirección opuesta a la imagen), beneficios en stagger con el check
 * dibujándose. La paleta entera (title/desc/benefit) se resuelve por tema.
 */
function ProductCopy({
  index,
  title,
  description,
  benefits,
  slideFrom,
  theme,
}: {
  index: number;
  title: string;
  description: string;
  benefits: string[];
  slideFrom: "left" | "right";
  theme: Theme;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";
  const eyebrowColor = isDark ? "text-silver-500" : "text-ink-60";
  const titleColor = isDark ? "text-white" : "text-ink";
  const descColor = isDark ? "text-silver-300" : "text-ink-60";
  const benefitColor = isDark ? "text-silver-100" : "text-ink";

  useEffect(() => {
    if (typeof window === "undefined" || !rootRef.current) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const root = rootRef.current;
    const titleEl = root.querySelector<HTMLElement>("[data-copy-title]");
    const descEl = root.querySelector("[data-copy-desc]");
    // Flotas/Seguros no tienen beneficios: NodeLists vacías — se guardan
    // detrás de un length-check para no pasarle targets vacíos a GSAP.
    const items = root.querySelectorAll("[data-benefit-item]");
    const checks = root.querySelectorAll("[data-benefit-check]");
    const hasBenefits = items.length > 0;
    const startX = slideFrom === "left" ? -28 : 28;

    if (reduced) {
      if (titleEl) gsap.set(titleEl, { opacity: 1 });
      gsap.set([descEl, ...Array.from(items)], { opacity: 1, x: 0 });
      if (hasBenefits) gsap.set(checks, { strokeDashoffset: 0 });
      return;
    }

    if (titleEl) gsap.set(titleEl, { autoAlpha: 0 });
    gsap.set(descEl, { opacity: 0, x: startX });
    if (hasBenefits) {
      gsap.set(items, { opacity: 0, x: startX * 0.6 });
      gsap.set(checks, { strokeDashoffset: 1 });
    }

    let split: SplitText | undefined;
    let cancelled = false;

    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top 78%",
      once: true,
      onEnter: () => {
        if (titleEl) {
          document.fonts.ready.then(() => {
            if (cancelled || !titleEl) return;
            split = SplitText.create(titleEl, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit(self) {
                return gsap
                  .timeline()
                  .set(titleEl, { autoAlpha: 1 })
                  .from(self.lines, {
                    yPercent: 115,
                    duration: DUR.hero,
                    ease: GSAP_EASE.primary,
                  });
              },
            });
          });
        }

        const tl = gsap.timeline({ delay: 0.12 });
        tl.to(descEl, {
          opacity: 1,
          x: 0,
          duration: DUR.element,
          ease: GSAP_EASE.secondary,
        });
        if (!hasBenefits) return;
        tl.to(
            items,
            {
              opacity: 1,
              x: 0,
              duration: DUR.element,
              ease: GSAP_EASE.secondary,
              stagger: 0.08,
            },
            "-=0.25",
          )
          .to(
            checks,
            {
              strokeDashoffset: 0,
              duration: 0.5,
              ease: GSAP_EASE.micro,
              stagger: 0.08,
            },
            "-=0.35",
          );
      },
    });

    return () => {
      cancelled = true;
      trigger.kill();
      split?.revert();
    };
  }, [slideFrom]);

  return (
    <div ref={rootRef}>
      <span
        aria-hidden
        className={`mb-4 block font-mono text-eyebrow tracking-[0.2em] ${eyebrowColor}`}
      >
        0{index + 1}
      </span>
      <h3
        data-copy-title
        className={`text-h1 mb-6 font-display font-medium ${titleColor}`}
      >
        {title}
      </h3>
      <p
        data-copy-desc
        className={`mb-8 max-w-[60ch] text-base leading-relaxed ${descColor}`}
      >
        {pegar(description)}
      </p>

      {benefits.length > 0 && (
        <ul className="space-y-4">
          {benefits.map((benefit) => (
            <li
              key={benefit}
              data-benefit-item
              className={`flex items-start gap-3 ${benefitColor}`}
            >
              <span className="mt-0.5 text-mb-blue">
                <BenefitMark />
              </span>
              <span className="text-sm md:text-base">{pegar(benefit)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Fila de producto: imagen + copy en grid 12 col, alternando el lado de la
 * imagen por índice. El tema (negro/papel) se deriva del índice — par =
 * negro, impar = papel — que es exactamente la alternancia pedida:
 * 0 Financiación negro · 1 Leasing papel · 2 Flotas negro · 3 Seguros papel.
 */
function ProductRow({
  option,
  index,
}: {
  option: FinancingOption;
  index: number;
}) {
  const theme: Theme = index % 2 === 0 ? "dark" : "light";
  const imageSide: "left" | "right" = index % 2 === 0 ? "left" : "right";

  return (
    <div
      className={`grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16 ${
        index % 2 === 1 ? "lg:grid-flow-dense" : ""
      }`}
    >
      <div
        className={`lg:col-span-6 ${
          index % 2 === 1 ? "lg:col-start-7" : ""
        }`}
      >
        <ProductVisual
          src={option.image}
          alt={option.title}
          revealFrom={imageSide}
          theme={theme}
        />
      </div>

      <div
        className={`lg:col-span-6 ${
          index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""
        }`}
      >
        <ProductCopy
          index={index}
          title={option.title}
          description={option.description}
          benefits={option.benefits}
          slideFrom={imageSide === "left" ? "right" : "left"}
          theme={theme}
        />
      </div>
    </div>
  );
}

export default function FinanciacionPage() {
  // Refs — Hero
  const heroRef = useRef<HTMLElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const heroEyebrowRef = useRef<HTMLParagraphElement>(null);
  const heroEyebrowLineRef = useRef<HTMLSpanElement>(null);
  const heroH1Ref = useRef<HTMLHeadingElement>(null);
  const heroParaRef = useRef<HTMLDivElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);

  // Refs — Header de la grilla de productos
  const headerRootRef = useRef<HTMLDivElement>(null);
  const headerH2Ref = useRef<HTMLHeadingElement>(null);
  const headerParaRef = useRef<HTMLParagraphElement>(null);
  const headerRuleRef = useRef<HTMLSpanElement>(null);

  // Refs — CTA final
  const finalCtaRootRef = useRef<HTMLElement>(null);
  const finalH2Ref = useRef<HTMLHeadingElement>(null);
  const finalParaRef = useRef<HTMLParagraphElement>(null);
  const finalCtaBtnRef = useRef<HTMLDivElement>(null);

  // ---- Hero cinematográfico: hairline + SplitText chars + Ken Burns + copy stagger ----
  useEffect(() => {
    if (typeof window === "undefined" || !heroRef.current) return;

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
      if (heroImgRef.current) gsap.set(heroImgRef.current, { scale: 1 });
      return;
    }

    gsap.set(copyEls, { opacity: 0, y: 16 });
    if (heroEyebrowLineRef.current)
      gsap.set(heroEyebrowLineRef.current, { scaleX: 0 });
    if (heroH1Ref.current) gsap.set(heroH1Ref.current, { autoAlpha: 0 });
    if (heroImgRef.current) gsap.set(heroImgRef.current, { scale: 1.08 });

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

    if (heroImgRef.current) {
      gsap.to(heroImgRef.current, {
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

  // Scroll animado (GSAP) del botón hero hacia la grilla de productos.
  const handleHeroCtaClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const target = document.getElementById("productos");
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

  // ---- Header de la grilla: SplitText lines + filete + párrafo ----
  useEffect(() => {
    if (typeof window === "undefined" || !headerRootRef.current) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      if (headerH2Ref.current) gsap.set(headerH2Ref.current, { opacity: 1 });
      if (headerParaRef.current)
        gsap.set(headerParaRef.current, { opacity: 1, y: 0 });
      if (headerRuleRef.current)
        gsap.set(headerRuleRef.current, { scaleX: 1 });
      return;
    }

    if (headerH2Ref.current) gsap.set(headerH2Ref.current, { autoAlpha: 0 });
    if (headerParaRef.current)
      gsap.set(headerParaRef.current, { opacity: 0, y: 16 });
    if (headerRuleRef.current)
      gsap.set(headerRuleRef.current, { scaleX: 0 });

    let split: SplitText | undefined;
    const trigger = ScrollTrigger.create({
      trigger: headerRootRef.current,
      start: "top 78%",
      once: true,
      onEnter: () => {
        if (headerH2Ref.current) {
          document.fonts.ready.then(() => {
            if (!headerH2Ref.current) return;
            split = SplitText.create(headerH2Ref.current, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit(self) {
                return gsap
                  .timeline()
                  .set(headerH2Ref.current, { autoAlpha: 1 })
                  .from(self.lines, {
                    yPercent: 110,
                    duration: DUR.element,
                    ease: GSAP_EASE.primary,
                    stagger: 0.08,
                  });
              },
            });
          });
        }
        gsap.to(headerRuleRef.current, {
          scaleX: 1,
          duration: DUR.element,
          ease: GSAP_EASE.secondary,
          delay: 0.15,
        });
        gsap.to(headerParaRef.current, {
          opacity: 1,
          y: 0,
          duration: DUR.element,
          ease: GSAP_EASE.secondary,
          delay: 0.25,
        });
      },
    });

    return () => {
      trigger.kill();
      split?.revert();
    };
  }, []);

  // ---- CTA final: SplitText lines + párrafo + botón ----
  useEffect(() => {
    if (typeof window === "undefined" || !finalCtaRootRef.current) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const els = [finalParaRef.current, finalCtaBtnRef.current].filter(
      (el): el is NonNullable<typeof el> => Boolean(el),
    );

    if (reduced) {
      gsap.set(els, { opacity: 1, y: 0 });
      if (finalH2Ref.current) gsap.set(finalH2Ref.current, { opacity: 1 });
      return;
    }

    gsap.set(els, { opacity: 0, y: 16 });
    if (finalH2Ref.current) gsap.set(finalH2Ref.current, { autoAlpha: 0 });

    let split: SplitText | undefined;
    const trigger = ScrollTrigger.create({
      trigger: finalCtaRootRef.current,
      start: "top 75%",
      once: true,
      onEnter: () => {
        if (finalH2Ref.current) {
          document.fonts.ready.then(() => {
            if (!finalH2Ref.current) return;
            split = SplitText.create(finalH2Ref.current, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit(self) {
                return gsap
                  .timeline()
                  .set(finalH2Ref.current, { autoAlpha: 1 })
                  .from(self.lines, {
                    yPercent: 110,
                    duration: DUR.element,
                    ease: GSAP_EASE.primary,
                    stagger: 0.08,
                  });
              },
            });
          });
        }
        gsap.to(finalParaRef.current, {
          opacity: 1,
          y: 0,
          duration: DUR.element,
          ease: GSAP_EASE.secondary,
          delay: 0.15,
        });
        gsap.to(finalCtaBtnRef.current, {
          opacity: 1,
          y: 0,
          duration: DUR.element,
          ease: GSAP_EASE.secondary,
          delay: 0.3,
        });
      },
    });

    return () => {
      trigger.kill();
      split?.revert();
    };
  }, []);

  return (
    <div className="min-h-screen bg-mb-black text-white selection:bg-white selection:text-black">
      {/* ═══════════════ HERO — cinematográfico, full-height, negro ═══════════════ */}
      <section
        ref={heroRef}
        className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-mb-black"
      >
        <div
          ref={heroImgRef}
          className="absolute inset-0 will-change-transform"
        >
          <Image
            src="/hero-financiacion/financiacionMobile.jpg"
            alt="Mercedes-Benz Financiera"
            fill
            sizes="100vw"
            className="object-cover md:hidden"
            priority
          />
          <Image
            src="/hero-financiacion/financiacion.png"
            alt="Mercedes-Benz Financiera"
            fill
            sizes="100vw"
            className="hidden object-cover md:block"
            priority
          />
        </div>

        {/* Grade cinematográfico — lateral + vertical + vignette superior,
            mucho más fuerte que un scrim plano: el hero debe leer como
            cine, no como foto de stock con texto encima. */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.6)_38%,rgba(0,0,0,0.14)_72%),linear-gradient(to_top,rgba(0,0,0,0.8)_0%,transparent_46%),radial-gradient(ellipse_at_top,transparent_45%,rgba(0,0,0,0.45)_100%)]" />

        {/* Fundido inferior hacia el negro de la sección siguiente — misma
            familia de color, sin costura visible en el arranque de la grilla. */}
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
              Financiación
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
              Mercedes-Benz Financiera.
            </h1>
            <div ref={heroParaRef}>
              <p className="text-lead mb-10 font-light text-silver-100">
                {pegar("Accedé a vehículos Mercedes-Benz de la manera más simple.")}
              </p>
            </div>
            <div ref={heroCtaRef}>
              <CtaSweep
                href="#productos"
                variant="ghost"
                onClick={handleHeroCtaClick}
              >
                Realizar consulta
                <ArrowRight
                  size={14}
                  className="transition-transform duration-[var(--dur-micro)] ease-[var(--ease-micro)] group-hover/cta:translate-x-1"
                />
              </CtaSweep>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECCIÓN 1 — NEGRO: header de grilla + Financiación ═══════════════ */}
      <section
        id="productos"
        className="relative scroll-mt-24 overflow-hidden bg-mb-black py-[var(--spacing-section)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_40%_70%_at_0%_50%,rgba(255,255,255,0.03),transparent_60%),radial-gradient(ellipse_40%_70%_at_100%_50%,rgba(255,255,255,0.03),transparent_60%)]"
        />

        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div
            ref={headerRootRef}
            className="mx-auto mb-24 max-w-4xl text-center"
          >
            <h2
              ref={headerH2Ref}
              className="text-display-2 mb-6 text-balance font-display font-medium text-white"
            >
              La financiación justa para <br className="hidden md:block" />
              todos los modelos.
            </h2>
            <span
              ref={headerRuleRef}
              aria-hidden
              className="mx-auto mb-6 block h-[2px] w-16 origin-center bg-mb-blue"
            />
            <p
              ref={headerParaRef}
              className="text-lead mx-auto max-w-3xl text-silver-300"
            >
              {pegar("En Mercedes-Benz Financiera desarrollamos productos financieros con una amplia gama de opciones que permiten acceder a vehículos Mercedes-Benz de la manera más simple, transparente y rápida.")}
            </p>
          </div>

          <ProductRow option={financingOptions[0]} index={0} />
        </div>
      </section>

      {/* ═══════════════ SECCIÓN 2 — PAPEL: Leasing ═══════════════ */}
      <section
        data-nav-theme="papel"
        className="section-paper overflow-hidden py-[var(--spacing-section)]"
      >
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <ProductRow option={financingOptions[1]} index={1} />
        </div>
      </section>

      {/* ═══════════════ SECCIÓN 3 — NEGRO: Flotas ═══════════════ */}
      <section className="relative overflow-hidden bg-mb-black py-[var(--spacing-section)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_40%_70%_at_100%_50%,rgba(255,255,255,0.03),transparent_60%)]"
        />
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <ProductRow option={financingOptions[2]} index={2} />
        </div>
      </section>

      {/* ═══════════════ SECCIÓN 4 — PAPEL: Seguros ═══════════════ */}
      <section
        data-nav-theme="papel"
        className="section-paper overflow-hidden py-[var(--spacing-section)]"
      >
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <ProductRow option={financingOptions[3]} index={3} />
        </div>
      </section>

      {/* ═══════════════ CTA FINAL — NEGRO, corte duro tras Seguros ═══════════════ */}
      <section
        ref={finalCtaRootRef}
        className="relative overflow-hidden bg-mb-black py-[var(--spacing-section)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/[0.03] to-transparent"
        />
        <div className="mx-auto max-w-[1400px] px-6 text-center md:px-12">
          <h2
            ref={finalH2Ref}
            className="text-display-2 mb-6 text-balance font-display font-medium text-white"
          >
            ¿Listo para tu próximo <br className="hidden md:block" />
            Mercedes-Benz?
          </h2>
          <div ref={finalParaRef}>
            <p className="text-lead mx-auto mb-10 text-silver-300">
              {pegar("Estoy listo para ayudarte a encontrar la mejor opción de financiación que se adapte a tus necesidades. Confía en mi experiencia.")}
            </p>
          </div>
          <div ref={finalCtaBtnRef}>
            <CtaSweep href="/contact" variant="ghost">
              Contactame
              <ArrowRight
                size={14}
                className="transition-transform duration-[var(--dur-micro)] ease-[var(--ease-micro)] group-hover/cta:translate-x-1"
              />
            </CtaSweep>
          </div>
        </div>
      </section>
    </div>
  );
}
