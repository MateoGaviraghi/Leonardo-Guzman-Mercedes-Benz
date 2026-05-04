"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowDown } from "lucide-react";

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

const CATEGORIES = [
  {
    id: "auto",
    name: "Autos",
    href: "/vehicles?category=auto",
    description: "Sedanes, hatchbacks, coupés y cabriolets.",
    featuredName: "Clase S",
    image: "/vehicles/7eba156c-0097-4ee7-acfc-7a2b89d92598/foto-card/card.jpg",
  },
  {
    id: "suv",
    name: "SUVs",
    href: "/vehicles?category=suv",
    description: "Crossovers y todo terreno.",
    featuredName: "EQA",
    image: "/vehicles/fe9a948b-abf8-4415-977e-944a4d24ae62/foto-card/card.jpg",
  },
  {
    id: "vans",
    name: "Vans",
    href: "/vehicles?category=vans",
    description: "Vito Tourer y Vito Mixto.",
    featuredName: "Vito Tourer",
    image: "/vehicles/vito-tourer/foto-card/card.avif",
  },
  {
    id: "sprinter",
    name: "Sprinter",
    href: "/vehicles?category=sprinter",
    description: "Furgón, Combi, Mixto y Chasis.",
    featuredName: "Sprinter Furgón",
    image: "/vehicles/sprinter-furgon/foto-card/card.webp",
  },
  {
    id: "trucks",
    name: "Trucks",
    href: "/vehicles?category=trucks",
    description: "Accelo, Atego, Actros y Arocs.",
    featuredName: "Actros",
    image: "/vehicles/ee10dd62-79cb-470b-9c6d-55dfa6314108/foto-card/card.jpg",
  },
];

