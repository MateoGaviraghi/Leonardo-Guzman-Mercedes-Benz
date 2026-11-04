"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { DUR, GSAP_EASE } from "@/lib/motion-tokens";
import { SlideCounter } from "./SlideCounter";
import { DragHint } from "./DragHint";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * Showroom Stage — carrusel Embla center-mode con vecinos asomando,
 * autoplay 5.5s + barra sincronizada, HUD (contador+título) y dos
 * regímenes de imagen: "cover" (exterior/interior) y "backdrop" (colores).
 * Motor Embla intacto (drag+snap). Reskin sobre el patrón Apple Cards Carousel.
 */

export type ShowroomSlide = {
  key: string;
  /** Capa foreground ya construida por el wrapper (MultiFormatImage/Image). */
  media: ReactNode;
  /** Solo régimen "backdrop": misma imagen del slide (o undefined si falta asset). */
  backdropSrc?: string;
  /** Título del slide -> HUD (línea enmascarada al cambiar). Dato, no chrome. */
  title?: string;
  /** Descripción del slide -> body copy debajo del escenario. Dato, no chrome. */
  description?: ReactNode;
};

const A_SCALE = 0.94;
const A_OPACITY = 0.4;
const RESUME_DELAY_MS = 4000;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function registerScrollTrigger() {
  if (typeof window === "undefined") return;
  const w = window as Window & { __gsapScrollTriggerRegistered?: boolean };
  if (!w.__gsapScrollTriggerRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    w.__gsapScrollTriggerRegistered = true;
  }
}

