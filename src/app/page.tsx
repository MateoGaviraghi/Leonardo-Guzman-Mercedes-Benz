"use client";

import Link from "next/link";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import ThreeDVehicleCarousel from "@/components/ThreeDVehicleCarousel";
import VehicleCardSkeleton from "@/components/VehicleCardSkeleton";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { DUR, EASE, GSAP_EASE, EXIT, HERO_DELAY } from "@/lib/motion-tokens";
import { waLink, WA_GENERIC_MESSAGE } from "@/lib/site";
import { isPublicVehicle } from "@/lib/vehicles/hidden";
import type { Vehicle } from "@/data/vehicles";

import { pegar } from "@/lib/texto";
/** Categorías del tab nav (home §Acto 2). IDs = claves del filtro cliente
 *  existente (NO tocar); labels = copy final de la spec. */
const CATEGORY_TABS = [
  { id: "AUTOS", label: "Autos" },
  { id: "SUV", label: "SUVs" },
  { id: "VANS", label: "Vans" },
  { id: "SPRINTER", label: "Sprinter" },
  { id: "TRUCKS", label: "Trucks" },
] as const;

// Tilt 3D de la foto de Leonardo (Acto 4) — mismo mecanismo que
// VehicleCard: spring de damping alto, sin overshoot. Rango un poco más
// contenido que el de las cards (es un retrato, no un producto).
const PHOTO_TILT_DEG = 6;
const PHOTO_TILT_SPRING = { stiffness: 260, damping: 30, mass: 0.6 };

/**
 * CTA rectangular con fill-sweep al hover (home §reglas 1/7). Ghost = borde
 * que se llena de blanco, texto pasa a negro. Whatsapp = fondo verde fijo,
 * el sweep es un brillo sutil. Geometría recta siempre — cero border-radius.
 */