export default function ExperienciaClient() {
  const mainSectionRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imagesRef = useRef<HTMLImageElement[][]>([[], [], []]);

  // Intro layer (dentro del sticky)
  const introBlurRef = useRef<HTMLDivElement>(null);
  const introTextRef = useRef<HTMLDivElement>(null);

  // Indicador único 01-02-03
  const indicatorRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  // Pre-carga todas las imágenes
  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;
    let loaded = 0;
    const total = SEGMENTS.length * FRAMES_PER_SEGMENT;

    SEGMENTS.forEach((seg, segIdx) => {
      const arr: HTMLImageElement[] = [];
      for (let i = 1; i <= FRAMES_PER_SEGMENT; i++) {
        const img = new window.Image();
        img.src = `${seg.folder}/${padFrame(i)}`;
        const onDone = () => {
          loaded++;
          if (mounted) {
            setProgress(loaded / total);
            if (loaded === total) setReady(true);
          }
        };
        img.onload = onDone;
        img.onerror = onDone;
        arr.push(img);
      }
      imagesRef.current[segIdx] = arr;
    });

    return () => {
      mounted = false;
    };
  }, []);

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
      // Mostrar el frame de la pausa de cada segmento + overlays visibles
      SEGMENTS.forEach((_, i) => {
        const c = canvasRefs.current[i];
        const img = imagesRef.current[i][Math.floor(FRAMES_PER_SEGMENT / 2)];
        if (c && img) drawFrame(c, img, getFocusX(i));
      });
      overlayRefs.current.forEach((o) => {
        if (o) {
          o.style.opacity = "1";
          o.style.transform = "translateY(0)";
        }
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
      const introBlur = introBlurRef.current;
      const introText = introTextRef.current;
      const introProgress = Math.min(1, globalP / INTRO_END_GLOBAL);
      if (introBlur) {
        const blur = 20 * (1 - introProgress);
        introBlur.style.backdropFilter = `blur(${blur}px)`;
        (introBlur.style as CSSStyleDeclaration & {
          webkitBackdropFilter?: string;
        }).webkitBackdropFilter = `blur(${blur}px)`;
        introBlur.style.opacity =
          introProgress >= 1 ? "0" : String(1 - introProgress * 0.3);
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

      SEGMENTS.forEach((seg, i) => {
        const canvas = canvasRefs.current[i];
        const overlay = overlayRefs.current[i];
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
        const img = imgs[frameIdx];
        if (img && canvasOpacity > 0) drawFrame(canvas, img, getFocusX(i));

        // Overlay con info (visible durante la pausa local del segmento)
        if (overlay) {
          // Para el seg 0 usamos effectiveLocal (porque la pausa está sobre el video real)
          const overlayP = i === 0 ? effectiveLocal : localP;
          const inPause =
            overlayP >= seg.pauseStart &&
            overlayP <= seg.pauseEnd &&
            canvasOpacity > 0.5;
          overlay.style.opacity = inPause ? "1" : "0";
          overlay.style.transform = inPause
            ? "translateY(0)"
            : "translateY(20px)";
        }
      });

      // ── INDICADOR ÚNICO 01-02-03 ──
      indicatorRefs.current.forEach((el, i) => {
        if (!el) return;
        const isActive = i === activeIdx;
        el.style.opacity = isActive ? "1" : "0.35";
        el.style.color = isActive ? "rgb(255, 255, 255)" : "rgba(255,255,255,0.6)";
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
  }, [ready]);

  const totalHeightVh = SEGMENTS.length * SEGMENT_VH;

  return (
    <div className="bg-black text-white">
      {/* Loading state */}
      {!ready && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-6">
            Cargando experiencia
          </p>
          <div className="w-48 h-px bg-white/10 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-white transition-[width] duration-200 ease-linear"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gray-600 mt-4 tabular-nums">
            {Math.round(progress * 100)}%
          </p>
        </div>
      )}

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

          {/* INTRO — capa con blur + título "Tres caminos / Una sola estrella" */}
          <div
            ref={introBlurRef}
            className="absolute inset-0 will-change-[backdrop-filter] pointer-events-none"
            style={{
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          />
          <div
            ref={introTextRef}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-black/60 will-change-[opacity,transform]"
            style={{ opacity: 1 }}
          >
            <p className="text-xs md:text-sm font-medium tracking-[0.3em] uppercase text-white/70 mb-6">
              La gama · Mercedes-Benz
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-[1.05] text-white max-w-4xl">
              Tres caminos.
              <br />
              Una sola estrella.
            </h1>
            <div className="mt-12 md:mt-16 flex flex-col items-center gap-2 text-white/40 animate-pulse">
              <span className="text-[10px] tracking-[0.3em] uppercase">
                Scroll
              </span>
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* Vignette + gradiente para legibilidad de los overlays de cada segmento */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40 pointer-events-none" />

          {/* Overlays de info (uno por segmento, solo activo en su pausa) */}
          {SEGMENTS.map((seg, i) => (
            <div
              key={`overlay-${i}`}
              ref={(el) => {
                overlayRefs.current[i] = el;
              }}
              className="absolute inset-0 flex items-end pb-20 md:pb-32 px-6 md:px-12 transition-[opacity,transform] duration-700 ease-out pointer-events-none"
              style={{ opacity: 0, transform: "translateY(20px)" }}
            >
              <div className="max-w-3xl mx-auto md:mx-0 md:ml-12 lg:ml-24 text-center md:text-left">
                <p className="text-xs md:text-sm font-medium tracking-[0.3em] uppercase text-white/70 mb-4">
                  {seg.eyebrow}
                </p>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-[1.05] text-white mb-6">
                  {seg.title}
                </h2>
                <p className="text-base md:text-lg font-light text-white/80 max-w-xl leading-relaxed">
                  {seg.description}
                </p>
              </div>
            </div>
          ))}

          {/* Indicador único 01 02 03 — los 3 visibles, el activo destacado */}
          <div className="absolute top-24 right-6 md:right-12 flex flex-col gap-3 pointer-events-none">
            {SEGMENTS.map((_, i) => (
              <div
                key={`ind-${i}`}
                ref={(el) => {
                  indicatorRefs.current[i] = el;
                }}
                className="text-xs font-medium tracking-[0.3em] uppercase transition-[opacity,color] duration-500 ease-out"
                style={{ opacity: i === 0 ? 1 : 0.35 }}
              >
                0{i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grilla final — 5 categorías */}
      <section className="min-h-screen bg-surface-0 py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <p className="text-xs md:text-sm font-medium tracking-[0.3em] uppercase text-gray-500 mb-4">
              Elegí tu categoría
            </p>
            <h2 className="text-4xl md:text-6xl font-serif tracking-tight leading-tight max-w-3xl mx-auto">
              Una gama para cada propósito.
            </h2>
          </div>

          {/* Cards horizontales 3+2 */}
          <div className="flex flex-wrap gap-4 md:gap-5 justify-center">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="group relative block w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)] aspect-[16/9] overflow-hidden bg-neutral-900 border-2 border-transparent hover:border-white/20 transition-all duration-500"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-5 md:p-6">
                  <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-white/70 mb-2">
                    {cat.featuredName}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-2xl md:text-3xl font-serif text-white tracking-tight">
                      {cat.name}
                    </h3>
                    <div className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                      <ArrowRight
                        size={15}
                        className="text-white"
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/60 [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0%_0_0)] transition-[clip-path] duration-700 ease-out" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
