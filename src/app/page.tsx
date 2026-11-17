"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import GamaAnillo from "@/components/home/GamaAnillo";
import ComoComprarlo from "@/components/home/ComoComprarlo";
import Leonardo from "@/components/home/Leonardo";
import { DUR, GSAP_EASE, HERO_DELAY } from "@/lib/motion-tokens";


const HERO_VIDEO = "/home/hero-clase-e.mp4";
const HERO_INICIO = "/home/hero-clase-e-inicio.jpg";
const HERO_FINAL = "/home/hero-clase-e-final.jpg";
// Versión vertical (celular y tablet parados): mismo armado y mismos tiempos,
// así HERO_LOOP_DESDE sirve para las dos. El navegador elige con <source media>.
const HERO_VIDEO_VERTICAL = "/home/hero-clase-e-vertical.mp4";
const HERO_FINAL_VERTICAL = "/home/hero-clase-e-vertical-final.jpg";
const HERO_VERTICAL_MEDIA = "(orientation: portrait)";
/** Segundo donde empieza el loop suave (después del encendido). Video de
 *  Flow (Omni 1.2 Flash, 1080p): 0,6 s de negro → las ópticas se prenden → las
 *  luces del techo revelan el auto (hasta 8,54 s) → la cámara se desliza ida y
 *  vuelta, lenta, y termina en el mismo cuadro. Al terminar se vuelve acá, así
 *  el encendido pasa una sola vez. */
