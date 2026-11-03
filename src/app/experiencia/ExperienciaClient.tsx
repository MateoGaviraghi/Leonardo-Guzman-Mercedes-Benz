"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { DUR, GSAP_EASE, HERO_DELAY } from "@/lib/motion-tokens";
import ScrollProgress from "@/components/ScrollProgress";
import ExperienciaLoader from "./components/ExperienciaLoader";
import CategoriaGrid from "./components/CategoriaGrid";

/**
 * Scroll-scrub via image sequence + canvas (Apple-style).
 *
 * Toda la experiencia vive dentro de UN SOLO sticky h-screen que envuelve los
 * 3 segmentos. Cada segmento tiene su propio canvas con sus 121 frames; los
 * canvas se hacen crossfade entre segmentos (no hay "page breaks"). La intro
 * con título y blur vive en los primeros 5% del progress global.
 */

const FRAMES_PER_SEGMENT = 121;
const padFrame = (n: number) => String(n).padStart(4, "0") + ".jpg";

/** % del progress global donde termina la fase intro del primer segmento. */
const INTRO_END_GLOBAL = 0.05;

/** Ancho del crossfade entre segmentos (en % del progress global). */
const CROSSFADE_BAND = 0.04;

/** Altura total de scroll (cada segmento ocupa SEGMENT_VH viewports). */
const SEGMENT_VH = 320;

const SEGMENTS = [
  {
    folder: "/videos/frames/auto",
    eyebrow: "Autos y SUVs",
    title: "Diseño que define generaciones.",
    description:
      "Sedanes, hatchbacks, coupés, cabriolets y SUVs Mercedes-Benz. Cada línea, una declaración.",
    /** Pausa expresada en LOCAL progress (0..1 dentro del segmento). */
    pauseStart: 0.35,
    pauseEnd: 0.85,
    /** Punto de anclaje horizontal en mobile (0=izq, 0.5=centro, 1=der).
     *  Permite que el sujeto entre en el viewport portrait al hacer cover. */
    mobileFocusX: 0.5,
  },
  {
    folder: "/videos/frames/sprinter",
    eyebrow: "Vans y Sprinter",
    title: "Tu negocio, en movimiento.",
    description:
      "Vito y Sprinter en sus configuraciones Furgón, Combi, Mixto y Chasis. Versatilidad sin compromiso.",
    pauseStart: 0.18,
    pauseEnd: 0.85,
    mobileFocusX: 0.5,
  },
  {
    folder: "/videos/frames/truck",
    eyebrow: "Trucks",
    title: "Potencia que respalda tu trabajo.",
    description:
      "Accelo, Atego, Actros y Arocs. La gama de camiones Mercedes-Benz para cada operación.",
    pauseStart: 0.18,
    pauseEnd: 0.85,
    /** Truck orientado hacia la derecha — mostrar más del lado derecho del
     *  frame para que el frente entre en el viewport mobile portrait. */
    mobileFocusX: 0.72,
  },
];

/**
 * Destinos "Explorar" de cada capítulo (mapeo segmento → categoría primaria).
 * Decisión de diseño sobre hrefs YA existentes en la grilla, no dato de negocio.
 */
const CHAPTER_HREF = [
  "/vehicles?category=auto", // seg 0 · Autos y SUVs
  "/vehicles?category=sprinter", // seg 1 · Vans y Sprinter
  "/vehicles?category=trucks", // seg 2 · Trucks
];