export function ShowroomCarousel({
  slides,
  regime,
  tone,
  isAMG = false,
  autoplayMs = 5500,
}: {
  slides: ShowroomSlide[];
  regime: "cover" | "backdrop";
  tone: "dark" | "light" | "amg";
  isAMG?: boolean;
  autoplayMs?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Contador tick 00->01: arranca en -1 (SlideCounter muestra "00 / N"),
  // pasa a selectedIndex real en el primer select/mount visible.
  const [counterShown, setCounterShown] = useState(-1);
  const [hintVisible, setHintVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const hintDoneRef = useRef(false);
  const hintDismissRef = useRef<(() => void) | null>(null);
  const pauseAutoplayRef = useRef<(() => void) | null>(null);
  const resumeAutoplayRef = useRef<(() => void) | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const parallaxRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setSlideRef = useCallback(
    (i: number) => (el: HTMLDivElement | null) => {
      slideRefs.current[i] = el;
    },
    []
  );
  const setParallaxRef = useCallback(
    (i: number) => (el: HTMLDivElement | null) => {
      parallaxRefs.current[i] = el;
    },
    []
  );

  // ─── Tween de vecinos (scale/opacity en tiempo real vía scroll de Embla) ───
  // Normalizado por distancia al snap ADYACENTE (no por el rango total de slides):
  // así el vecino en reposo llega exactamente a A_SCALE/A_OPACITY sin diluirse
  // cuando hay muchos slides (5 slides ⇒ distancia entre snaps ≈ 1/5, no 1).
  const applyTween = useCallback(() => {
    if (!emblaApi || reduced) return;
    const progress = emblaApi.scrollProgress();
    const snaps = emblaApi.scrollSnapList();
    const engine = emblaApi.internalEngine();
    const snapDistance = snaps.length > 1 ? 1 / snaps.length : 1;
    snaps.forEach((snap, i) => {
      let diff = snap - progress;
      engine.slideLooper.loopPoints.forEach((lp) => {
        const target = lp.target();
        if (i === lp.index && target !== 0) {
          const sign = Math.sign(target);
          if (sign === -1) diff = snap - (1 + progress);
          if (sign === 1) diff = snap + (1 - progress);
        }
      });
      const d = clamp01(Math.abs(diff) / snapDistance);
      const el = slideRefs.current[i];
      if (!el) return;
      el.style.transform = `scale(${1 - d * (1 - A_SCALE)})`;
      el.style.opacity = String(1 - d * (1 - A_OPACITY));
    });
  }, [emblaApi, reduced]);

  useEffect(() => {
    if (!emblaApi) return;
    if (reduced) {
      // reduced-motion: sin tween, todos 1/1.
      slideRefs.current.forEach((el) => {
        if (!el) return;
        el.style.transform = "scale(1)";
        el.style.opacity = "1";
      });
      return;
    }
    applyTween();
    emblaApi.on("scroll", applyTween);
    emblaApi.on("reInit", applyTween);
    emblaApi.on("slideFocus", applyTween);
    return () => {
      emblaApi.off("scroll", applyTween);
      emblaApi.off("reInit", applyTween);
      emblaApi.off("slideFocus", applyTween);
    };
  }, [emblaApi, applyTween, reduced]);

  // ─── Selección + HUD (título enmascarado + descripción crossfade) ───
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const idx = emblaApi.selectedScrollSnap();
    setSelectedIndex(idx);
    setCounterShown(idx);

    if (reduced) {
      if (titleRef.current) gsap.set(titleRef.current, { yPercent: 0 });
      if (descRef.current) gsap.set(descRef.current, { opacity: 1, y: 0 });
      return;
    }
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { yPercent: 100 },
        { yPercent: 0, duration: DUR.element, ease: GSAP_EASE.secondary }
      );
    }
    if (descRef.current) {
      gsap.fromTo(
        descRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: DUR.element, ease: GSAP_EASE.secondary }
      );
    }
  }, [emblaApi, reduced]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    // Sincroniza el índice inicial con embla — sistema externo, no re-render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // ─── Hint "ARRASTRÁ" efímero: aparece al entrar al viewport, muere al 1er drag o a 4s ───
  useEffect(() => {
    const KEY = "showroom-drag-hint-dismissed";
    if (typeof window !== "undefined" && sessionStorage.getItem(KEY) === "1") {
      hintDoneRef.current = true;
      return;
    }
    let timer: ReturnType<typeof setTimeout> | null = null;
    const dismiss = () => {
      if (hintDoneRef.current) return;
      hintDoneRef.current = true;
      setHintVisible(false);
      try { sessionStorage.setItem(KEY, "1"); } catch {}
      if (timer) clearTimeout(timer);
    };
    hintDismissRef.current = dismiss;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !hintDoneRef.current) {
            setHintVisible(true);
            timer = setTimeout(dismiss, 4000); // aparece al entrar; muere a 4s o al 1er drag (lo que ocurra 1o)
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    if (viewportRef.current) io.observe(viewportRef.current);
    return () => { io.disconnect(); if (timer) clearTimeout(timer); };
  }, []);

  // ─── Autoplay 5.5s + barra de progreso, pausa hover/drag/visibilitychange ───
  useEffect(() => {
    if (!emblaApi || reduced) return;

    let rafId = 0;
    let startTs = 0;
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    const setBar = (scaleX: number) => {
      if (barRef.current) barRef.current.style.transform = `scaleX(${scaleX})`;
    };

    const tick = (now: number) => {
      if (paused) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      if (!startTs) startTs = now;
      const elapsed = now - startTs;
      setBar(clamp01(elapsed / autoplayMs));
      if (elapsed >= autoplayMs) {
        emblaApi.scrollNext();
        startTs = now;
        setBar(0);
      }
      rafId = requestAnimationFrame(tick);
    };

    const pause = () => {
      paused = true;
      setIsPlaying(false);
      if (resumeTimer) {
        clearTimeout(resumeTimer);
        resumeTimer = null;
      }
    };
    const scheduleResume = () => {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        paused = false;
        startTs = 0;
        setBar(0);
        setIsPlaying(true);
      }, RESUME_DELAY_MS);
    };
    // Resume inmediato (sin el delay de 4s) — solo para el toggle manual Play.
    const manualResume = () => {
      if (resumeTimer) {
        clearTimeout(resumeTimer);
        resumeTimer = null;
      }
      paused = false;
      startTs = 0;
      setBar(0);
      setIsPlaying(true);
    };

    const onPointerEnter = () => pause();
    const onPointerLeave = () => scheduleResume();
    const onPointerDown = () => {
      hintDismissRef.current?.();
      pause();
    };
    const onPointerUp = () => scheduleResume();
    const onVisibilityChange = () => {
      if (document.hidden) pause();
      else scheduleResume();
    };
    // focusin/focusout: mismo tratamiento que pointerenter/pointerleave (a11y teclado).
    const onFocusIn = () => pause();
    const onFocusOut = () => scheduleResume();

    const viewport = viewportRef.current;
    viewport?.addEventListener("pointerenter", onPointerEnter);
    viewport?.addEventListener("pointerleave", onPointerLeave);
    viewport?.addEventListener("focusin", onFocusIn);
    viewport?.addEventListener("focusout", onFocusOut);
    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);
    document.addEventListener("visibilitychange", onVisibilityChange);

    pauseAutoplayRef.current = pause;
    resumeAutoplayRef.current = manualResume;

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      if (resumeTimer) clearTimeout(resumeTimer);
      viewport?.removeEventListener("pointerenter", onPointerEnter);
      viewport?.removeEventListener("pointerleave", onPointerLeave);
      viewport?.removeEventListener("focusin", onFocusIn);
      viewport?.removeEventListener("focusout", onFocusOut);
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      pauseAutoplayRef.current = null;
      resumeAutoplayRef.current = null;
    };
  }, [emblaApi, reduced, autoplayMs]);

  const handlePrev = useCallback(() => {
    hintDismissRef.current?.();
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const handleNext = useCallback(() => {
    hintDismissRef.current?.();
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const handleToggleAutoplay = useCallback(() => {
    if (isPlaying) pauseAutoplayRef.current?.();
    else resumeAutoplayRef.current?.();
  }, [isPlaying]);

  const handleViewportKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    },
    [handlePrev, handleNext]
  );

  // ─── Parallax interno de foto (scrub, ±8 yPercent, prioridad 5) ───
  useEffect(() => {
    if (reduced) return;
    registerScrollTrigger();
    const triggers: ScrollTrigger[] = [];
    parallaxRefs.current.forEach((el) => {
      if (!el) return;
      const tween = gsap.to(el, {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: viewportRef.current ?? el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });
    return () => {
      triggers.forEach((st) => st.kill());
    };
  }, [reduced, slides.length]);

  if (slides.length === 0) return null;

  const activeSlide = slides[selectedIndex];
  const activeTitle = activeSlide?.title;
  const activeDescription = activeSlide?.description;

  const counterTone: "dark" | "light" | "amg" = tone;
  const iconTone = tone === "amg" ? "text-amg-teal" : tone === "light" ? "text-ink" : "text-white";

  return (
    <div className="relative" ref={viewportRef}>
      <div
        className="relative overflow-hidden w-full outline-none"
        ref={emblaRef}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Carrusel de imágenes"
        tabIndex={0}
        onKeyDown={handleViewportKeyDown}
      >
        <div className="flex">
          {slides.map((s, i) => (
            <div
              key={s.key}
              ref={setSlideRef(i)}
              className="flex-[0_0_88%] md:flex-[0_0_84%] min-w-0 px-2 md:px-3"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                {regime === "backdrop" && s.backdropSrc && (
                  <Image
                    src={s.backdropSrc}
                    alt=""
                    aria-hidden
                    data-chrome
                    fill
                    sizes="64px"
                    quality={20}
                    className="absolute inset-0 h-full w-full object-cover scale-[1.3] blur-[48px] brightness-[0.85]"
                  />
                )}
                <div ref={setParallaxRef(i)} className="absolute inset-0 will-change-transform">
                  {s.media}
                </div>
              </div>
            </div>
          ))}
        </div>
        <DragHint visible={hintVisible} reduced={reduced} />
      </div>

      {/* Meta-bar asimetrica — izq: contador+barra+titulo (chrome+dato) / der: descripcion (DATO) */}
      <div className="mt-6 grid grid-cols-1 gap-4 px-2 md:grid-cols-12 md:gap-8">
        {/* Izq (4 cols): contador mono + barra + titulo del slide */}
        <div className="min-w-0 md:col-span-4">
          <div className="flex items-center gap-3">
            <SlideCounter index={counterShown} total={slides.length} tone={counterTone} />
            {!reduced && (
              <div aria-hidden data-chrome className="h-[2px] w-16 shrink-0 overflow-hidden bg-white/15">
                <div ref={barRef} className="h-full w-full origin-left bg-silver-300" style={{ transform: "scaleX(0)" }} />
              </div>
            )}
            <div data-chrome className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Slide anterior"
                className={`flex h-11 w-11 items-center justify-center ${iconTone} opacity-80 transition-opacity duration-[var(--dur-micro)] ease-[var(--ease-micro)] hover:opacity-100 motion-reduce:transition-none`}
              >
                <ArrowLeft size={16} aria-hidden />
              </button>
              {!reduced && (
                <button
                  type="button"
                  onClick={handleToggleAutoplay}
                  aria-label={isPlaying ? "Pausar autoplay" : "Reanudar autoplay"}
                  aria-pressed={!isPlaying}
                  className={`flex h-11 w-11 items-center justify-center ${iconTone} opacity-80 transition-opacity duration-[var(--dur-micro)] ease-[var(--ease-micro)] hover:opacity-100 motion-reduce:transition-none`}
                >
                  {isPlaying ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                aria-label="Slide siguiente"
                className={`flex h-11 w-11 items-center justify-center ${iconTone} opacity-80 transition-opacity duration-[var(--dur-micro)] ease-[var(--ease-micro)] hover:opacity-100 motion-reduce:transition-none`}
              >
                <ArrowRight size={16} aria-hidden />
              </button>
            </div>
          </div>
          {activeTitle && (
            <div className="mt-2 overflow-hidden">
              <h3
                ref={titleRef}
                data-slide-title
                className={`text-balance text-xl font-medium md:text-2xl ${isAMG ? "text-amg-teal" : ""}`}
              >
                {activeTitle}
              </h3>
            </div>
          )}
        </div>
        {/* Der (8 cols): descripcion — DATO (NO data-chrome), izq, <=60ch, altura min reservada */}
        {activeDescription && (
          <div
            ref={descRef}
            data-slide-description
            className="min-w-0 md:col-span-8 md:min-h-[7rem] will-change-[opacity,transform]"
          >
            {activeDescription}
          </div>
        )}
      </div>
    </div>
  );
}
