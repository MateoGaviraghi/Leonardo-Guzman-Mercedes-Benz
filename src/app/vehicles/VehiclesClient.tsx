"use client";

import VehicleCard from "@/components/VehicleCard";
import VehicleCardSkeleton from "@/components/VehicleCardSkeleton";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useState, useEffect, useRef, type MouseEvent } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { pegar } from "@/lib/texto";
import type { Vehicle } from "@/data/vehicles";
import { gsap } from "gsap";
import { EASE, DUR, GSAP_EASE, HERO_DELAY } from "@/lib/motion-tokens";

function VehiclesContent({ vehicles }: { vehicles: Vehicle[] }) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "all";
  const brand = searchParams.get("brand") || "mercedes-benz";
  const subcategory = searchParams.get("subcategory") || "all";
  const fuelType = searchParams.get("fuelType") || "all";
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  // Panel de filtros mobile (dropdown propio in-flow, sin librería).
  const [filtersOpen, setFiltersOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const revealedRef = useRef<Set<Element>>(new Set());
  const firstBatchRef = useRef(true);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const REVEAL_STAGGER = 0.06; // const nombrada (mata el 0.06 magico de fix 4)

  // Categorías ya visitadas: cada una monta su <video> una vez y queda montado.
  // key estable (id de categoría) → jamás re-monta ni re-descarga al revisitar.
  const [visitedCats, setVisitedCats] = useState<string[]>([category]);
  useEffect(() => {
    // Diferido un frame: el commit del <video> nuevo (preload=metadata, play)
    // no debe caer en la misma tarea que el click de cambio de categoría.
    const raf = requestAnimationFrame(() => {
      setVisitedCats((prev) => (prev.includes(category) ? prev : [...prev, category]));
    });
    return () => cancelAnimationFrame(raf);
  }, [category]);

  // Pausa los <video> de categorías no activas (siguen montados para el
  // crossfade, pero no hace falta que decodifiquen frames a opacity-0).
  // pause()/play() no tocan currentTime: al revisitar una categoría el
  // video resume desde donde quedó, sin salto de frame.
  useEffect(() => {
    videoRefs.current.forEach((el, cat) => {
      if (cat === category) {
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    });
  }, [category, visitedCats]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // Modo AMG: señaliza al navbar vía atributo en <html>. El navbar lo observa
  // con MutationObserver y electrifica sus acentos (teal #5AC3B6).
  const isAmgActive =
    brand === "amg" && (category === "auto" || category === "suv");
  // Mirror del estado AMG en <html>, dependiente de [isAmgActive]: re-afirma el
  // atributo cuando cambia el valor y en el doble-invoke de StrictMode. El
  // cleanup-on-unmount (abajo, deps []) quita el atributo al salir de /vehicles.
  useEffect(() => {
    const html = document.documentElement;
    if (isAmgActive) html.setAttribute("data-amg", "");
    else html.removeAttribute("data-amg");
  }, [isAmgActive]);
  // Quitar el atributo solo al desmontar de verdad (salir de /vehicles). Si
  // StrictMode simula un desmontaje, el mirror de arriba lo re-afirma en el
  // render siguiente.
  useEffect(() => {
    return () => {
      document.documentElement.removeAttribute("data-amg");
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Navegación shallow de los controles de filtro: actualiza la URL (query)
  // sin disparar una navegación de Next (cero fetch del RSC payload). Next
  // 14.1+ soporta pushState/replaceState nativos como shallow routing: el
  // useSearchParams de este mismo componente reacciona sin round-trip. El
  // href real se conserva en cada <Link> (SEO/deep-links intactos: carga
  // directa con query sigue siendo SSR); solo interceptamos el click.
  const shallowNavigate = (
    e: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    window.history.pushState(null, "", href);
  };

  // Truck subcategories
  const truckSubcategories = [
    { id: "all", name: "Todos" },
    { id: "accelo", name: "Accelo" },
    { id: "atego", name: "Atego" },
    { id: "actros", name: "Actros" },
    { id: "arocs", name: "Arocs" },
  ];

  // Sprinter subcategories — filtran por `id` (slug) del vehículo, no por v.category.
  const sprinterSubcategories = [
    { id: "all", name: "Todos" },
    { id: "sprinter-furgon", name: "Furgón" },
    { id: "sprinter-furgon-mixto", name: "Furgón Mixto" },
    { id: "sprinter-combi", name: "Combi" },
    { id: "sprinter-chasis", name: "Chasis" },
  ];

  // Vans subcategories — idem (filtran por id del vehículo).
  const vansSubcategories = [
    { id: "all", name: "Todos" },
    { id: "vito-mixto", name: "Vito Mixto" },
    { id: "vito-tourer", name: "Vito Tourer" },
  ];

  // Carrocerías - Auto subcategories
  const autoBodyTypes = [
    { id: "all", name: "Todos" },
    { id: "sedan", name: "Sedán" },
    { id: "hatchback", name: "Hatchback" },
    { id: "coupes", name: "Coupés" },
    { id: "cabrios-roadsters", name: "Cabrios/Roadsters" },
  ];

  // Carrocerías - SUV subcategories
  const suvBodyTypes = [
    { id: "all", name: "Todos" },
    { id: "suv-todoterreno", name: "SUV & Todoterreno" },
  ];

  // Tipo de combustible (opcional para todos)
  const fuelTypes = [
    { id: "all", name: "Todos" },
    { id: "nafta", name: "Nafta" },
    { id: "electrico", name: "Eléctrico" },
    { id: "hibrido", name: "Híbrido" },
  ];

  // Get body types based on category
  const getBodyTypes = () => {
    if (category === "trucks") return truckSubcategories;
    if (category === "auto") return autoBodyTypes;
    if (category === "suv") return suvBodyTypes;
    if (category === "sprinter") return sprinterSubcategories;
    if (category === "vans") return vansSubcategories;
    return [];
  };

  // Map vehicle category to main category
  // Handles all variations: singular, plural, with/without accents, different cases
  const getMainCategory = (vehicleCategory: string): string => {
    const cat = vehicleCategory.toLowerCase().trim();

    // AUTO categories (sedans, compacts, coupes, electric, general autos)
    const autoCategories = [
      "auto",
      "autos",
      "sedan",
      "sedanes",
      "sedán",
      "sedánes",
      "compacto",
      "compactos",
      "compacta",
      "compactas",
      "coupe",
      "coupes",
      "coupé",
      "coupés",
      "hatchback",
      "hatchbacks",
      "electrico",
      "electricos",
      "eléctrico",
      "eléctricos",
      "deportivo",
      "deportivos",
      "convertible",
      "convertibles",
      "cabriolet",
      "cabrios-roadsters",
      "amg", // AMG cars that are not SUVs go to auto
    ];

    // SUV categories
    const suvCategories = [
      "suv",
      "suvs",
      "crossover",
      "crossovers",
      "todoterreno",
      "4x4",
    ];

    // VANS categories
    const vansCategories = ["van", "vans"];

    // SPRINTER categories
    const sprinterCategories = ["sprinter", "sprinters"];

    // TRUCKS categories
    const trucksCategories = [
      "truck",
      "trucks",
      "camion",
      "camiones",
      "camión",
      "accelo",
      "atego",
      "actros",
      "arocs",
      "axor",
    ];

    if (autoCategories.includes(cat)) return "auto";
    if (suvCategories.includes(cat)) return "suv";
    if (vansCategories.includes(cat)) return "vans";
    if (sprinterCategories.includes(cat)) return "sprinter";
    if (trucksCategories.includes(cat)) return "trucks";

    // Default: return lowercase for consistency
    return cat;
  };

  // Predicado de filtrado (misma lógica de siempre, 100% intacta) como función
  // pura: se evalúa por card sobre la lista COMPLETA de vehículos montada, así
  // filtrar solo togglea `hidden` (display:none) sin remount ni re-animación.
  const matchesFilters = (v: Vehicle): boolean => {
    if (category === "all") return true;
    const mainCategory = getMainCategory(v.category);
    if (mainCategory !== category) return false;

    // Filter by brand for auto and suv categories
    if ((category === "auto" || category === "suv") && brand !== "all") {
      const isAMG = v.is_amg || false;
      if (brand === "amg" && !isAMG) return false;
      if (brand === "mercedes-benz" && isAMG) return false;
    }

    // Filter by subcategory (body type)
    if (subcategory !== "all") {
      // Sprinter y Vans usan el `id` (slug) del vehículo porque todos
      // comparten la misma `category` ("sprinter" o "vans") y los
      // distinguimos por id (sprinter-furgon, vito-tourer, etc.).
      if (category === "sprinter" || category === "vans") {
        if (v.id !== subcategory) return false;
      } else {
        const vehicleCat = v.category.toLowerCase().trim();
        if (!vehicleCat.includes(subcategory) && vehicleCat !== subcategory) {
          return false;
        }
      }
    }

    // Filter by fuel type
    if (fuelType !== "all") {
      const vehicleFuel = (v.fuel_type || "").toLowerCase().trim();
      if (vehicleFuel !== fuelType) {
        return false;
      }
    }

    return true;
  };
  const matchCount = vehicles.filter(matchesFilters).length;

  // Contador de filtros activos para el trigger del panel mobile. Brand no
  // cuenta: vive fuera del panel (toggle MB/AMG siempre visible en mobile).
  const activeFilterCount =
    (subcategory !== "all" ? 1 : 0) + (fuelType !== "all" ? 1 : 0);

  const categories = [
    { id: "all", name: "Todos" },
    { id: "auto", name: "Autos" },
    { id: "suv", name: "SUVs" },
    { id: "vans", name: "Vans" },
    { id: "sprinter", name: "Sprinter" },
    { id: "trucks", name: "Trucks" },
  ];

  // Mapa estático categoría→video. Cada categoría visitada monta su propio
  // <video> con esta src (ver visitedCats); un mp4 ya visto no se re-pide.
  const CATEGORY_VIDEOS: Record<string, string> = {
    all: "/heros Vehiculos/MercedesBenz-todos.mp4",
    auto: "/heros Vehiculos/mercedes benz auto.mp4",
    suv: "/heros Vehiculos/mercedes benz suv.mp4",
    vans: "/heros Vehiculos/mercedes benz vans.mp4",
    sprinter: "/heros Vehiculos/mercedes benz sprinter.mp4",
    trucks: "/heros Vehiculos/mercedes benz truck.mp4",
  };

  // Grid — entrada de las VehicleCard vía IntersectionObserver (reemplaza
  // ScrollTrigger.batch, ver AMENDMENT F4-2 / DEFECTO E): robusto ante
  // hidden-toggle porque IO re-evalúa en cada cambio de layout, sin
  // posiciones stale. Corre UNA sola vez (deps []); el cambio de filtro NO
  // recrea nada — cero ScrollTrigger.refresh.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".vcard-reveal"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      gsap.set(cards, { opacity: 1, scale: 1, clearProps: "transform" });
      cards.forEach((c) => revealedRef.current.add(c));
      return;
    }

    // Cascada hero→banda→cards: en el primer paint, las cards visibles arrancan
    // tras el hero.
    const CARD_COORD_DELAY = HERO_DELAY + 0.25;
    let rafId = 0;
    let pending: HTMLElement[] = [];

    const flush = () => {
      rafId = 0;
      if (pending.length === 0) return;
      const group = pending;
      pending = [];
      const coordinated = firstBatchRef.current; // el 1er grupo (above-fold) cae tras el hero
      firstBatchRef.current = false;
      const baseDelay = coordinated ? CARD_COORD_DELAY : 0;
      group.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.96 },
          {
            opacity: 1,
            scale: 1,
            duration: DUR.element,
            ease: GSAP_EASE.primary,
            delay: baseDelay + i * REVEAL_STAGGER,
            force3D: true,
            clearProps: "transform", // deja opacity:1 inline -> persiste al togglear hidden
            overwrite: true,
          },
        );
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          io.unobserve(el); // una sola vez por card
          if (revealedRef.current.has(el)) continue;
          revealedRef.current.add(el);
          pending.push(el);
        }
        if (pending.length && !rafId) rafId = requestAnimationFrame(flush);
      },
      { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.01 }, // ~ "top 88%"
    );

    cards.forEach((c) => io.observe(c));
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      io.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface-0 text-white pb-12">
      {/* Hero Section with Video */}
      <div className="relative h-[100svh] flex items-center justify-center overflow-hidden mb-20">
        {/* Video Background — un <video> persistente por categoría visitada.
            Crossfade por opacity (compositor). El saliente sigue visible hasta
            que el entrante llega a opacity-80 → cero frame negro, cero re-descarga. */}
        <div className="absolute inset-0">
          {visitedCats.map((cat) => (
            <video
              key={cat}
              ref={(el) => {
                if (el) videoRefs.current.set(cat, el);
                else videoRefs.current.delete(cat);
              }}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className={`absolute inset-0 w-full h-full object-cover brightness-90 contrast-105 transition-opacity duration-[var(--dur-element)] ease-[var(--ease-secondary)] ${
                category === cat ? "opacity-80" : "opacity-0"
              }`}
            >
              <source src={CATEGORY_VIDEOS[cat] ?? CATEGORY_VIDEOS.all} type="video/mp4" />
            </video>
          ))}
        </div>

        {/* Scrim en capas: base inferior (ancla el texto) + viñeta superior (equilibra navbar) */}
        <div className="absolute inset-0 bg-gradient-to-t from-mb-black/80 via-mb-black/25 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 h-1/3 bg-gradient-to-b from-mb-black/45 to-transparent z-10 pointer-events-none" />

        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <motion.h1
            initial={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 16 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: DUR.hero,
              ease: EASE.primary,
              delay: prefersReducedMotion ? 0 : HERO_DELAY,
            }}
            className="text-5xl md:text-8xl font-bold font-serif tracking-[-0.02em] mb-6 [text-shadow:0_2px_24px_rgba(5,5,5,0.45)]"
          >
            {category === "all" && pegar("Toda Nuestra Gama")}
            {category === "auto" && "Autos"}
            {category === "suv" && "SUVs"}
            {category === "vans" && "Vans"}
            {category === "sprinter" && "Sprinter"}
            {category === "trucks" && "Trucks"}
          </motion.h1>
          <motion.p
            initial={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 16 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: DUR.hero,
              ease: EASE.primary,
              delay: prefersReducedMotion ? 0 : HERO_DELAY + 0.15,
            }}
            className="text-xl md:text-2xl text-gray-300 font-light tracking-wide"
          >
            <span className="whitespace-nowrap">Ingeniería alemana.</span>{" "}
            <span className="whitespace-nowrap">Excelencia garantizada.</span>
          </motion.p>
        </div>
      </div>

      {/* Category Filter Band — "banda de instrumentos" (sticky bajo el navbar) */}
      <motion.div
        initial={
          prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: DUR.element,
          ease: EASE.primary,
          delay: prefersReducedMotion ? 0 : HERO_DELAY + 0.1,
        }}
        className="lg:sticky lg:top-[calc(var(--nav-h)-1px)] z-30 bg-transparent backdrop-blur-md border-b border-white/10 mb-6 lg:mb-12"
      >
        <div className="mx-auto max-w-[1400px]">
          {/* Mobile: grid fijo 2 filas × 3 (all·auto·suv / vans·sprinter·trucks),
              labels completos, cero scroll horizontal. Desktop: flex centrado (intacto). */}
          <ul className="grid grid-cols-3 lg:flex h-auto lg:h-14 lg:items-stretch lg:justify-center">
            {categories.map((cat) => {
              const active = category === cat.id;
              return (
                <li key={cat.id} className="relative flex">
                  <Link
                    href={`/vehicles?category=${cat.id}`}
                    scroll={false}
                    onClick={(e) => shallowNavigate(e, `/vehicles?category=${cat.id}`)}
                    aria-current={active ? "true" : undefined}
                    className={`group relative flex h-12 lg:h-full w-full items-center justify-center px-2 lg:px-7 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-3px] focus-visible:outline-white/60 transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] ${
                      active ? "bg-white lg:bg-transparent" : "bg-transparent"
                    }`}
                  >
                    <span
                      className={`relative z-10 text-[11px] lg:text-xs uppercase leading-none tracking-[0.08em] transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] ${
                        active
                          ? "text-black lg:text-white font-semibold"
                          : "text-white/60 lg:text-white/60 font-normal group-hover:text-white"
                      }`}
                    >
                      {cat.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </motion.div>

      {/* Main Content Container */}
      <div className="w-full pt-6 lg:pt-12 pb-12 relative bg-mb-black">
        {/* AMG Decorative Elements */}
        {(category === "auto" || category === "suv") && brand === "amg" && (
          <>
            {/* Animated aurora background — luces teal a la deriva sobre negro */}
            <div className="amg-aurora" aria-hidden="true">
              <div className="amg-blob amg-blob--1" />
              <div className="amg-blob amg-blob--2" />
              <div className="amg-blob amg-blob--3" />
            </div>
            {/* AMG Performance Badge */}
            <div className="absolute top-6 right-6 md:right-12 opacity-30 pointer-events-none hidden lg:block">
              <span className="text-[10px] font-bold tracking-[0.4em] text-[#5AC3B6] uppercase">
                Performance
              </span>
            </div>
          </>
        )}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          {category !== "all" && (
            <>
              {/* ── TOGGLE MARCA MOBILE (fuera del panel, siempre visible) ── */}
              {(category === "auto" || category === "suv") && (
                <div className="lg:hidden mb-6 grid grid-cols-2 gap-2">
                  <Link
                    href={`/vehicles?category=${category}&brand=mercedes-benz`}
                    scroll={false}
                    onClick={(e) =>
                      shallowNavigate(
                        e,
                        `/vehicles?category=${category}&brand=mercedes-benz`,
                      )
                    }
                    className={`flex h-14 items-center justify-center border transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] ${
                      brand === "mercedes-benz"
                        ? "border-white bg-white/[0.06]"
                        : "border-white/20"
                    }`}
                  >
                    <Image
                      src="/logosParaSlidebar/mercedesBenzLogoLetras.png"
                      alt="Mercedes-Benz"
                      width={110}
                      height={26}
                      className="h-5 w-auto object-contain"
                      style={{ filter: "brightness(0) invert(1)" }}
                    />
                  </Link>
                  <Link
                    href={`/vehicles?category=${category}&brand=amg`}
                    scroll={false}
                    onClick={(e) =>
                      shallowNavigate(e, `/vehicles?category=${category}&brand=amg`)
                    }
                    aria-label="AMG"
                    className={`h-14 border bg-mb-black bg-cover bg-center bg-no-repeat transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] ${
                      brand === "amg" ? "border-white" : "border-white/20"
                    }`}
                    style={{ backgroundImage: "url('/logo-amg.jpg')" }}
                  />
                </div>
              )}

              {/* ── PANEL DE FILTROS MOBILE (in-flow, dropdown propio) ── */}
              <div className="lg:hidden mb-8">
                <button
                  onClick={() => setFiltersOpen((o) => !o)}
                  aria-expanded={filtersOpen}
                  aria-controls="filtros-panel"
                  className="flex w-full items-center justify-between border border-white/25 px-4 h-12 text-xs font-semibold uppercase tracking-[0.15em] text-white"
                >
                  <span className="flex items-center gap-2">
                    Filtros
                    {activeFilterCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center bg-white px-1 text-[10px] font-bold text-black tabular-nums">
                        {activeFilterCount}
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-[var(--dur-micro)] ease-[var(--ease-micro)] ${filtersOpen ? "rotate-180" : ""}`}
                    strokeWidth={1.5}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {filtersOpen && (
                    <motion.div
                      id="filtros-panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: DUR.element, ease: EASE.secondary }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-6 pt-6">
                        {/* SECCIÓN CARROCERÍA / MODELO */}
                        {getBodyTypes().length > 0 && (
                          <section>
                            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
                              {category === "auto" || category === "suv"
                                ? "Carrocería"
                                : "Modelo"}
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                              {getBodyTypes().map((bt) => {
                                const href =
                                  category === "auto" || category === "suv"
                                    ? `/vehicles?category=${category}&brand=${brand}&subcategory=${bt.id}&fuelType=${fuelType}`
                                    : `/vehicles?category=${category}&subcategory=${bt.id}`;
                                return (
                                  <Link
                                    key={bt.id}
                                    href={href}
                                    scroll={false}
                                    onClick={(e) => shallowNavigate(e, href)}
                                    className={`flex h-11 items-center justify-center border px-3 text-[11px] font-semibold uppercase tracking-widest text-center transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] ${
                                      subcategory === bt.id
                                        ? "text-black bg-white border-white"
                                        : "text-white/70 border-white/25"
                                    }`}
                                  >
                                    {bt.name}
                                  </Link>
                                );
                              })}
                            </div>
                          </section>
                        )}

                        {/* SECCIÓN COMBUSTIBLE (solo auto/suv) */}
                        {(category === "auto" || category === "suv") && (
                          <section>
                            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
                              Combustible
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                              {fuelTypes.map((fuel) => {
                                const href = `/vehicles?category=${category}&brand=${brand}&subcategory=${subcategory}&fuelType=${fuel.id}`;
                                return (
                                  <Link
                                    key={fuel.id}
                                    href={href}
                                    scroll={false}
                                    onClick={(e) => shallowNavigate(e, href)}
                                    className={`flex h-11 items-center justify-center border px-3 text-[11px] font-semibold uppercase tracking-widest transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] ${
                                      fuelType === fuel.id
                                        ? "text-black bg-white border-white"
                                        : "text-white/70 border-white/25"
                                    }`}
                                  >
                                    {fuel.name}
                                  </Link>
                                );
                              })}
                            </div>
                          </section>
                        )}

                        {/* Limpiar filtros: solo si hay activos */}
                        {activeFilterCount > 0 && (
                          <Link
                            href={`/vehicles?category=${category}`}
                            scroll={false}
                            onClick={(e) => shallowNavigate(e, `/vehicles?category=${category}`)}
                            className="h-11 flex items-center justify-center text-[11px] font-medium uppercase tracking-[0.15em] text-white/50 underline underline-offset-4"
                          >
                            Limpiar filtros
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Trucks Filter Bar */}
              {category === "trucks" && (
                <div className="hidden lg:block">
                <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
                  {truckSubcategories.map((subcat) => {
                    const href = `/vehicles?category=trucks&subcategory=${subcat.id}`;
                    return (
                      <Link
                        key={subcat.id}
                        href={href}
                        scroll={false}
                        onClick={(e) => shallowNavigate(e, href)}
                        className={`px-4 py-2.5 text-xs font-semibold tracking-widest uppercase border transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] whitespace-nowrap focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60 ${
                          subcategory === subcat.id
                            ? "text-black bg-white border-white"
                            : "text-white/70 bg-transparent border-white/25 hover:text-white hover:border-white/50"
                        }`}
                      >
                        {subcat.name}
                      </Link>
                    );
                  })}
                </div>
                </div>
              )}

              {/* Sprinter Filter Bar */}
              {category === "sprinter" && (
                <div className="hidden lg:block">
                <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
                  {sprinterSubcategories.map((subcat) => {
                    const href = `/vehicles?category=sprinter&subcategory=${subcat.id}`;
                    return (
                      <Link
                        key={subcat.id}
                        href={href}
                        scroll={false}
                        onClick={(e) => shallowNavigate(e, href)}
                        className={`px-4 py-2.5 text-xs font-semibold tracking-widest uppercase border transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] whitespace-nowrap focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60 ${
                          subcategory === subcat.id
                            ? "text-black bg-white border-white"
                            : "text-white/70 bg-transparent border-white/25 hover:text-white hover:border-white/50"
                        }`}
                      >
                        {subcat.name}
                      </Link>
                    );
                  })}
                </div>
                </div>
              )}

              {/* Vans Filter Bar */}
              {category === "vans" && (
                <div className="hidden lg:block">
                <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
                  {vansSubcategories.map((subcat) => {
                    const href = `/vehicles?category=vans&subcategory=${subcat.id}`;
                    return (
                      <Link
                        key={subcat.id}
                        href={href}
                        scroll={false}
                        onClick={(e) => shallowNavigate(e, href)}
                        className={`px-4 py-2.5 text-xs font-semibold tracking-widest uppercase border transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] whitespace-nowrap focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60 ${
                          subcategory === subcat.id
                            ? "text-black bg-white border-white"
                            : "text-white/70 bg-transparent border-white/25 hover:text-white hover:border-white/50"
                        }`}
                      >
                        {subcat.name}
                      </Link>
                    );
                  })}
                </div>
                </div>
              )}

              {/* Auto & SUV Filter Bar — marca grande arriba + sub-filtros abajo */}
              {(category === "auto" || category === "suv") && (
                <div className="hidden lg:block">
                <div className="mb-10 flex flex-col items-center gap-6">
                  {/* Brand Toggle — grande, centrado */}
                  <div className="flex justify-center gap-4">
                    <Link
                      href={`/vehicles?category=${category}&brand=mercedes-benz`}
                      scroll={false}
                      onClick={(e) =>
                        shallowNavigate(
                          e,
                          `/vehicles?category=${category}&brand=mercedes-benz`,
                        )
                      }
                      className={`flex h-16 w-40 items-center justify-center border transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60 sm:h-20 sm:w-72 ${
                        brand === "mercedes-benz"
                          ? "border-white bg-white/[0.06]"
                          : "border-white/20 hover:border-white/40"
                      }`}
                    >
                      <Image
                        src="/logosParaSlidebar/mercedesBenzLogoLetras.png"
                        alt="Mercedes-Benz"
                        width={110}
                        height={26}
                        className="h-6 w-auto object-contain sm:h-8"
                        style={{ filter: "brightness(0) invert(1)" }}
                      />
                    </Link>
                    <Link
                      href={`/vehicles?category=${category}&brand=amg`}
                      scroll={false}
                      onClick={(e) =>
                        shallowNavigate(e, `/vehicles?category=${category}&brand=amg`)
                      }
                      aria-label="AMG"
                      className={`h-16 w-40 border bg-mb-black bg-cover bg-center bg-no-repeat transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60 sm:h-20 sm:w-72 ${
                        brand === "amg"
                          ? "border-white"
                          : "border-white/20 hover:border-white/40"
                      }`}
                      style={{ backgroundImage: "url('/logo-amg.jpg')" }}
                    />
                  </div>

                  {/* Sub-filtros — carrocería + combustible, destacados */}
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
                    <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
                      Carrocería
                    </span>
                    {getBodyTypes().map((bodyType) => {
                      const href = `/vehicles?category=${category}&brand=${brand}&subcategory=${bodyType.id}&fuelType=${fuelType}`;
                      return (
                        <Link
                          key={bodyType.id}
                          href={href}
                          scroll={false}
                          onClick={(e) => shallowNavigate(e, href)}
                          className={`border px-4 py-2.5 text-xs font-semibold uppercase tracking-widest whitespace-nowrap transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60 ${
                            subcategory === bodyType.id
                              ? "text-black bg-white border-white"
                              : "text-white/70 bg-transparent border-white/25 hover:text-white hover:border-white/50"
                          }`}
                        >
                          {bodyType.name}
                        </Link>
                      );
                    })}

                    <span className="mx-2 hidden h-6 w-px bg-white/15 md:block" />

                    <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
                      Combustible
                    </span>
                    {fuelTypes.map((fuel) => {
                      const href = `/vehicles?category=${category}&brand=${brand}&subcategory=${subcategory}&fuelType=${fuel.id}`;
                      return (
                        <Link
                          key={fuel.id}
                          href={href}
                          scroll={false}
                          onClick={(e) => shallowNavigate(e, href)}
                          className={`border px-4 py-2.5 text-xs font-semibold uppercase tracking-widest whitespace-nowrap transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60 ${
                            fuelType === fuel.id
                              ? "text-black bg-white border-white"
                              : "text-white/70 bg-transparent border-white/25 hover:text-white hover:border-white/50"
                          }`}
                        >
                          {fuel.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
                </div>
              )}
            </>
          )}

          {/* Vehicle Grid */}
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
          >
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`vcard-reveal [content-visibility:auto] [contain-intrinsic-size:auto_233px] ${matchesFilters(vehicle) ? "" : "hidden"}`}
              >
                <VehicleCard
                  title={vehicle.name}
                  category={vehicle.category}
                  href={`/vehicles/${vehicle.id}`}
                  image={`/vehicles/${vehicle.id}/foto-card/card`}
                  fuelType={vehicle.fuel_type}
                  isAMG={brand === "amg"}
                />
              </div>
            ))}
          </div>

          {matchCount === 0 &&
            ((category === "auto" || category === "suv") &&
            brand === "amg" ? (
              <div className="text-center py-24">
                <p className="text-[10px] font-bold tracking-[0.4em] text-[#5AC3B6]/70 uppercase mb-4">
                  Performance
                </p>
                <p className="text-lg md:text-xl font-light tracking-wide text-white/70">
                  No se encontraron vehículos en esta categoría.
                </p>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                No se encontraron vehículos en esta categoría.
              </div>
            ))}
        </div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 h-12 w-12 flex items-center justify-center border border-white/20 bg-mb-black text-white transition-colors duration-[var(--dur-micro)] ease-[var(--ease-micro)] hover:bg-white hover:text-black hover:border-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/60 group"
            aria-label="Volver arriba"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VehiclesClient({
  vehicles,
}: {
  vehicles: Vehicle[];
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black">
          <div className="h-[100svh] bg-mb-black" aria-hidden />
          <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <VehicleCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <VehiclesContent vehicles={vehicles} />
    </Suspense>
  );
}