export default function ExperienciaClient() {
  const mainSectionRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imagesRef = useRef<HTMLImageElement[][]>([[], [], []]);

  // Intro layer (dentro del sticky)
  const introScrimRef = useRef<HTMLDivElement>(null);
  const introTextRef = useRef<HTMLDivElement>(null);
  const introTitleRef = useRef<HTMLHeadingElement>(null);

  // Refs de los hijos de cada overlay (coreografía por líneas/elementos)
  const ovEyebrowRefs = useRef<(HTMLElement | null)[]>([]);
  const ovTitleRefs = useRef<(HTMLElement | null)[]>([]);
  const ovLeadRefs = useRef<(HTMLElement | null)[]>([]);
  const ovExploreRefs = useRef<(HTMLElement | null)[]>([]);

  // Timeline de reveal por capítulo (construida una vez, paused) + pausa
  // dominante única (un solo overlay activo a la vez).
  const chapterTimelinesRef = useRef<(gsap.core.Timeline | null)[]>([]);
  const activePauseRef = useRef<number>(-1);

  // Indicador único 01-02-03
  const indicatorRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  // Gate de pintado por progreso: un overlay cuyo timeline está en 0 no
  // puede pintar nada. Se llama tanto desde el rAF de scroll como desde el
  // onUpdate de cada timeline (GSAP sigue animando en background aunque el
  // usuario deje de scrollear a mitad de la coreografía — sin esto el
  // contenedor quedaría con visibility stale, congelado en el último
  // snapshot del scroll).
  const syncOverlayVisibility = useCallback(() => {
    overlayRefs.current.forEach((o, i) => {
      if (!o) return;
      const tl = chapterTimelinesRef.current[i];
      o.style.visibility = tl && tl.progress() > 0 ? "visible" : "hidden";
    });
  }, []);

  // Pre-carga del segmento 0 SOLO: el gate `ready` y el `%` cuentan estos 121
  // frames. Los seg 1 y 2 NO se piden acá — así el burst inicial es ~14MB en
  // vez de ~33MB y no compiten por ancho de banda con el primer paint del
  // scrub. Se difieren al effect encadenado de abajo (post-`ready`).
  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;
    let loaded0 = 0;

    const seg = SEGMENTS[0];
    const arr: HTMLImageElement[] = [];
    for (let i = 1; i <= FRAMES_PER_SEGMENT; i++) {
      const img = new window.Image();
      img.src = `${seg.folder}/${padFrame(i)}`;
      const onDone = () => {
        loaded0++;
        if (mounted) {
          setProgress(loaded0 / FRAMES_PER_SEGMENT);
          if (loaded0 === FRAMES_PER_SEGMENT) setReady(true);
        }
      };
      img.onload = onDone;
      img.onerror = onDone;
      arr.push(img);
    }
    imagesRef.current[0] = arr;

    return () => {
      mounted = false;
    };
  }, []);

  // Pre-carga diferida de los segmentos 1 y 2: recién arranca cuando el seg 0
  // está listo (`ready`) y el navegador está ocioso (`requestIdleCallback`, con
  // fallback a setTimeout). Sin handlers de progress/ready — solo dejan la
  // imagen decodificada en imagesRef a medida que se resuelven; el fallback de
  // "último frame decodificado" del rAF cubre cualquier scroll que llegue antes.
  useEffect(() => {
    if (!ready || typeof window === "undefined") return;

    const preloadRest = () => {
      for (let segIdx = 1; segIdx < SEGMENTS.length; segIdx++) {
        if (imagesRef.current[segIdx].length) continue;
        const seg = SEGMENTS[segIdx];
        const arr: HTMLImageElement[] = [];
        for (let i = 1; i <= FRAMES_PER_SEGMENT; i++) {
          const img = new window.Image();
          img.src = `${seg.folder}/${padFrame(i)}`;
          arr.push(img);
        }
        imagesRef.current[segIdx] = arr;
      }
    };

    const ric = (
      window as Window & {
        requestIdleCallback?: (cb: () => void) => number;
        cancelIdleCallback?: (id: number) => void;
      }
    ).requestIdleCallback;

    if (typeof ric === "function") {
      const id = ric(preloadRest);
      return () => {
        (
          window as Window & { cancelIdleCallback?: (id: number) => void }
        ).cancelIdleCallback?.(id);
      };
    }

    const t = window.setTimeout(preloadRest, 200);
    return () => window.clearTimeout(t);
  }, [ready]);

  // Scroll-scrub con single sticky + crossfade entre segmentos
  useEffect(() => {
    if (!ready) return;
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const drawFrame = (
      canvas: HTMLCanvasElement,
      img: HTMLImageElement,
      focusX = 0.5
    ) => {
      const ctx = canvas.getContext("2d");
      if (!ctx || !img.complete || img.naturalWidth === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = w / h;
      let drawW: number, drawH: number, drawX: number, drawY: number;
      if (imgAspect > canvasAspect) {
        // Frame más ancho que el canvas (típico en mobile portrait con frame 16:9):
        // se hace cover por altura y se croppean los lados según focusX.
        drawH = h;
        drawW = h * imgAspect;
        drawX = (w - drawW) * focusX;
        drawY = 0;
      } else {
        drawW = w;
        drawH = w / imgAspect;
        drawX = 0;
        drawY = (h - drawH) / 2;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    };

    // Helper: obtener focusX correcto según viewport y segmento
    const getFocusX = (segIdx: number) => {
      if (window.innerWidth >= 768) return 0.5; // desktop: centro
      return SEGMENTS[segIdx].mobileFocusX;
    };

    // Frame inicial de cada canvas
    SEGMENTS.forEach((_, i) => {
      const c = canvasRefs.current[i];
      const img = imagesRef.current[i][0];
      if (c && img) drawFrame(c, img, getFocusX(i));
    });

    if (reduced) {
      // Frame medio de cada segmento; los overlays estáticos los resuelve el
      // effect de capítulos (estado final + visibility solo del activeIdx).
      SEGMENTS.forEach((_, i) => {
        const c = canvasRefs.current[i];
        const img = imagesRef.current[i][Math.floor(FRAMES_PER_SEGMENT / 2)];
        if (c && img) drawFrame(c, img, getFocusX(i));
      });
      return;
    }

    const update = () => {
      const main = mainSectionRef.current;
      if (!main) return;

      const rect = main.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = main.offsetHeight - vh;
      const globalP = Math.max(
        0,
        Math.min(1, -rect.top / Math.max(1, scrollable))
      );

      // ── INTRO ──
      // Cold-open: el scrim negro sólido baja su opacity con el scroll
      // (compositor-safe, sin blur animado).
      const introScrim = introScrimRef.current;
      const introText = introTextRef.current;
      const introProgress = Math.min(1, globalP / INTRO_END_GLOBAL);
      if (introScrim) {
        introScrim.style.opacity = String(0.72 * (1 - introProgress));
      }
      if (introText) {
        introText.style.opacity = String(
          Math.max(0, 1 - introProgress * 1.6)
        );
        introText.style.transform = `translateY(${introProgress * -40}px)`;
        introText.style.pointerEvents = introProgress >= 1 ? "none" : "auto";
      }

      // ── SEGMENTOS ──
      // Cada segmento ocupa 1/N del progress global. Calculamos para cada uno:
      // - localP: 0..1 dentro del segmento (para el frame del scrub)
      // - opacity: cuánto se ve este canvas (crossfade en los bordes)
      const span = 1 / SEGMENTS.length;

      // Active idx: el segmento que corresponde al rango actual de globalP.
      // Calculado por floor() para que el cambio sea exacto en los midpoints.
      const activeIdx = Math.min(
        SEGMENTS.length - 1,
        Math.floor(globalP * SEGMENTS.length)
      );

      // Pausa dominante: el segmento cuya pausa está abierta según progress,
      // o -1 si ninguna. Un solo overlay puede estar activo a la vez.
      let pauseIdx = -1;

      SEGMENTS.forEach((seg, i) => {
        const canvas = canvasRefs.current[i];
        const imgs = imagesRef.current[i];
        if (!canvas || !imgs.length) return;

        const segStart = i * span;
        const segEnd = (i + 1) * span;

        // Local progress dentro del segmento (clampeado a 0..1)
        let localP = (globalP - segStart) / span;
        localP = Math.max(0, Math.min(1, localP));

        // Opacity con crossfade en los bordes
        let canvasOpacity = 0;
        if (i === 0) {
          // Primer segmento: visible desde el inicio, fade-out al final
          if (globalP < segEnd - CROSSFADE_BAND) {
            canvasOpacity = 1;
          } else if (globalP < segEnd) {
            canvasOpacity = (segEnd - globalP) / CROSSFADE_BAND;
          } else {
            canvasOpacity = 0;
          }
        } else if (i === SEGMENTS.length - 1) {
          // Último segmento: fade-in al inicio, visible hasta el final
          if (globalP < segStart) {
            canvasOpacity = 0;
          } else if (globalP < segStart + CROSSFADE_BAND) {
            canvasOpacity = (globalP - segStart) / CROSSFADE_BAND;
          } else {
            canvasOpacity = 1;
          }
        } else {
          // Segmentos del medio: fade-in en inicio, fade-out al final
          if (globalP < segStart) {
            canvasOpacity = 0;
          } else if (globalP < segStart + CROSSFADE_BAND) {
            canvasOpacity = (globalP - segStart) / CROSSFADE_BAND;
          } else if (globalP < segEnd - CROSSFADE_BAND) {
            canvasOpacity = 1;
          } else if (globalP < segEnd) {
            canvasOpacity = (segEnd - globalP) / CROSSFADE_BAND;
          } else {
            canvasOpacity = 0;
          }
        }

        canvas.style.opacity = String(canvasOpacity);

        // Frame del canvas: en el primer segmento, durante la fase intro,
        // el frame queda en 0. Después se hace scrub normal.
        let effectiveLocal = localP;
        if (i === 0) {
          // INTRO_END_GLOBAL en términos del local progress del seg 0:
          // intro va de globalP 0 a INTRO_END_GLOBAL. Eso es localP 0 a INTRO_END_GLOBAL/span.
          const introLocal = INTRO_END_GLOBAL / span;
          if (localP < introLocal) {
            effectiveLocal = 0;
          } else {
            effectiveLocal = (localP - introLocal) / (1 - introLocal);
          }
        }

        const frameIdx = Math.min(
          FRAMES_PER_SEGMENT - 1,
          Math.floor(effectiveLocal * FRAMES_PER_SEGMENT)
        );
        // Fallback: si el frame objetivo aún no decodificó (scroll rápido a
        // seg 2/3 antes de que termine su carga en background), se dibuja el
        // último frame decodificado ≤ frameIdx. Se sigue dibujando en cada
        // rAF (no se cachea "ya dibujé este frame") para que se autorepare
        // apenas el frame real decodifique.
        const isDecoded = (im?: HTMLImageElement) =>
          !!im && im.complete && im.naturalWidth > 0;
        let fi = frameIdx;
        while (fi > 0 && !isDecoded(imgs[fi])) fi--;
        const img = imgs[fi];
        if (img && isDecoded(img) && canvasOpacity > 0)
          drawFrame(canvas, img, getFocusX(i));

        // La coreografía la posee la timeline GSAP, NO se anima por
        // inline-style. Para el seg 0 usamos effectiveLocal (la pausa está
        // sobre el video real). Registramos el segmento dominante — el que
        // esté en pausa con más opacidad de canvas — para exclusividad.
        const overlayP = i === 0 ? effectiveLocal : localP;
        const inPause =
          overlayP >= seg.pauseStart &&
          overlayP <= seg.pauseEnd &&
          canvasOpacity > 0.5;
        if (inPause) pauseIdx = i;
      });

      // ── EXCLUSIVIDAD DE OVERLAY: un solo capítulo activo a la vez ──
      if (pauseIdx !== activePauseRef.current) {
        const prevIdx = activePauseRef.current;
        if (prevIdx !== -1) {
          const prevTl = chapterTimelinesRef.current[prevIdx];
          if (prevTl) prevTl.reverse();
        }
        if (pauseIdx !== -1) {
          const nextTl = chapterTimelinesRef.current[pauseIdx];
          if (nextTl) nextTl.play();
        }
        activePauseRef.current = pauseIdx;
      }

      // Gate de pintado por progreso (evita que un overlay "reversing" quede
      // pisando al activo mientras su opacity todavía no llegó a 0).
      syncOverlayVisibility();

      // ── INDICADOR ÚNICO 01-02-03 ──
      // Activo blanco puro; inactivo cae al text-silver-500 de la clase.
      indicatorRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.color = i === activeIdx ? "#ffffff" : "";
      });
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [ready, syncOverlayVisibility]);

  // ── Entrada del título de la intro: SplitText chars (misma voz que el H1
  //    del home). Corre cuando la ruta está lista y las fonts cargaron.
  useEffect(() => {
    if (!ready || typeof window === "undefined") return;

    const w = window as Window & { __gsapSplitTextRegistered?: boolean };
    if (!w.__gsapSplitTextRegistered) {
      gsap.registerPlugin(SplitText);
      w.__gsapSplitTextRegistered = true;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      // Sin split: el título queda visible tal cual.
      if (introTitleRef.current)
        gsap.set(introTitleRef.current, { autoAlpha: 1 });
      return;
    }

    // Safety: nunca dejar el título atrapado invisible si SplitText tarda/falla.
    const safety = window.setTimeout(() => {
      if (introTitleRef.current)
        gsap.set(introTitleRef.current, { autoAlpha: 1 });
    }, 1500);

    let split: SplitText | undefined;
    document.fonts.ready.then(() => {
      window.clearTimeout(safety);
      if (!introTitleRef.current) return;
      split = SplitText.create(introTitleRef.current, {
        type: "chars, words",
        mask: "chars",
        autoSplit: true,
        onSplit(self) {
          return gsap.timeline({ delay: HERO_DELAY }).from(self.chars, {
            yPercent: 120,
            duration: DUR.hero,
            ease: GSAP_EASE.primary,
            stagger: 0.02,
          });
        },
      });
    });

    return () => {
      window.clearTimeout(safety);
      split?.revert();
    };
  }, [ready]);

  // ── Sistema de capítulos: una timeline de reveal por overlay (paused),
  //    disparada por flanco de pausa desde el rAF. Reduced-motion: estado
  //    final + visibility solo del activeIdx (no apilar 3 bloques).
  useEffect(() => {
    if (!ready || typeof window === "undefined") return;

    const w = window as Window & { __gsapSplitTextRegistered?: boolean };
    if (!w.__gsapSplitTextRegistered) {
      gsap.registerPlugin(SplitText);
      w.__gsapSplitTextRegistered = true;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      // Estado final de los hijos de TODOS los overlays.
      SEGMENTS.forEach((_, i) => {
        const els = [
          ovEyebrowRefs.current[i],
          ovLeadRefs.current[i],
          ovExploreRefs.current[i],
        ].filter((el): el is HTMLElement => Boolean(el));
        if (els.length) gsap.set(els, { opacity: 1, y: 0 });
        if (ovTitleRefs.current[i])
          gsap.set(ovTitleRefs.current[i], { autoAlpha: 1 });
      });

      // Listener liviano: mostrar SOLO el overlay del segmento activo.
      const applyVisibility = () => {
        const main = mainSectionRef.current;
        if (!main) return;
        const rect = main.getBoundingClientRect();
        const vh = window.innerHeight;
        const scrollable = main.offsetHeight - vh;
        const gp = Math.max(
          0,
          Math.min(1, -rect.top / Math.max(1, scrollable))
        );
        const active = Math.min(
          SEGMENTS.length - 1,
          Math.floor(gp * SEGMENTS.length)
        );
        overlayRefs.current.forEach((o, i) => {
          if (o) o.style.visibility = i === active ? "visible" : "hidden";
        });

        // Intro: toggle discreto (sin animación) por posición de scroll —
        // en reduced-motion el scrub de salida no corre, así que la intro
        // debe ocultarse apenas se abandona el primer viewport.
        const introHidden = window.scrollY > vh * 0.5;
        if (introTextRef.current) {
          introTextRef.current.style.opacity = introHidden ? "0" : "1";
          introTextRef.current.style.pointerEvents = introHidden
            ? "none"
            : "auto";
        }
        if (introScrimRef.current) {
          introScrimRef.current.style.opacity = introHidden ? "0" : "0.72";
        }
      };
      window.addEventListener("scroll", applyVisibility, { passive: true });
      window.addEventListener("resize", applyVisibility);
      applyVisibility();

      return () => {
        window.removeEventListener("scroll", applyVisibility);
        window.removeEventListener("resize", applyVisibility);
      };
    }

    // No-reduced: estado inicial oculto ya (evita flash antes de fonts.ready).
    SEGMENTS.forEach((_, i) => {
      const els = [
        ovEyebrowRefs.current[i],
        ovLeadRefs.current[i],
        ovExploreRefs.current[i],
      ].filter((el): el is HTMLElement => Boolean(el));
      if (els.length) gsap.set(els, { opacity: 0, y: 16 });
      if (ovTitleRefs.current[i])
        gsap.set(ovTitleRefs.current[i], { autoAlpha: 0 });
    });

    const splits: SplitText[] = [];
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled) return;
      SEGMENTS.forEach((_, i) => {
        const eyebrow = ovEyebrowRefs.current[i];
        const title = ovTitleRefs.current[i];
        const lead = ovLeadRefs.current[i];
        const explore = ovExploreRefs.current[i];
        if (!eyebrow || !title || !lead || !explore) return;

        const split = SplitText.create(title, {
          type: "lines",
          mask: "lines",
        });
        splits.push(split);

        const tl = gsap
          .timeline({ paused: true, onUpdate: syncOverlayVisibility })
          .to(
            eyebrow,
            { opacity: 1, y: 0, duration: DUR.element, ease: GSAP_EASE.secondary },
            0
          )
          .set(title, { autoAlpha: 1 }, "-=0.1")
          .from(
            split.lines,
            {
              yPercent: 110,
              duration: DUR.element,
              ease: GSAP_EASE.primary,
              stagger: 0.08,
            },
            "-=0.1"
          )
          .to(
            lead,
            { opacity: 1, y: 0, duration: DUR.element, ease: GSAP_EASE.secondary },
            "-=0.3"
          )
          .to(
            explore,
            { opacity: 1, y: 0, duration: DUR.element, ease: GSAP_EASE.secondary },
            "-=0.3"
          );

        chapterTimelinesRef.current[i] = tl;
      });
    });

    return () => {
      cancelled = true;
      chapterTimelinesRef.current.forEach((tl) => tl?.kill());
      chapterTimelinesRef.current = [];
      activePauseRef.current = -1;
      splits.forEach((s) => s.revert());
    };
  }, [ready, syncOverlayVisibility]);

  const totalHeightVh = SEGMENTS.length * SEGMENT_VH;

  return (
    <div className="bg-black text-white">
      {/* Progress de scroll — vive SOLO en esta ruta (chrome-global §2.8) */}
      <ScrollProgress />
      {/* Loading state */}
      {!ready && <ExperienciaLoader pct={Math.round(progress * 100)} />}

      {/* Single sticky que envuelve los 3 segmentos: transiciones fluidas
          (crossfade entre canvas) en lugar de page breaks por segmento. */}
      <div
        ref={mainSectionRef}
        className="relative"
        style={{ height: `${totalHeightVh}vh` }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
          {/* 3 canvas apilados — opacity controlada por scroll progress */}
          {SEGMENTS.map((_, i) => (
            <canvas
              key={i}
              ref={(el) => {
                canvasRefs.current[i] = el;
              }}
              className="absolute inset-0 w-full h-full will-change-[opacity]"
              style={{ opacity: i === 0 ? 1 : 0 }}
            />
          ))}

          {/* Cold-open: frame 1 nítido + scrim negro que baja su opacity con el scroll */}
          <div
            ref={introScrimRef}
            aria-hidden
            className="absolute inset-0 bg-black pointer-events-none will-change-[opacity]"
            style={{ opacity: 0.72 }}
          />
          <div
            ref={introTextRef}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center will-change-[transform,opacity]"
            style={{ opacity: 1 }}
          >
            <p className="text-eyebrow mb-6 font-mono uppercase tracking-[0.14em] text-silver-300">
              La gama · Mercedes-Benz
            </p>
            <h1
              ref={introTitleRef}
              className="text-display-1 max-w-4xl text-balance font-display font-medium text-white [letter-spacing:-0.01em]"
            >
              Tres caminos.
              <br />
              Una sola estrella.
            </h1>
            <div className="mt-12 flex flex-col items-center gap-2 text-silver-500 md:mt-16">
              <span className="text-eyebrow font-mono uppercase tracking-[0.14em]">
                Scroll
              </span>
              <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </div>

          {/* Vignette + gradiente para legibilidad de los overlays de cada segmento */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40 pointer-events-none" />

          {/* Capítulos: un overlay por segmento. El reveal lo posee GSAP
              (timeline por segmento); acá cero transición CSS. */}
          {SEGMENTS.map((seg, i) => (
            <div
              key={`overlay-${i}`}
              ref={(el) => {
                overlayRefs.current[i] = el;
              }}
              className="pointer-events-none absolute inset-0 flex items-end px-6 pb-24 md:px-12 md:pb-32"
            >
              {/* Seg 2 (Sprinter): carrocería clara bajo el título → scrim
                  izquierdo levemente más profundo, solo en desktop, para
                  sostener el contraste del titular. Paint detrás del texto
                  (el bloque de texto es `relative`). */}
              {i === 1 && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-black/55 via-transparent to-transparent md:block"
                />
              )}
              <div className="relative mx-auto max-w-2xl text-center md:mx-0 md:ml-12 md:text-left lg:ml-24">
                <p
                  ref={(el) => {
                    ovEyebrowRefs.current[i] = el;
                  }}
                  className="text-eyebrow mb-4 font-mono uppercase tracking-[0.14em] text-silver-300"
                >
                  {`0${i + 1} — ${seg.eyebrow}`}
                </p>
                <h2
                  ref={(el) => {
                    ovTitleRefs.current[i] = el;
                  }}
                  className="text-display-2 mb-5 text-balance font-display font-medium text-white"
                >
                  {seg.title}
                </h2>
                <p
                  ref={(el) => {
                    ovLeadRefs.current[i] = el;
                  }}
                  className="text-lead mb-8 max-w-xl font-light text-silver-100 [text-wrap:balance]"
                >
                  {seg.description}
                </p>
                <Link
                  href={CHAPTER_HREF[i]}
                  ref={(el) => {
                    ovExploreRefs.current[i] = el;
                  }}
                  className="group/ex pointer-events-auto inline-flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mb-blue"
                >
                  <span className="text-eyebrow font-mono uppercase tracking-[0.14em] text-silver-300 transition-colors duration-[var(--dur-micro)] group-hover/ex:text-white">
                    Explorar
                  </span>
                  <span
                    aria-hidden
                    className="flex h-9 w-9 items-center justify-center border border-white/45 transition-colors duration-[var(--dur-micro)] group-hover/ex:border-white/70"
                  >
                    <ArrowRight
                      size={15}
                      strokeWidth={1.5}
                      className="text-white transition-transform duration-[var(--dur-micro)] ease-[var(--ease-micro)] group-hover/ex:translate-x-1"
                    />
                  </span>
                </Link>
              </div>
            </div>
          ))}

          {/* Indicador de capítulos: numerales mono, activo blanco. Cero círculos. */}
          <div className="pointer-events-none absolute right-6 top-24 z-20 flex flex-col gap-3 md:right-12">
            {SEGMENTS.map((_, i) => (
              <div
                key={`ind-${i}`}
                ref={(el) => {
                  indicatorRefs.current[i] = el;
                }}
                className="text-eyebrow font-mono uppercase tabular-nums tracking-[0.14em] text-silver-500 transition-colors duration-[var(--dur-micro)]"
              >
                0{i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grilla final — 5 categorías */}
      <CategoriaGrid />
    </div>
  );
}
