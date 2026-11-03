"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DUR, GSAP_EASE, HERO_DELAY } from "@/lib/motion-tokens";
import { waLink } from "@/lib/site";

// redesign-about-contact.md §R2 — la ficha: la atribución vive EN el label,
// siempre (prohibido "años en Mercedes"). Valores finales exactos del
// checklist #6: 25 / +45 / +40.000, sin sufijo de palabra.
const STATS = [
  { targetValue: 25, prefix: "", label: "AÑOS EN EL RUBRO AUTOMOTRIZ" },
  {
    targetValue: 45,
    prefix: "+",
    label: "AÑOS DE TRAYECTORIA — AUTOMOTORES MEGA",
  },
  {
    targetValue: 40000,
    prefix: "+",
    label: "UNIDADES ENTREGADAS — AUTOMOTORES MEGA",
  },
] as const;

function formatStatValue(n: number) {
  return Math.round(n).toLocaleString("es-AR");
}

// redesign-about-contact.md §R3 — 3 capítulos, mismo orden temático que la
// bio original (párrafos textuales, no reescritos).
const CHAPTERS = [
  {
    num: "01",
    kicker: "LA ATENCIÓN",
    title: "En persona.",
    body: "Soy Leonardo Guzmán, promotor de ventas de Mercedes-Benz en Automotores Mega S.A., en Paraná, Entre Ríos. Atiendo en persona, de a un cliente por vez: escucho qué necesitás, te muestro las opciones reales y te doy la información completa para que decidas sin apuro.",
  },
  {
    num: "02",
    kicker: "EL PROCESO",
    title: "Todas las etapas.",
    body: "Te acompaño en todas las etapas: la elección del modelo y su equipamiento, la operación y la entrega. Y después de la entrega sigo estando — mi trabajo no termina cuando el auto sale de la concesionaria.",
  },
  {
    num: "03",
    kicker: "EL RESPALDO",
    title: "Detrás mío.",
    body: "Detrás está Automotores Mega, con más de 45 años de trayectoria y más de 40.000 unidades entregadas, y el respaldo de Mercedes-Benz Argentina y de Mercedes-Benz Camiones y Buses Argentina.",
  },
] as const;

// redesign-about-contact.md §5 — tilt 3D máx 4° (patrón aprobado de
// Home, copiado localmente: esta página no importa nada de page.tsx).
const PHOTO_TILT_DEG = 4;
const PHOTO_TILT_SPRING = { stiffness: 260, damping: 30, mass: 0.6 };

// Swap de flecha "sale por la derecha / entra por la izquierda" — dos
// glifos apilados, salida 180ms + entrada 180ms encadenadas por delay CSS
// (redesign-about-contact.md §5 banda CTA).
function ArrowSwap({ colorClass }: { colorClass: string }) {
  return (
    <span
      aria-hidden
      className="relative inline-block h-4 w-5 shrink-0 overflow-visible"
    >
      <ArrowRight
        size={20}
        className={`absolute inset-0 transition-all duration-150 ease-[var(--ease-micro)] group-hover:translate-x-4 group-hover:opacity-0 ${colorClass}`}
      />
      <ArrowRight
        size={20}
        className={`absolute inset-0 -translate-x-4 opacity-0 transition-all delay-150 duration-150 ease-[var(--ease-micro)] group-hover:translate-x-0 group-hover:opacity-100 ${colorClass}`}
      />
    </span>
  );
}