function CtaSweep({
  href,
  children,
  variant = "ghost",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "ghost" | "whatsapp";
  external?: boolean;
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
      >
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
  const [selectedCategory, setSelectedCategory] = useState<string>("AUTOS");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const reducedMotion = usePrefersReducedMotion();

  // Hero: poster-first, video fade-ea al canplay; en reduced-motion, sin
  // autoplay — poster + botón Play manual.
  const [videoReady, setVideoReady] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Refs de hero (GSAP timeline cinematográfica — SplitText en el H1)
  const heroRef = useRef<HTMLElement>(null);
  const heroEyebrowRef = useRef<HTMLParagraphElement>(null);
  const heroH1Ref = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLDivElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);

  // Refs de reveal (GSAP ScrollTrigger) — Acto 2
  const headerRef = useRef<HTMLDivElement>(null);

  // Refs — Acto 3 (banda inmersiva)
  const bandSectionRef = useRef<HTMLElement>(null);
  const bandImageRef = useRef<HTMLDivElement>(null);
  const bandEyebrowRef = useRef<HTMLParagraphElement>(null);
  const bandTitleRef = useRef<HTMLHeadingElement>(null);
  const bandCtaRef = useRef<HTMLDivElement>(null);

  // Refs — Acto 4 (cierre papel)
  const paperPhotoRef = useRef<HTMLDivElement>(null);
  const paperTextRef = useRef<HTMLDivElement>(null);

  // Tilt 3D de la foto de Leonardo — mismo patrón que VehicleCard
  // (rotateX/rotateY con spring). Desactivado en
  // touch / prefers-reduced-motion.
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

  // will-change-transform transiente: solo mientras hay interacción
  // (patrón AutonomySection.tsx) — evita promover una capa de compositor
  // permanente para un retrato que no se mueve fuera de hover/focus.
  const [isPhotoActive, setIsPhotoActive] = useState(false);

  const handlePhotoPointerLeave = useCallback(() => {
    photoRotateXRaw.set(0);
    photoRotateYRaw.set(0);
    setIsPhotoActive(false);
  }, [photoRotateXRaw, photoRotateYRaw]);

  // Fetch vehicles from API — NO TOCAR el fetching (mandato de spec).
  // Único agregado: capturar el error en estado local (estado error-de-fetch,
  // hoy inexistente).
  const fetchVehicles = useCallback(async () => {
    try {
      const response = await fetch("/api/vehicles");
      const data = await response.json();
      if (data.success) {
        // El fetch no cambia; solo se descartan los ocultos (lib/vehicles/hidden).
        setVehicles(
          ((data.vehicles || []) as Vehicle[]).filter((v) => isPublicVehicle(v.id))
        );
        setFetchError(false);
      } else {
        setFetchError(true);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setFetchError(true);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, []);

  useEffect(() => {
    // Falso positivo: fetchVehicles solo llama a setState después del await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVehicles();
  }, [fetchVehicles]);

  const handleRetry = () => {
    setRetrying(true);
    setLoading(true);
    fetchVehicles();
  };

  // Filtrar vehículos según categoría — NO TOCAR (mandato de spec).
  const getVehiclesByCategory = () => {
    const autoCategories = [
      "sedanes",
      "hatchback",
      "coupes",
      "cabrios-roadsters",
    ];

    let filtered: Vehicle[] = [];

    switch (selectedCategory) {
      case "AUTOS":
        filtered = vehicles.filter((v) =>
          autoCategories.includes(v.category.toLowerCase()),
        );
        break;
      case "SUV":
        filtered = vehicles.filter(
          (v) =>
            v.category.toLowerCase() === "suv" ||
            v.category.toLowerCase() === "suvs" ||
            v.category.toLowerCase() === "suv-todoterreno",
        );
        break;
      case "VANS":
        filtered = vehicles.filter((v) => v.category.toLowerCase() === "vans");
        break;
      case "SPRINTER":
        filtered = vehicles.filter(
          (v) => v.category.toLowerCase() === "sprinter",
        );
        break;
      case "TRUCKS":
        filtered = vehicles.filter(
          (v) =>
            v.category.toLowerCase().includes("truck") ||
            v.category.toLowerCase() === "accelo" ||
            v.category.toLowerCase() === "atego" ||
            v.category.toLowerCase() === "actros" ||
            v.category.toLowerCase() === "arocs" ||
            v.category.toLowerCase() === "axor",
        );
        break;
      default:
        filtered = [];
    }

    // Sin límite: el carrusel 3D cilíndrico (Acto 2) muestra todos los
    // vehículos reales de la categoría — a diferencia del grid anterior,
    // más caras = cilindro más rico, no un problema de layout.
    return filtered;
  };

  const currentVehicles = getVehiclesByCategory();
  const activeLabel =
    CATEGORY_TABS.find((c) => c.id === selectedCategory)?.label ?? "";

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

  // ---- Reveals estáticos: header A2 ----
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

    const triggers: ScrollTrigger[] = [];

    const reveal = (el: Element | null, start: string) => {
      if (!el || reduced) return; // reduced: visible de una, sin animación
      gsap.set(el, { opacity: 0, y: 16 });
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start,
          once: true,
          onEnter: () =>
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: DUR.element,
              ease: GSAP_EASE.secondary,
            }),
        }),
      );
    };

    reveal(headerRef.current, "top 80%");

    // Foto: reveal por clip-path (asimétrico respecto al texto — evita el
    // fade-up uniforme). Texto: fade+y con delay corto.
    if (paperPhotoRef.current) {
      if (reduced) {
        gsap.set(paperPhotoRef.current, { clipPath: "inset(0% 0% 0% 0%)" });
      } else {
        gsap.set(paperPhotoRef.current, {
          clipPath: "inset(0% 0% 100% 0%)",
        });
        triggers.push(
          ScrollTrigger.create({
            trigger: paperPhotoRef.current,
            start: "top 78%",
            once: true,
            onEnter: () =>
              gsap.to(paperPhotoRef.current, {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: DUR.hero,
                ease: GSAP_EASE.primary,
              }),
          }),
        );
      }
    }

    if (paperTextRef.current) {
      if (reduced) {
        gsap.set(paperTextRef.current, { opacity: 1, y: 0 });
      } else {
        gsap.set(paperTextRef.current, { opacity: 0, y: 16 });
        triggers.push(
          ScrollTrigger.create({
            trigger: paperTextRef.current,
            start: "top 78%",
            once: true,
            onEnter: () =>
              gsap.to(paperTextRef.current, {
                opacity: 1,
                y: 0,
                duration: DUR.element,
                ease: GSAP_EASE.secondary,
                delay: 0.12,
              }),
          }),
        );
      }
    }

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);

  // ---- Acto 3 — banda inmersiva: parallax scrub + SplitText heading ----
  useEffect(() => {
    if (typeof window === "undefined" || !bandSectionRef.current) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const els = [bandEyebrowRef.current, bandCtaRef.current].filter(
      (el): el is NonNullable<typeof el> => Boolean(el),
    );

    if (reduced) {
      gsap.set(els, { opacity: 1, y: 0 });
      if (bandTitleRef.current) gsap.set(bandTitleRef.current, { opacity: 1 });
      return;
    }

    gsap.set(els, { opacity: 0, y: 16 });
    if (bandTitleRef.current)
      gsap.set(bandTitleRef.current, { autoAlpha: 0 });

    // Sin parallax en esta imagen: el cliente exige verla COMPLETA y
    // cualquier movimiento requiere zoom (scale>1) que la recorta. La banda
    // es quietud pura — el motion vive en el texto y el CTA.

    let split: SplitText | undefined;
    const reveal = ScrollTrigger.create({
      trigger: bandSectionRef.current,
      start: "top 70%",
      once: true,
      onEnter: () => {
        gsap.to(bandEyebrowRef.current, {
          opacity: 1,
          y: 0,
          duration: DUR.element,
          ease: GSAP_EASE.secondary,
        });
        if (bandTitleRef.current) {
          document.fonts.ready.then(() => {
            if (!bandTitleRef.current) return;
            split = SplitText.create(bandTitleRef.current, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit(self) {
                return gsap
                  .timeline()
                  .set(bandTitleRef.current, { autoAlpha: 1 })
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
        gsap.to(bandCtaRef.current, {
          opacity: 1,
          y: 0,
          duration: DUR.element,
          ease: GSAP_EASE.secondary,
          delay: 0.2,
        });
      },
    });

    return () => {
      reveal.kill();
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
        {/* Poster — LCP del hero. Se desvanece del todo apenas el video
            arranca (fix: antes quedaba clavado a 0.9 de opacidad y se veía
            como una imagen fantasma superpuesta al video en movimiento). */}
        <div
          aria-hidden
          className={`absolute inset-0 z-0 transition-opacity duration-700 ease-out ${
            heroVideoActive ? "opacity-0" : "opacity-100"
          }`}
        >
          <Image
            src="/home/hero-poster.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Video sobre el poster */}
        {!reducedMotion ? (
          <motion.video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/home/hero-poster.jpg"
            onCanPlay={() => setVideoReady(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: videoReady ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "linear" }}
            className="absolute inset-0 z-0 h-full w-full object-cover object-center"
          >
            <source
              src="/Mercedes_Benz_Reveal_Video_Generated.mp4"
              type="video/mp4"
            />
          </motion.video>
        ) : (
          <>
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="metadata"
              poster="/home/hero-poster.jpg"
              onPlay={() => setVideoPlaying(true)}
              onError={() => setVideoError(true)}
              className="absolute inset-0 z-0 h-full w-full object-cover object-center"
            >
              <source
                src="/Mercedes_Benz_Reveal_Video_Generated.mp4"
                type="video/mp4"
              />
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

        {/* Scrim de legibilidad — lateral izquierdo (desktop, bottom-left)
            + vertical inferior (mobile, centrado-abajo) + vignette superior.
            No es decorativo: existe para que "Automotores Mega SA" no se
            pierda contra el video en movimiento. */}
        <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.32)_38%,transparent_65%),radial-gradient(ellipse_75%_70%_at_18%_88%,rgba(0,0,0,0.92),transparent_62%),linear-gradient(to_top,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.2)_38%,transparent_65%),radial-gradient(ellipse_at_top,transparent_50%,rgba(0,0,0,0.4))]" />

        {/* Copy — bottom-left en desktop, centrado-abajo en mobile */}
        <div className="relative z-20 flex h-full flex-col items-center justify-end px-6 pb-16 text-center md:items-start md:px-12 md:pb-24 md:text-left">
          <div className="mx-auto max-w-3xl md:mx-0">
            <p
              ref={heroEyebrowRef}
              className="text-eyebrow mb-4 font-mono uppercase tracking-[0.14em] text-silver-300"
            >
              Leonardo Guzman
            </p>

            <h1
              ref={heroH1Ref}
              className="text-display-1 mb-4 text-balance font-display font-medium text-white [letter-spacing:-0.01em]"
            >
              Automotores Mega SA
            </h1>

            <div ref={heroSubRef}>
              <p className="text-lead mb-2 font-light text-silver-100">
                Concesionario Oficial Mercedes-Benz
              </p>
              <p className="mb-10 text-base font-light text-silver-300 md:text-lg">
                Argentina, Entre Ríos
              </p>
            </div>

            <div ref={heroCtaRef}>
              <Link
                href="/experiencia"
                className="group inline-flex items-center gap-4 text-white transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] hover:text-silver-300"
              >
                <span className="border-b border-white pb-1 text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] group-hover:border-silver-300">
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

      {/* ───────────── Acto 2 — Build (carrusel 3D editorial) ───────────── */}
      <section className="bg-black py-[var(--spacing-section)]">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          {/* Header centrado: eyebrow, título, CTA — mismo patrón de
              fill-sweep que el resto de los CTAs rectos del sitio */}
          <div
            ref={headerRef}
            className="mb-12 flex flex-col items-center gap-6 border-b border-white/10 pb-10 text-center"
          >
            <div>
              <p className="text-eyebrow mb-3 font-mono uppercase tracking-[0.14em] text-silver-300">
                La gama
              </p>
              <h2 className="text-h1 font-display font-medium text-white">
                Ingeniería de precisión.
              </h2>
            </div>
            <CtaSweep href="/vehicles" variant="ghost">
              Ver todos los modelos
              <ArrowRight
                size={14}
                className="transition-transform duration-[var(--dur-micro)] ease-[var(--ease-micro)] group-hover/cta:translate-x-1"
              />
            </CtaSweep>
          </div>

          {/* Tabs de categoría — control segmentado de una sola pieza: un
              solo borde exterior, divisores internos 1px, el fondo activo
              se desliza entre segmentos (layoutId) en vez de saltar. */}
          <nav
            aria-label="Categorías de vehículos"
            className="mb-12 flex justify-center"
          >
            <div className="flex max-w-full divide-x divide-white/20 overflow-x-auto border border-white/20">
              {CATEGORY_TABS.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    aria-pressed={active}
                    className={`relative shrink-0 whitespace-nowrap px-5 py-3 min-h-[44px] text-eyebrow font-mono uppercase tracking-[0.14em] transition-[color,letter-spacing] duration-[var(--dur-micro)] ease-[var(--ease-micro)] ${
                      active
                        ? "text-mb-black"
                        : "text-silver-300 hover:tracking-[0.18em] hover:text-white"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="category-tab-active-bg"
                        className="absolute inset-0 z-0 bg-white"
                        transition={{ duration: 0.25, ease: EASE.secondary }}
                      />
                    )}
                    <span className="relative z-10">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Carrusel 3D cilíndrico: loading / datos / empty / error-de-fetch
              (los tres últimos estados se conservan como estaban) */}
          <div className="min-h-[420px]">
            {loading ? (
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <VehicleCardSkeleton key={i} />
                ))}
              </div>
            ) : fetchError ? (
              <div className="flex flex-col items-center gap-5 py-16 text-center">
                <p className="text-base text-silver-300">
                  No pudimos cargar los vehículos.
                </p>
                <div className="flex flex-col items-center gap-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={retrying}
                    className="group/retry relative inline-flex min-w-[140px] items-center justify-center overflow-hidden border border-white/25 px-6 py-2.5 text-xs font-medium uppercase tracking-[0.08em] text-white transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] hover:border-white/70 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-mb-blue focus-visible:outline-offset-2"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-[var(--dur-element)] ease-[var(--ease-scrub)] group-hover/retry:scale-x-100"
                    />
                    <span className="relative z-10 transition-colors duration-[var(--dur-micro)] group-hover/retry:text-mb-black">
                      {retrying ? "Cargando…" : "Reintentar"}
                    </span>
                  </button>
                  <a
                    href={waLink(WA_GENERIC_MESSAGE)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-silver-300 underline underline-offset-4 transition-colors duration-[var(--dur-micro)] hover:text-white"
                  >
                    Consultar por WhatsApp
                  </a>
                </div>
              </div>
            ) : currentVehicles.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCategory}
                  exit={{
                    opacity: 0,
                    y: -10,
                    transition: { duration: EXIT.element, ease: "easeIn" },
                  }}
                >
                  <ThreeDVehicleCarousel
                    vehicles={currentVehicles}
                    reducedMotion={reducedMotion}
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <h3 className="text-h3 font-display font-medium text-white">
                  Muy pronto.
                </h3>
                <p className="max-w-md text-sm text-silver-500">
                  ¿Buscás un modelo de esta categoría? Escribime y te aviso
                  apenas ingrese.
                </p>
                <a
                  href={waLink(
                    `Hola Leonardo. Quiero consultar por la categoría ${activeLabel}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white underline underline-offset-4 transition-colors duration-[var(--dur-micro)] hover:text-silver-300"
                >
                  Consultar por WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ───────────── Acto 3 — Clímax por quietud (banda inmersiva) ───────────── */}
      <section
        ref={bandSectionRef}
        className="relative w-full overflow-hidden bg-black"
      >
        {/* Franja superior de NEGRO PURO reservada para el texto: el título
            nunca puede caer sobre un vehículo, sin importar el aspect ratio
            del viewport — la imagen vive abajo, en su propio bloque. */}
        <div className="relative z-20 flex flex-col items-center px-6 pb-10 pt-14 text-center md:px-12 md:pb-12 md:pt-20">
          <div className="w-full max-w-6xl">
            <p
              ref={bandEyebrowRef}
              className="text-eyebrow mb-4 font-mono uppercase tracking-[0.14em] text-silver-300"
            >
              Experiencia
            </p>
            <h2
              ref={bandTitleRef}
              className="text-display-2 mb-8 text-balance font-display font-medium text-white"
            >
              Hay cosas que una ficha técnica no puede contar.
            </h2>
            <div ref={bandCtaRef}>
              <CtaSweep href="/experiencia" variant="ghost">
                Viví la gama
              </CtaSweep>
            </div>
          </div>
        </div>
        {/* Imagen en bloque propio, anclada abajo. Crop sesgado bajo el
            centro: prioriza vehículos + piso, recorta la franja negra
            superior de la foto (ya la aporta el bloque de texto). */}
        {/* Video de la gama completa (1.6 MB) — cine real en vez de una foto
            estática de baja resolución: full-bleed con object-cover (en video
            en movimiento el crop es natural, no "corta" nada perceptible).
            Reduced-motion: cae a la foto estática completa (contain). */}
        <div ref={bandImageRef} className="relative h-[44vh] min-h-[19rem] w-full md:h-[60vh] md:min-h-[26rem]">
          {reducedMotion ? (
            <Image
              src="/foto-home-expericia.png"
              alt="Gama Mercedes-Benz: autos, SUVs, vans, Sprinter y camiones"
              fill
              sizes="100vw"
              className="object-contain"
            />
          ) : (
            <video
              src="/heros Vehiculos/MercedesBenz-todos.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
      </section>

      {/* ───────────── Acto 4 — Resolución (cierre papel) ───────────── */}
      <section
        data-nav-theme="papel"
        className="section-paper py-[var(--spacing-section)]"
      >
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
            <div className="relative lg:col-span-5">
              {/* Card 3D: mismo tilt interactivo que VehicleCard (rotateX/Y
                  con spring). El clip-path de
                  entrada (GSAP scroll reveal) sigue viviendo en este mismo
                  ref — sin marco offset decorativo detrás. */}
              <div
                ref={paperPhotoRef}
                onPointerEnter={() => setIsPhotoActive(true)}
                onPointerMove={handlePhotoPointerMove}
                onPointerLeave={handlePhotoPointerLeave}
                style={{ perspective: 1200 }}
                className="group relative aspect-[3/4] overflow-hidden border border-ink/10 shadow-[var(--shadow-e2)]"
              >
                <motion.div
                  style={{
                    rotateX: photoRotateX,
                    rotateY: photoRotateY,
                    transformStyle: "preserve-3d",
                  }}
                  className={`absolute inset-0 ${isPhotoActive ? "will-change-transform" : ""}`}
                >
                  <Image
                    src="/foto-home.jpg"
                    alt="Leonardo Guzman"
                    fill
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-cover object-top"
                  />
                </motion.div>
              </div>
            </div>

            <div ref={paperTextRef} className="lg:col-span-7">
              <p className="text-eyebrow mb-4 font-mono uppercase tracking-[0.14em] text-ink-60">
                Leonardo Guzman · Paraná, Entre Ríos
              </p>
              <h2 className="text-h1 mb-8 font-display font-medium text-ink">
                {pegar("La compra más importante empieza con una conversación.")}
              </h2>
              <div className="max-w-[65ch] space-y-5">
                <p className="text-base leading-relaxed text-ink">
                  {pegar("Soy Leonardo Guzman, promotor de ventas en Automotores Mega, concesionario oficial Mercedes-Benz en Paraná. Llevo 25 años en el rubro automotriz, y si algo aprendí es que un vehículo así no se elige apurado: se conversa, se compara, se prueba.")}
                </p>
                <p className="text-base leading-relaxed text-ink-60">
                  {pegar("Mi trabajo es que llegues a la decisión con toda la información — modelo, financiación, plan de ahorro — y que el proceso sea tan serio como el auto.")}
                </p>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <CtaSweep
                  href={waLink(WA_GENERIC_MESSAGE)}
                  variant="whatsapp"
                  external
                >
                  <WhatsAppIcon className="h-[18px] w-[18px]" />
                  Escribime por WhatsApp
                </CtaSweep>
                <Link
                  href="/about"
                  className="group/history relative text-sm font-medium text-ink"
                >
                  Conocé mi historia
                  <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-ink transition-[height] duration-[var(--dur-micro)] ease-[var(--ease-micro)] group-hover/history:h-[2px] group-focus-visible/history:h-[2px]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