const HERO_LOOP_DESDE = 8.5417;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function Home() {
  const reducedMotion = usePrefersReducedMotion();


  // Hero: poster-first, video fade-ea al canplay; en reduced-motion, sin
  // autoplay — poster + botón Play manual.
  const [videoReady, setVideoReady] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Si el video ya estaba listo antes de que React enganchara onCanPlay
  // (pasa en escritorio con preload="auto"), el evento no vuelve a llegar y
  // el video quedaba invisible detrás del poster oscuro.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const v = videoRef.current;
      if (v && v.readyState >= 3) setVideoReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Refs de hero (GSAP timeline cinematográfica — SplitText en el H1)
  const heroRef = useRef<HTMLElement>(null);
  const heroEyebrowRef = useRef<HTMLParagraphElement>(null);
  const heroH1Ref = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLDivElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);

  // ---- Acto 1 — Hero cinematográfico: SplitText chars + stagger ----
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

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const copyEls = [
      heroEyebrowRef.current,
      heroSubRef.current,
      heroCtaRef.current,
    ].filter((el): el is NonNullable<typeof el> => Boolean(el));

    if (reduced) {
      gsap.set(copyEls, { opacity: 1, y: 0 });
      if (heroH1Ref.current) gsap.set(heroH1Ref.current, { opacity: 1 });
      return;
    }

    gsap.set(copyEls, { opacity: 0, y: 16 });
    if (heroH1Ref.current) gsap.set(heroH1Ref.current, { autoAlpha: 0 });

    const tl = gsap.timeline({ delay: HERO_DELAY });
    tl.to(heroEyebrowRef.current, {
      opacity: 1,
      y: 0,
      duration: DUR.element,
      ease: GSAP_EASE.secondary,
    })
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
        heroCtaRef.current,
        {
          opacity: 1,
          y: 0,
          duration: DUR.element,
          ease: GSAP_EASE.secondary,
        },
        "-=0.3",
      );

    // El H1 nunca debe quedar atrapado invisible si SplitText tarda o falla
    // (anti-pattern: contenido stuck en opacity 0).
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
          // La máscara recorta en la caja de línea; con leading < 1 se
          // comía la cola de la «g». Se agranda hacia abajo sin mover el texto.
          gsap.set(self.masks, { paddingBottom: "0.2em", marginBottom: "-0.2em" });
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
      window.clearTimeout(safety);
      tl.kill();
      split?.revert();
    };
  }, []);

  // Hero: transición manual de opacidad (200ms) bajo reduced-motion, para el
  // botón Play del fallback sin autoplay.
  const fadeTransition = reducedMotion
    ? { duration: 0.2, ease: "linear" as const }
    : { duration: DUR.element, ease: "easeOut" as const };

  // El poster es solo LCP placeholder — una vez el video corre, desaparece
  // por completo (antes quedaba una imagen fantasma detrás, a opacity 0.9
  // fijo, generando un "doble expuesto" con el frame del poster).
  const heroVideoActive = reducedMotion ? videoPlaying : videoReady;

  return (
    <div className="bg-black text-white">
      {/* ───────────── Acto 1 — Curtain (hero) ───────────── */}
      <section
        ref={heroRef}
        className="relative h-[100svh] w-full overflow-hidden bg-black"
      >
        {/* Video del hero (Mateo 2026-11-11): Clase E generada en Flow.
            Arranca en negro, se encienden las ópticas y las luces (una sola
            vez) y después repite solo el tramo suave desde HERO_LOOP_DESDE
            (Mateo: el corte en seco «parece que se tilda»). Poster = primer
            cuadro (negro), así no hay un auto iluminado que después se apaga. Con movimiento
            reducido se ve el último cuadro y el botón Play. Sin marca de agua:
            ya no hace falta el zoom del 6 % del video anterior. */}
        <div
          aria-hidden
          className={`absolute inset-0 z-0 transition-opacity duration-700 ease-out ${
            heroVideoActive ? "opacity-0" : "opacity-100"
          }`}
        >
          {reducedMotion ? (
            <>
              <Image
                src={HERO_FINAL}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover object-center portrait:hidden"
              />
              <Image
                src={HERO_FINAL_VERTICAL}
                alt=""
                fill
                priority
                sizes="100vw"
                className="hidden object-cover object-[30%_50%] portrait:block"
              />
            </>
          ) : (
            <Image
              src={HERO_INICIO}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          )}
        </div>

        {/* Video sobre el poster */}
        {!reducedMotion ? (
          <motion.video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            poster={HERO_INICIO}
            onCanPlay={() => setVideoReady(true)}
            onPlaying={() => setVideoReady(true)}
            onEnded={(e) => {
              const v = e.currentTarget;
              v.currentTime = HERO_LOOP_DESDE;
              void v.play();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: videoReady ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "linear" }}
            className="absolute inset-0 z-0 h-full w-full object-cover object-center portrait:object-[30%_50%]"
          >
            <source
              src={HERO_VIDEO_VERTICAL}
              media={HERO_VERTICAL_MEDIA}
              type="video/mp4"
            />
            <source src={HERO_VIDEO} type="video/mp4" />
          </motion.video>
        ) : (
          <>
            <video
              ref={videoRef}
              muted
              playsInline
              preload="metadata"
              onPlay={() => setVideoPlaying(true)}
              onError={() => setVideoError(true)}
              className={`absolute inset-0 z-0 h-full w-full object-cover object-center portrait:object-[30%_50%] ${
                videoPlaying ? "" : "opacity-0"
              }`}
            >
              <source
                src={HERO_VIDEO_VERTICAL}
                media={HERO_VERTICAL_MEDIA}
                type="video/mp4"
              />
              <source src={HERO_VIDEO} type="video/mp4" />
            </video>
            {!videoPlaying && !videoError && (
              <motion.button
                type="button"
                onClick={() => videoRef.current?.play()}
                aria-label="Reproducir video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={fadeTransition}
                className="absolute left-1/2 top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-white/40 bg-black/40 text-white backdrop-blur-sm transition-[border-color] duration-[var(--dur-micro)] ease-[var(--ease-micro)] hover:border-white/70 active:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-mb-blue focus-visible:outline-offset-2"
              >
                <Play size={18} className="ml-0.5" fill="currentColor" />
              </motion.button>
            )}
          </>
        )}

        {/* Scrims de legibilidad. Celular: franja oscura arriba (título) y
            abajo (ubicación + botón); el centro queda libre para el auto.
            Compu: franja oscura abajo (título + columna derecha) y un velo
            leve a la izquierda. Pensado para cualquier video del hero: el
            texto vive en las franjas, no encima del auto. */}
        <div className="absolute inset-0 z-10 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.55)_22%,transparent_42%),linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.5)_20%,transparent_40%)] lg:bg-[linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.55)_24%,transparent_50%),linear-gradient(90deg,rgba(0,0,0,0.5)_0%,transparent_45%),linear-gradient(to_bottom,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.45)_12%,transparent_26%)]" />

        {/* Copy (Mateo 2026-11-11: «Centrado»). Celular: el nombre centrado
            arriba en una línea; abajo la ubicación y el link (sin la línea
            vertical: Mateo la sacó). Compu: el nombre en una línea abajo a la izquierda;
            ubicación + link abajo a la derecha. El nombre va siempre junto. */}
        <div className="relative z-20 flex h-full flex-col px-6 pb-[max(2rem,5svh)] pt-[calc(var(--nav-h)+4svh)] items-center justify-between text-center lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:px-12 lg:pb-[max(3rem,8svh)] lg:pt-0 lg:text-left">
          <div className="flex flex-col items-center lg:block">
            <p
              ref={heroEyebrowRef}
              className="text-eyebrow mb-4 flex items-center gap-3 whitespace-nowrap font-mono uppercase tracking-[0.1em] text-silver-300 sm:tracking-[0.14em] lg:mb-5 justify-center lg:justify-start"
            >
              <span aria-hidden className="hidden h-px w-8 bg-silver-300/70 lg:block" />
              Concesionario Oficial Mercedes-Benz
            </p>

            <h1
              ref={heroH1Ref}
              className="whitespace-nowrap font-display font-medium leading-[0.95] text-white [letter-spacing:-0.015em] text-[clamp(2rem,11.3vw,4rem)] lg:text-[clamp(4.5rem,7.2vw,9.5rem)] lg:leading-[0.92]"
            >
              Automotores Mega SA
            </h1>
          </div>

          <div className="flex flex-col gap-4 items-center lg:shrink-0 lg:items-end lg:pb-[0.6vw] lg:text-right">
            <p
              ref={heroSubRef}
              className="text-sm font-light tracking-[0.04em] text-silver-100 md:text-base"
            >
              Argentina, Entre Ríos
            </p>

            <div ref={heroCtaRef}>
              <Link
                href="/#gama"
                className="group inline-flex items-center gap-4 py-2 text-white transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] hover:text-silver-300 lg:py-0"
              >
                <span className="border-b border-white pb-1 text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-[var(--dur-micro)] group-hover:border-silver-300">
                  Conocé nuestros vehículos
                </span>
                <ArrowRight
                  size={18}
                  className="transition-transform duration-[var(--dur-micro)] ease-[var(--ease-micro)] group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>

        <span
          data-hero-sentinel
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-px w-full"
        />
      </section>

      {/* ───────────── Acto 2 — La gama (D-065: anillo 3D atado al scroll) ───────────── */}
      <GamaAnillo />
      <ComoComprarlo />

      {/* ───────────── Acto 4 — Leonardo (D-070: el recorrido de tu Mercedes) ───────────── */}
      <Leonardo />
    </div>
  );
}