export default function AboutPage() {
  // ---- Refs — R1 hero (eyebrow + H1 + premisa + retrato, un solo viewport) ----
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const eyebrowLineRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const h1DotRef = useRef<HTMLSpanElement>(null);
  const premiseKickerRef = useRef<HTMLParagraphElement>(null);
  const premiseLeadRef = useRef<HTMLParagraphElement>(null);
  const photoFrameRef = useRef<HTMLDivElement>(null);
  const photoImgWrapRef = useRef<HTMLDivElement>(null);
  const frameHRef = useRef<HTMLDivElement>(null);
  const frameVRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);

  // ---- Refs — R2 ficha (stats) ----
  const statStripRef = useRef<HTMLDListElement>(null);
  const statHairlineRefs = useRef<Array<HTMLDivElement | null>>([]);
  const statContentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const statValueRefs = useRef<Array<HTMLElement | null>>([]);

  // ---- Refs — R3 capítulos ----
  const chapterSectionRefs = useRef<Array<HTMLElement | null>>([]);
  const chapterLineRefs = useRef<Array<HTMLDivElement | null>>([]);
  const chapterNumeralFillRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const chapterKickerRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const chapterTitleRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  const chapterBodyRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  // Segunda imagen (foto-home.jpg) — vive en el capítulo 02, reveal clip-path.
  const chapterImageFrameRef = useRef<HTMLDivElement>(null);

  // ---- Refs — R4 banda CTA ----
  const ctaTopLineRef = useRef<HTMLDivElement>(null);
  const ctaBottomLineRef = useRef<HTMLDivElement>(null);
  const ctaKickerRef = useRef<HTMLParagraphElement>(null);

  // Tilt 3D del retrato — pointer tracking (framer). Desactivado en touch /
  // prefers-reduced-motion.
  const photoTiltEnabled = useRef(false);
  useEffect(() => {
    photoTiltEnabled.current =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  const photoRotateXRaw = useMotionValue(0);
  const photoRotateYRaw = useMotionValue(0);
  const photoRotateX = useSpring(photoRotateXRaw, PHOTO_TILT_SPRING);
  const photoRotateY = useSpring(photoRotateYRaw, PHOTO_TILT_SPRING);

  const handlePhotoPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!photoTiltEnabled.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      photoRotateYRaw.set((px - 0.5) * PHOTO_TILT_DEG * 2);
      photoRotateXRaw.set(-(py - 0.5) * PHOTO_TILT_DEG * 2);
    },
    [photoRotateXRaw, photoRotateYRaw],
  );

  const handlePhotoPointerLeave = useCallback(() => {
    photoRotateXRaw.set(0);
    photoRotateYRaw.set(0);
  }, [photoRotateXRaw, photoRotateYRaw]);

  // ==========================================================================
  // «EL REVELADO» — timeline de carga única, delay HERO_DELAY (contrato de
  // template.tsx). Todo el R1 (eyebrow, H1, premisa, retrato) vive en la
  // MISMA timeline de boot — es el primer viewport, no hace falta esperar
  // scroll para verlo con vida.
  // ==========================================================================
  useEffect(() => {
    if (typeof window === "undefined" || !h1Ref.current) return;

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

    const lineEls = [eyebrowLineRef.current].filter(
      (el): el is HTMLDivElement => Boolean(el),
    );
    const fadeEls = [captionRef.current, premiseKickerRef.current, premiseLeadRef.current].filter(
      (el): el is HTMLParagraphElement => Boolean(el),
    );

    // ---- Reduced motion: todo visible al instante, sin scrub/tilt/SplitText ----
    if (reduced) {
      gsap.set(lineEls, { scaleX: 1 });
      gsap.set(fadeEls, { opacity: 1, y: 0 });
      gsap.set(h1Ref.current, { autoAlpha: 1 });
      if (h1DotRef.current) gsap.set(h1DotRef.current, { opacity: 1 });
      if (photoFrameRef.current)
        gsap.set(photoFrameRef.current, { clipPath: "inset(0% 0% 0% 0%)" });
      if (photoImgWrapRef.current)
        gsap.set(photoImgWrapRef.current, { scale: 1 });
      [frameHRef.current, frameVRef.current].forEach((el) => {
        if (el) gsap.set(el, { scaleX: 1, scaleY: 1 });
      });
      if (statStripRef.current)
        gsap.set(statStripRef.current, { opacity: 1 });
      gsap.set(statHairlineRefs.current.filter(Boolean), { scaleX: 1 });
      gsap.set(statContentRefs.current.filter(Boolean), {
        opacity: 1,
        y: 0,
      });
      chapterLineRefs.current.forEach((el) => el && gsap.set(el, { scaleX: 1 }));
      chapterKickerRefs.current.forEach(
        (el) => el && gsap.set(el, { opacity: 1, y: 0 }),
      );
      chapterTitleRefs.current.forEach(
        (el) => el && gsap.set(el, { opacity: 1, y: 0 }),
      );
      chapterNumeralFillRefs.current.forEach(
        (el) => el && gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)" }),
      );
      if (chapterImageFrameRef.current)
        gsap.set(chapterImageFrameRef.current, { clipPath: "inset(0% 0% 0% 0%)" });
      [ctaTopLineRef.current, ctaBottomLineRef.current].forEach((el) => {
        if (el) gsap.set(el, { scaleX: 1 });
      });
      if (ctaKickerRef.current)
        gsap.set(ctaKickerRef.current, { opacity: 1, y: 0 });
      return;
    }

    // ---- Estado inicial (pre-timeline) ----
    gsap.set(lineEls, { scaleX: 0 });
    gsap.set(fadeEls, { opacity: 0, y: 14 });
    gsap.set(h1Ref.current, { autoAlpha: 0 });
    if (h1DotRef.current) gsap.set(h1DotRef.current, { opacity: 0 });
    if (photoFrameRef.current)
      gsap.set(photoFrameRef.current, { clipPath: "inset(100% 0% 0% 0%)" });
    if (photoImgWrapRef.current)
      gsap.set(photoImgWrapRef.current, { scale: 1.06 });
    [frameHRef.current, frameVRef.current].forEach((el) => {
      if (el) gsap.set(el, { scaleX: 0, scaleY: 0 });
    });
    if (statStripRef.current) gsap.set(statStripRef.current, { opacity: 1 });
    gsap.set(statHairlineRefs.current.filter(Boolean), { scaleX: 0 });
    gsap.set(statContentRefs.current.filter(Boolean), { opacity: 0, y: 16 });

    // Red de seguridad incondicional del boot: si document.fonts.ready no
    // resuelve (o tarda de más), eyebrow/H1/premisa/retrato quedarían
    // atrapados en autoAlpha:0 / opacity:0 para siempre — hoy la única
    // "solución" es recargar. A los ~1.4s forzamos el estado final visible,
    // sea cual sea la causa (fuente que no llega, promesa que no resuelve).
    const safety = window.setTimeout(() => {
      gsap.set(lineEls, { scaleX: 1 });
      gsap.set(fadeEls, { opacity: 1, y: 0 });
      if (h1Ref.current) gsap.set(h1Ref.current, { autoAlpha: 1 });
      if (h1DotRef.current) gsap.set(h1DotRef.current, { opacity: 1 });
      if (photoFrameRef.current)
        gsap.set(photoFrameRef.current, { clipPath: "inset(0% 0% 0% 0%)" });
      if (photoImgWrapRef.current)
        gsap.set(photoImgWrapRef.current, { scale: 1 });
      [frameHRef.current, frameVRef.current].forEach((el) => {
        if (el) gsap.set(el, { scaleX: 1, scaleY: 1 });
      });
    }, 1400);

    let eyebrowSplit: SplitText | undefined;
    let h1Split: SplitText | undefined;
    let tl: gsap.core.Timeline | undefined;
    // Guardia estándar de cancelación para efectos async: si el componente
    // se desmonta (o Strict Mode re-invoca el efecto en dev) antes de que
    // resuelva document.fonts.ready, este callback no debe construir una
    // timeline sobre refs de una instancia ya limpiada.
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled) return;
      window.clearTimeout(safety);
      if (!h1Ref.current || !eyebrowRef.current) return;

      eyebrowSplit = SplitText.create(eyebrowRef.current, {
        type: "chars",
        autoSplit: true,
        onSplit(self) {
          gsap.set(self.chars, { opacity: 0, y: 8 });
          return null;
        },
      });

      h1Split = SplitText.create(h1Ref.current, {
        type: "chars, words",
        mask: "chars",
        autoSplit: true,
        onSplit(self) {
          gsap.set(h1Ref.current, { autoAlpha: 1 });
          gsap.set(self.chars, { yPercent: 110 });
          return null;
        },
      });

      const timeline = gsap.timeline({ delay: HERO_DELAY });
      tl = timeline;

      // t=0 — filete bajo el eyebrow se traza
      timeline.to(
        lineEls,
        { scaleX: 1, duration: DUR.element, ease: GSAP_EASE.primary },
        0,
      );

      // t=80ms — eyebrow: chars fade-up, stagger 12ms
      if (eyebrowSplit) {
        timeline.to(
          eyebrowSplit.chars,
          {
            opacity: 1,
            y: 0,
            duration: DUR.micro,
            ease: GSAP_EASE.micro,
            stagger: 0.012,
          },
          0.08,
        );
      }

      // t=180ms — H1 SplitText masked, chars y:110%→0, stagger 20ms
      if (h1Split) {
        timeline.to(
          h1Split.chars,
          {
            yPercent: 0,
            duration: DUR.hero,
            ease: GSAP_EASE.primary,
            stagger: 0.02,
          },
          0.18,
        );
      }
      if (h1DotRef.current) {
        timeline.to(
          h1DotRef.current,
          { opacity: 1, duration: DUR.micro, ease: GSAP_EASE.micro },
          0.18 + DUR.hero,
        );
      }

      // t=320ms — retrato: clip-path reveal + escala interna + marco se traza
      // (arranca temprano: el retrato es protagonista del primer viewport,
      // no espera scroll ni al final del H1).
      if (photoFrameRef.current) {
        timeline.to(
          photoFrameRef.current,
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: DUR.hero,
            ease: "power2.out",
          },
          0.32,
        );
      }
      if (photoImgWrapRef.current) {
        timeline.to(
          photoImgWrapRef.current,
          { scale: 1, duration: DUR.hero, ease: "power2.out" },
          0.32,
        );
      }
      [frameHRef.current, frameVRef.current].forEach((el) => {
        if (!el) return;
        timeline.to(
          el,
          { scaleX: 1, scaleY: 1, duration: DUR.hero, ease: "power2.out" },
          0.32,
        );
      });
      if (captionRef.current) {
        timeline.to(
          captionRef.current,
          { opacity: 1, y: 0, duration: DUR.element, ease: GSAP_EASE.secondary },
          0.85,
        );
      }

      // t=450/520ms — premisa (kicker + cita): fade-up 14px, justo tras el H1
      if (premiseKickerRef.current) {
        timeline.to(
          premiseKickerRef.current,
          { opacity: 1, y: 0, duration: DUR.element, ease: GSAP_EASE.secondary },
          0.45,
        );
      }
      if (premiseLeadRef.current) {
        timeline.to(
          premiseLeadRef.current,
          { opacity: 1, y: 0, duration: DUR.element, ease: GSAP_EASE.secondary },
          0.52,
        );
      }
    });

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
      tl?.kill();
      eyebrowSplit?.revert();
      h1Split?.revert();
    };
  }, []);

  // ==========================================================================
  // Scroll — ficha de stats (counters) + capítulos ("la tinta sube" + reveal
  // once, incluye la segunda imagen del capítulo 02) + banda CTA.
  // ==========================================================================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const w = window as Window & { __gsapScrollTriggerRegistered?: boolean };
    if (!w.__gsapScrollTriggerRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      w.__gsapScrollTriggerRegistered = true;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) return; // sin scrub, sin reveals de scroll — todo ya visible

    const triggers: ScrollTrigger[] = [];
    const bodySplits: SplitText[] = [];
    let cancelled = false;

    // Guardas de "¿ya se reveló?" — si ScrollTrigger nunca dispara onEnter
    // (layout shift por fuentes/imágenes, sección ya en viewport al primer
    // paint, SplitText que no llega a correr) estos flags le dicen a la red
    // de seguridad de abajo qué falta forzar, sin pisar una animación que
    // sí arrancó.
    const chapterHeadingRevealed = CHAPTERS.map(() => false);
    const chapterBodyRevealed = CHAPTERS.map(() => false);
    const chapterBodyLineEls = CHAPTERS.map<Element[]>(() => []);
    let statsRevealed = false;
    let ctaRevealed = false;

    const revealChapterHeading = (i: number) => {
      if (chapterHeadingRevealed[i]) return;
      chapterHeadingRevealed[i] = true;
      const lineEl = chapterLineRefs.current[i];
      const kickerEl = chapterKickerRefs.current[i];
      const titleEl = chapterTitleRefs.current[i];
      const imageEl = i === 1 ? chapterImageFrameRef.current : null;
      if (lineEl) gsap.set(lineEl, { scaleX: 1 });
      if (kickerEl) gsap.set(kickerEl, { opacity: 1, y: 0 });
      if (titleEl) gsap.set(titleEl, { opacity: 1, y: 0 });
      if (imageEl) gsap.set(imageEl, { clipPath: "inset(0% 0% 0% 0%)" });
    };
    const revealChapterBody = (i: number) => {
      if (chapterBodyRevealed[i] || !chapterBodyLineEls[i].length) return;
      chapterBodyRevealed[i] = true;
      gsap.set(chapterBodyLineEls[i], { autoAlpha: 1, yPercent: 0 });
    };
    const revealStats = () => {
      if (statsRevealed) return;
      statsRevealed = true;
      statHairlineRefs.current.forEach((el) => el && gsap.set(el, { scaleX: 1 }));
      statContentRefs.current.forEach(
        (el) => el && gsap.set(el, { opacity: 1, y: 0 }),
      );
    };
    const revealCta = () => {
      if (ctaRevealed) return;
      ctaRevealed = true;
      if (ctaTopLineRef.current) gsap.set(ctaTopLineRef.current, { scaleX: 1 });
      if (ctaBottomLineRef.current)
        gsap.set(ctaBottomLineRef.current, { scaleX: 1 });
      if (ctaKickerRef.current)
        gsap.set(ctaKickerRef.current, { opacity: 1, y: 0 });
    };

    // Si al momento de chequear el elemento ya cruzó el punto de disparo de
    // su propio ScrollTrigger (misma fracción de viewport que su `start`),
    // está "en pantalla" y debería estar revelado — si no lo está, es el
    // bug (no una animación legítimamente pendiente de scroll futuro).
    const isPastStart = (el: Element | null, viewportFraction: number) => {
      if (!el) return false;
      return (
        el.getBoundingClientRect().top < window.innerHeight * viewportFraction
      );
    };

    const checkAndForceReveals = () => {
      chapterSectionRefs.current.forEach((sectionEl, i) => {
        if (isPastStart(sectionEl, 0.7)) {
          revealChapterHeading(i);
          revealChapterBody(i);
        }
      });
      if (isPastStart(statStripRef.current, 0.88)) revealStats();
      if (isPastStart(ctaTopLineRef.current, 0.85)) revealCta();
    };

    // Ficha — hairlines scaleX (stagger 80ms) + counters, al entrar en viewport.
    if (statStripRef.current) {
      const st = ScrollTrigger.create({
        trigger: statStripRef.current,
        start: "top 88%",
        once: true,
        onEnter: () => {
          statsRevealed = true;
          statHairlineRefs.current.forEach((el, i) => {
            if (!el) return;
            gsap.to(el, {
              scaleX: 1,
              duration: DUR.hero,
              ease: GSAP_EASE.primary,
              delay: i * 0.08,
            });
          });
          statContentRefs.current.forEach((el, i) => {
            if (!el) return;
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: DUR.element,
              ease: GSAP_EASE.secondary,
              delay: i * 0.08,
            });
          });
          STATS.forEach((stat, i) => {
            const el = statValueRefs.current[i];
            if (!el) return;
            const counter = { val: 0 };
            gsap.to(counter, {
              val: stat.targetValue,
              duration: DUR.hero,
              ease: GSAP_EASE.primary,
              delay: i * 0.08,
              onUpdate: () => {
                el.textContent = `${stat.prefix}${formatStatValue(counter.val)}`;
              },
            });
          });
        },
      });
      triggers.push(st);
    }

    // Capítulos — filete + kicker/título fade-up (once, 70%) + body
    // SplitText por líneas + "la tinta sube" (scrub). Capítulo 02 suma el
    // reveal clip-path de la segunda imagen (foto-home.jpg).
    chapterSectionRefs.current.forEach((sectionEl, i) => {
      if (!sectionEl) return;

      const lineEl = chapterLineRefs.current[i];
      const kickerEl = chapterKickerRefs.current[i];
      const titleEl = chapterTitleRefs.current[i];
      const fillEl = chapterNumeralFillRefs.current[i];
      const imageEl = i === 1 ? chapterImageFrameRef.current : null;

      if (lineEl) gsap.set(lineEl, { scaleX: 0 });
      if (kickerEl) gsap.set(kickerEl, { opacity: 0, y: 16 });
      if (titleEl) gsap.set(titleEl, { opacity: 0, y: 16 });
      if (imageEl) gsap.set(imageEl, { clipPath: "inset(0% 0% 100% 0%)" });

      const reveal = ScrollTrigger.create({
        trigger: sectionEl,
        start: "top 70%",
        once: true,
        onEnter: () => {
          chapterHeadingRevealed[i] = true;
          if (lineEl)
            gsap.to(lineEl, {
              scaleX: 1,
              duration: DUR.hero,
              ease: GSAP_EASE.primary,
            });
          if (kickerEl)
            gsap.to(kickerEl, {
              opacity: 1,
              y: 0,
              duration: DUR.element,
              ease: GSAP_EASE.secondary,
            });
          if (titleEl)
            gsap.to(titleEl, {
              opacity: 1,
              y: 0,
              duration: DUR.element,
              ease: GSAP_EASE.secondary,
              delay: 0.05,
            });
          if (imageEl)
            gsap.to(imageEl, {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: DUR.hero,
              ease: "power2.out",
              delay: 0.1,
            });
        },
      });
      triggers.push(reveal);

      // "La tinta sube" — relleno sólido del numeral, scrub atado al paso
      // del capítulo por el viewport.
      if (fillEl) {
        gsap.set(fillEl, { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.fromTo(
          fillEl,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: GSAP_EASE.scrub,
            scrollTrigger: {
              trigger: sectionEl,
              start: "top 85%",
              end: "bottom 25%",
              scrub: true,
            },
          },
        );
      }
    });

    // Banda CTA — hairlines se trazan + texto sube de máscara al entrar.
    if (ctaTopLineRef.current && ctaBottomLineRef.current) {
      gsap.set([ctaTopLineRef.current, ctaBottomLineRef.current], {
        scaleX: 0,
      });
      if (ctaKickerRef.current)
        gsap.set(ctaKickerRef.current, { opacity: 0, y: 16 });
      const st = ScrollTrigger.create({
        trigger: ctaTopLineRef.current,
        start: "top 85%",
        once: true,
        onEnter: () => {
          ctaRevealed = true;
          gsap.to([ctaTopLineRef.current, ctaBottomLineRef.current], {
            scaleX: 1,
            duration: DUR.hero,
            ease: GSAP_EASE.primary,
          });
          if (ctaKickerRef.current)
            gsap.to(ctaKickerRef.current, {
              opacity: 1,
              y: 0,
              duration: DUR.element,
              ease: GSAP_EASE.secondary,
            });
        },
      });
      triggers.push(st);
    }

    // Body de capítulos por SplitText (líneas) — gateado a
    // document.fonts.ready, igual que el H1 del boot: si el split corre
    // antes de que Cormorant esté lista, las líneas quedan mal medidas y el
    // reveal puede no llegar a autoAlpha:1. Guardia `cancelled` estándar
    // para no operar sobre refs de una instancia ya desmontada (StrictMode
    // / unmount).
    document.fonts.ready.then(() => {
      if (cancelled) return;

      chapterSectionRefs.current.forEach((sectionEl, i) => {
        if (!sectionEl) return;
        const bodyEl = chapterBodyRefs.current[i];
        if (!bodyEl) return;

        const bodySplit = SplitText.create(bodyEl, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit(self) {
            chapterBodyLineEls[i] = self.lines;
            const st = ScrollTrigger.create({
              trigger: sectionEl,
              start: "top 70%",
              once: true,
              onEnter: () => {
                chapterBodyRevealed[i] = true;
                gsap.from(self.lines, {
                  yPercent: 110,
                  autoAlpha: 0,
                  duration: DUR.element,
                  ease: GSAP_EASE.secondary,
                  stagger: 0.06,
                });
              },
            });
            triggers.push(st);
            return null;
          },
        });
        bodySplits.push(bodySplit);
      });

      // Layout ya estable (fuentes cargadas) — recalcular todos los
      // ScrollTrigger de la página para que el "start" de cada sección sea
      // el real, no el calculado con la fuente fallback.
      ScrollTrigger.refresh();
      checkAndForceReveals();
    });

    // Las imágenes (retrato + foto del capítulo 02) también pueden mover el
    // layout después del primer paint. Un refresh cuando termina de cargar
    // la página cubre ese caso sin depender de que fonts.ready alcance.
    const refreshOnLoad = () => {
      ScrollTrigger.refresh();
      checkAndForceReveals();
    };
    if (document.readyState === "complete") {
      refreshOnLoad();
    } else {
      window.addEventListener("load", refreshOnLoad, { once: true });
    }

    // Chequeo continuo (barato: getBoundingClientRect de ~5 elementos) por
    // si el scroll del usuario cruza una sección cuyo ScrollTrigger, por lo
    // que sea, no disparó.
    let scrollCheckQueued = false;
    const onScroll = () => {
      if (scrollCheckQueued) return;
      scrollCheckQueued = true;
      requestAnimationFrame(() => {
        scrollCheckQueued = false;
        checkAndForceReveals();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Chequeo inmediato (2 frames) — cubre el caso de una sección que ya
    // está dentro del viewport en el primer paint (p. ej. capítulo 01 en
    // pantallas muy altas), sin esperar scroll ni el timeout de abajo.
    requestAnimationFrame(() => requestAnimationFrame(checkAndForceReveals));

    // Red de seguridad incondicional: a los ~1.4s, cualquier sección que ya
    // esté en pantalla y no se haya revelado (SplitText falló,
    // ScrollTrigger no disparó, refresh no alcanzó) se fuerza a su estado
    // final visible. El contenido nunca depende 100% de que el reveal
    // corra.
    const safety = window.setTimeout(checkAndForceReveals, 1400);

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
      window.removeEventListener("load", refreshOnLoad);
      window.removeEventListener("scroll", onScroll);
      triggers.forEach((t) => t.kill());
      bodySplits.forEach((s) => s.revert());
    };
  }, []);

  return (
    <div data-nav-theme="papel" className="-mt-20 section-paper">
      {/* Spacer del Navbar fixed — 96px medido en reposo a 1440px (logo +
          lockup + py-6). Cancela el pt-20 global de MainWrapper para poder
          controlar el gap exacto navbar→eyebrow (≤48px). */}
      <div className="h-24" aria-hidden />

      {/* ============================= R1 — HERO + RETRATO =============================
          Eyebrow, H1, premisa y retrato en el MISMO viewport: sin scroll de
          por medio el cliente ya ve imagen + texto con vida. */}
      <section className="relative px-6 pb-14 pt-8 lg:px-20 lg:pb-16 lg:pt-9">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8">
            {/* Texto — col 1–7 */}
            <div className="lg:col-span-7">
              <p
                ref={eyebrowRef}
                className="font-mono text-xs uppercase tracking-[0.14em] text-ink"
              >
                PROMOTOR OFICIAL MERCEDES-BENZ · AUTOMOTORES MEGA S.A.
              </p>
              <div
                ref={eyebrowLineRef}
                className="mt-3 h-px w-24 origin-left scale-x-0 bg-stroke-ink"
              />

              <h1
                ref={h1Ref}
                className="mt-6 text-balance font-display text-ink [font-size:clamp(2.75rem,2rem+3vw,4.5rem)] [letter-spacing:-0.01em] [line-height:0.98] lg:mt-7"
              >
                <span className="block">Mercedes-Benz,</span>
                <span className="block italic">
                  en persona
                  <span ref={h1DotRef} className="text-mb-blue">
                    .
                  </span>
                </span>
              </h1>

              <div className="mt-8 max-w-[42ch]">
                <p
                  ref={premiseKickerRef}
                  className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-60"
                >
                  LA PREMISA
                </p>
                <p
                  ref={premiseLeadRef}
                  className="mt-3 text-[1.1875rem] leading-[1.6] text-ink"
                >
                  &ldquo;Veinticinco años en el rubro automotriz me enseñaron
                  una cosa: un Mercedes-Benz se elige con calma, con
                  información y con alguien que responda del otro lado.&rdquo;
                </p>
              </div>
            </div>

            {/* Retrato — col 8–12, más grande y arriba: protagonista visual
                desde el primer viewport. */}
            <div className="group/photo lg:col-span-5">
              <div className="relative">
                <div
                  ref={frameHRef}
                  aria-hidden
                  className="pointer-events-none absolute -inset-2 origin-center scale-x-0 border-t border-b border-stroke-ink transition-[inset] duration-[var(--dur-micro)] ease-[var(--ease-micro)] lg:-inset-3 lg:group-hover/photo:-inset-2"
                />
                <div
                  ref={frameVRef}
                  aria-hidden
                  className="pointer-events-none absolute -inset-2 origin-center scale-y-0 border-l border-r border-stroke-ink transition-[inset] duration-[var(--dur-micro)] ease-[var(--ease-micro)] lg:-inset-3 lg:group-hover/photo:-inset-2"
                />
                <div
                  ref={photoFrameRef}
                  onPointerMove={handlePhotoPointerMove}
                  onPointerLeave={handlePhotoPointerLeave}
                  style={{
                    perspective: 1200,
                    clipPath: "inset(100% 0% 0% 0%)",
                  }}
                  className="relative aspect-[3/4] overflow-hidden"
                >
                  <motion.div
                    ref={photoImgWrapRef}
                    style={{
                      rotateX: photoRotateX,
                      rotateY: photoRotateY,
                      transformStyle: "preserve-3d",
                    }}
                    className="absolute inset-0 will-change-transform"
                  >
                    <Image
                      src="/leonardo-portrait.png"
                      alt="Leonardo Guzmán, promotor oficial Mercedes-Benz en Automotores Mega, Paraná"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 460px"
                      className="object-cover object-[center_18%]"
                    />
                  </motion.div>
                </div>
              </div>

              <p
                ref={captionRef}
                className="group/caption relative mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-60"
              >
                LEONARDO GUZMÁN — PARANÁ, ENTRE RÍOS
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-ink-60 transition-transform duration-[var(--dur-micro)] ease-[var(--ease-micro)] group-hover/caption:scale-x-100" />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= R2 — FICHA (stats) ============================= */}
      <section className="relative border-t border-stroke-ink px-6 py-10 lg:px-20 lg:py-12">
        <dl
          ref={statStripRef}
          className="mx-auto grid max-w-[1280px] grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-3"
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} className="group relative pt-6">
              <div
                ref={(el) => {
                  statHairlineRefs.current[i] = el;
                }}
                aria-hidden
                className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-ink transition-transform duration-[var(--dur-micro)] ease-[var(--ease-micro)] group-hover:scale-y-[2]"
              />
              <div
                ref={(el) => {
                  statContentRefs.current[i] = el;
                }}
              >
                <dd
                  ref={(el) => {
                    statValueRefs.current[i] = el;
                  }}
                  className="font-display text-[2.75rem] font-semibold leading-none text-ink transition-transform duration-[var(--dur-micro)] ease-[var(--ease-micro)] group-hover:-translate-y-0.5 lg:text-[3.25rem]"
                >
                  {stat.prefix}
                  {formatStatValue(stat.targetValue)}
                </dd>
                <dt className="mt-3 font-mono text-[11px] uppercase tracking-[0.04em] text-ink-60 transition-[letter-spacing] duration-[var(--dur-micro)] ease-[var(--ease-micro)] group-hover:tracking-[0.08em]">
                  {stat.label}
                </dt>
              </div>
            </div>
          ))}
        </dl>
      </section>

      {/* ============================= R3 — CAPÍTULOS ============================= */}
      <div>
        {CHAPTERS.map((chapter, i) => (
          <section
            key={chapter.num}
            ref={(el) => {
              chapterSectionRefs.current[i] = el;
            }}
            className="relative px-6 py-14 lg:px-20 lg:py-16"
          >
            <div className="mx-auto max-w-[1280px]">
              <div
                ref={(el) => {
                  chapterLineRefs.current[i] = el;
                }}
                className="h-px w-full origin-left scale-x-0 bg-stroke-ink"
              />

              <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-6 lg:mt-10">
                <div className="flex items-baseline gap-4 lg:contents">
                  <div
                    aria-hidden
                    className="relative shrink-0 font-display text-[4.5rem] leading-none lg:col-span-2 lg:text-[8rem]"
                  >
                    <span
                      style={{
                        WebkitTextStroke: "1px var(--color-ink)",
                        color: "transparent",
                      }}
                    >
                      {chapter.num}
                    </span>
                    <span
                      ref={(el) => {
                        chapterNumeralFillRefs.current[i] = el;
                      }}
                      className="absolute inset-0 text-ink"
                      style={{ clipPath: "inset(100% 0% 0% 0%)" }}
                    >
                      {chapter.num}
                    </span>
                  </div>

                  <div className="lg:col-span-3 lg:pt-3">
                    <p
                      ref={(el) => {
                        chapterKickerRefs.current[i] = el;
                      }}
                      className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-60"
                    >
                      {chapter.kicker}
                    </p>
                    <h3
                      ref={(el) => {
                        chapterTitleRefs.current[i] = el;
                      }}
                      className="mt-2 font-display text-[2rem] text-ink lg:text-[2.5rem]"
                    >
                      {chapter.title}
                    </h3>
                  </div>
                </div>

                <p
                  ref={(el) => {
                    chapterBodyRefs.current[i] = el;
                  }}
                  className="mt-6 max-w-[640px] text-[1.0625rem] leading-[1.7] text-ink lg:col-span-4 lg:col-start-7 lg:mt-0 lg:pt-3"
                >
                  {chapter.body}
                </p>

                {i === 1 ? (
                  /* Segunda imagen del capítulo — foto-home.jpg, reveal
                     clip-path al entrar en viewport (misma tinta que el
                     numeral, sin agregar una sección/padding nueva). */
                  <div className="relative mt-6 hidden aspect-[3/4] overflow-hidden lg:col-span-2 lg:col-start-11 lg:mt-0 lg:block">
                    <div
                      ref={chapterImageFrameRef}
                      style={{ clipPath: "inset(0% 0% 100% 0%)" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src="/foto-home.jpg"
                        alt="Leonardo Guzmán junto a un Mercedes-Benz"
                        fill
                        sizes="200px"
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="hidden font-mono text-[11px] text-ink-60 lg:col-start-12 lg:block lg:text-right lg:pt-3">
                    {chapter.num} / 03
                  </p>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ============================= R4 — BANDA CTA ============================= */}
      <section className="relative w-full bg-paper-1 py-14 lg:py-16">
        <div
          ref={ctaTopLineRef}
          aria-hidden
          className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-stroke-ink"
        />
        <div
          ref={ctaBottomLineRef}
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-stroke-ink"
        />

        <div className="mx-auto max-w-[1280px] px-6 lg:px-20">
          <p
            ref={ctaKickerRef}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-60"
          >
            SIGUIENTE PASO
          </p>

          <Link
            href="/contact"
            className="group relative mt-6 flex items-center justify-between py-6 focus-visible:rounded-none! focus-visible:outline-2! focus-visible:outline-offset-4! focus-visible:outline-mb-blue!"
          >
            <span className="relative z-0 font-display text-[2.5rem] text-ink lg:text-[4rem]">
              Contame qué buscás
            </span>
            <span className="relative z-0">
              <ArrowSwap colorClass="text-ink" />
            </span>

            {/* Sweep de banda — plano ink sube desde abajo */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 origin-bottom bg-ink transition-[clip-path] duration-[var(--dur-element)] ease-[var(--ease-primary)] [clip-path:inset(100%_0%_0%_0%)] group-hover:[clip-path:inset(0%_0%_0%_0%)]"
            />
            {/* Capa de texto invertida — visible solo donde el plano ya pasó */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between transition-[clip-path] duration-[var(--dur-element)] ease-[var(--ease-primary)] [clip-path:inset(100%_0%_0%_0%)] group-hover:[clip-path:inset(0%_0%_0%_0%)]"
            >
              <span className="font-display text-[2.5rem] text-paper-0 lg:text-[4rem]">
                Contame qué buscás
              </span>
              <ArrowSwap colorClass="text-paper-0" />
            </span>
          </Link>

          <a
            href={waLink("Hola Leonardo. Quiero hacer una consulta sobre la gama Mercedes-Benz.")}
            target="_blank"
            rel="noopener noreferrer"
            className="group/wa relative mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-60 transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] hover:text-ink focus-visible:rounded-none! focus-visible:outline-2! focus-visible:outline-offset-4! focus-visible:outline-mb-blue!"
          >
            <span className="relative">
              O ESCRIBIME DIRECTO POR WHATSAPP
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-[var(--dur-micro)] ease-[var(--ease-micro)] group-hover/wa:scale-x-100" />
            </span>
            <ArrowUpRight
              size={14}
              className="transition-transform duration-[var(--dur-micro)] ease-[var(--ease-micro)] group-hover/wa:translate-x-[3px] group-hover/wa:-translate-y-[3px]"
            />
          </a>
        </div>
      </section>
    </div>
  );
}
