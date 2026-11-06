"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import type { Vehicle } from "@/data/vehicles";
import { RichText } from "@/components/RichText";
import { DETAIL, DUR, EASE, GSAP_EASE } from "@/lib/motion-tokens";
import { usePointerFine } from "./usePointerFine";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { NumberTicker } from "./NumberTicker";
import { SlidingTabs } from "./SlidingTabs";
import { EmptyMedia } from "./EmptyMedia";
import { buildAvailableTabs } from "./utils";

// Helper to check if image exists
const getImagePath = (
  basePath: string,
  formats = ["avif", "webp", "jpg", "jpeg", "png"]
) => {
  return `${basePath}.${formats[0]}`; // Default to first format, Next.js will handle errors
};

/** Shift Card (cult-ui) — parallax interno transform-only, SOLO desktop/pointer:fine.
 * La imagen se desplaza levemente (máx ~8px) siguiendo el puntero dentro del card.
 * Mobile/touch/reduced-motion: card estática (el hook no aplica ningún transform). */
function useShiftCard(
  containerRef: React.RefObject<HTMLAnchorElement | null>,
  imgWrapRef: React.RefObject<HTMLDivElement | null>,
  maxShiftPx = 8
) {
  const pointerFine = usePointerFine();
  const reduced = usePrefersReducedMotion();
  const active = pointerFine && !reduced;

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    const imgWrap = imgWrapRef.current;
    if (!container || !imgWrap) return;

    gsap.set(imgWrap, { scale: DETAIL.cardScale });
    const xTo = gsap.quickTo(imgWrap, "x", {
      duration: DUR.element,
      ease: GSAP_EASE.secondary,
    });
    const yTo = gsap.quickTo(imgWrap, "y", {
      duration: DUR.element,
      ease: GSAP_EASE.secondary,
    });

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      xTo(px * maxShiftPx * 2);
      yTo(py * maxShiftPx * 2);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);
    return () => {
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      gsap.set(imgWrap, { clearProps: "transform" });
    };
  }, [active, maxShiftPx, containerRef, imgWrapRef]);

  return active;
}

function AutonomyCardImage({
  active,
  imgWrapRef,
  hasError,
  src,
  alt,
  onError,
  tone,
}: {
  active: boolean;
  imgWrapRef: React.RefObject<HTMLDivElement | null>;
  hasError: boolean;
  src: string;
  alt: string;
  onError: () => void;
  tone: "light" | "dark";
}) {
  return (
    <div
      ref={imgWrapRef}
      className={`absolute inset-0 ${active ? "will-change-transform" : ""}`}
    >
      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          onError={onError}
        />
      ) : (
        <EmptyMedia aspect="16/9" tone={tone} label={alt} className="absolute inset-0" />
      )}
    </div>
  );
}

export function AutonomySection({
  vehicle,
  isAMG,
  basePath,
}: {
  vehicle: Vehicle;
  isAMG: boolean;
  basePath: string;
}) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [activeAutonomyTab, setActiveAutonomyTab] = useState<string>("tab1");
  const reduced = usePrefersReducedMotion();

  const card1ContainerRef = useRef<HTMLAnchorElement>(null);
  const card1ImgWrapRef = useRef<HTMLDivElement>(null);
  const card1Active = useShiftCard(card1ContainerRef, card1ImgWrapRef);

  const card2ContainerRef = useRef<HTMLAnchorElement>(null);
  const card2ImgWrapRef = useRef<HTMLDivElement>(null);
  const card2Active = useShiftCard(card2ContainerRef, card2ImgWrapRef);

  // Handle image error
  const handleImageError = (imagePath: string) => {
    setImageErrors((prev) => new Set(prev).add(imagePath));
  };

  // Check if image has error
  const hasImageError = (imagePath: string) => imageErrors.has(imagePath);

  if (
    !(
      (vehicle.chargingTab1Content?.length ?? 0) > 0 ||
      (vehicle.chargingTab2Content?.length ?? 0) > 0 ||
      vehicle.autonomyCard1Title ||
      vehicle.autonomyCard2Title
    )
  ) {
    return null;
  }

  const chargingTabs = buildAvailableTabs([
    {
      id: "tab1",
      label: vehicle.chargingTab1Title || "",
      available: Boolean(
        vehicle.chargingTab1Title && (vehicle.chargingTab1Content?.length ?? 0) > 0
      ),
    },
    {
      id: "tab2",
      label: vehicle.chargingTab2Title || "",
      available: Boolean(
        vehicle.chargingTab2Title && (vehicle.chargingTab2Content?.length ?? 0) > 0
      ),
    },
  ]);

  const tone: "light" | "dark" = isAMG ? "dark" : "light";

  return (
    <section
      /* Sección blanca: en el celular el header se vuelve blanco al pasar (Navbar). */
      data-nav-mobile={isAMG ? undefined : "papel"}
      className={`py-24 md:py-32 relative ${
        isAMG
          ? "bg-gradient-to-b from-neutral-900 via-black to-neutral-950 text-white"
          : "bg-white text-black"
      }`}
    >
      {isAMG && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amg-teal/40 to-transparent" />
      )}

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        {vehicle.autonomyGeneralTitle && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 30 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            animate={reduced ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true }}
            transition={{ duration: DUR.element, ease: EASE.secondary }}
            className="mb-16 text-center"
          >
            <h2
              className={`text-h1 font-light tracking-tight mb-6 ${
                isAMG ? "text-amg-teal" : ""
              }`}
            >
              {vehicle.autonomyGeneralTitle}
            </h2>
            {vehicle.autonomyGeneralDescription && (
              <p
                className={`text-base md:text-lg font-light max-w-4xl mx-auto leading-relaxed ${
                  isAMG ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {vehicle.autonomyGeneralDescription}
              </p>
            )}
          </motion.div>
        )}

        {/* Cards de Simuladores */}
        {(vehicle.autonomyCard1Title || vehicle.autonomyCard2Title) && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 30 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            animate={reduced ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true }}
            transition={{ duration: DUR.element, ease: EASE.secondary, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20"
          >
            {/* Card 1 - Simular autonomía */}
            {vehicle.autonomyCard1Title && (
              <Link
                ref={card1ContainerRef}
                href={vehicle.autonomyCard1Link || "#"}
                target={vehicle.autonomyCard1Link ? "_blank" : undefined}
                className="group relative aspect-[16/9] overflow-hidden"
              >
                {/* Imagen de fondo (Shift Card: parallax desktop-only, transform-only) */}
                <AutonomyCardImage
                  active={card1Active}
                  imgWrapRef={card1ImgWrapRef}
                  hasError={hasImageError(`${basePath}/autonomy/card1`)}
                  src={getImagePath(`${basePath}/autonomy/card1`)}
                  alt={vehicle.autonomyCard1Title}
                  onError={() => handleImageError(`${basePath}/autonomy/card1`)}
                  tone={tone}
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Contenido */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                  <div
                    className={`inline-flex items-center gap-2 text-xs tracking-wider uppercase mb-3 ${
                      isAMG ? "text-amg-teal" : "text-white/70"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>Simulá</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-light text-white mb-2">
                    <NumberTicker value={vehicle.autonomyCard1Title} />
                  </h3>
                  {vehicle.autonomyCard1Description && (
                    <p className="text-sm text-white/80 font-light">
                      {vehicle.autonomyCard1Description}
                    </p>
                  )}
                  <div
                    className={`mt-4 inline-flex items-center gap-2 text-sm font-light transition-transform duration-[var(--dur-element)] ease-[var(--ease-secondary)] group-hover:translate-x-2 ${
                      isAMG ? "text-amg-teal" : "text-white"
                    }`}
                  >
                    <span>Simular</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            )}

            {/* Card 2 - Simular tiempo de carga */}
            {vehicle.autonomyCard2Title && (
              <Link
                ref={card2ContainerRef}
                href={vehicle.autonomyCard2Link || "#"}
                target={vehicle.autonomyCard2Link ? "_blank" : undefined}
                className="group relative aspect-[16/9] overflow-hidden"
              >
                {/* Imagen de fondo (Shift Card: parallax desktop-only, transform-only) */}
                <AutonomyCardImage
                  active={card2Active}
                  imgWrapRef={card2ImgWrapRef}
                  hasError={hasImageError(`${basePath}/autonomy/card2`)}
                  src={getImagePath(`${basePath}/autonomy/card2`)}
                  alt={vehicle.autonomyCard2Title}
                  onError={() => handleImageError(`${basePath}/autonomy/card2`)}
                  tone={tone}
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Contenido */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                  <div
                    className={`inline-flex items-center gap-2 text-xs tracking-wider uppercase mb-3 ${
                      isAMG ? "text-amg-teal" : "text-white/70"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4v16m0-8h8m-8 0H4"
                      />
                    </svg>
                    <span>Simular</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-light text-white mb-2">
                    <NumberTicker value={vehicle.autonomyCard2Title} />
                  </h3>
                  {vehicle.autonomyCard2Description && (
                    <p className="text-sm text-white/80 font-light">
                      {vehicle.autonomyCard2Description}
                    </p>
                  )}
                  <div
                    className={`mt-4 inline-flex items-center gap-2 text-sm font-light transition-transform duration-[var(--dur-element)] ease-[var(--ease-secondary)] group-hover:translate-x-2 ${
                      isAMG ? "text-amg-teal" : "text-white"
                    }`}
                  >
                    <span>Simular</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            )}
          </motion.div>
        )}

        {/* Tabs de Carga y Tecnología */}
        {((vehicle.chargingTab1Content?.length ?? 0) > 0 ||
          (vehicle.chargingTab2Content?.length ?? 0) > 0) && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 30 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            animate={reduced ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true }}
            transition={{ duration: DUR.element, ease: EASE.secondary, delay: 0.4 }}
          >
            {/* Tab Navigation — bloque invertido deslizante (SlidingTabs), sin subrayado. */}
            <div className="mb-12">
              <SlidingTabs
                tabs={chargingTabs}
                activeId={activeAutonomyTab}
                onChange={setActiveAutonomyTab}
                scope="autonomy-charging"
                variant={isAMG ? "dark" : "papel"}
                isAMG={isAMG}
              />
            </div>

            {/* Tab Content */}
            <div className="space-y-12">
              {/* Tab 1 - Carga */}
              {activeAutonomyTab === "tab1" &&
                vehicle.chargingTab1Content?.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DUR.element, ease: EASE.secondary, delay: index * 0.1 }}
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center ${
                      index % 2 === 1 ? "lg:grid-flow-dense" : ""
                    }`}
                  >
                    {/* Imagen */}
                    <div
                      className={index % 2 === 1 ? "lg:col-start-2" : ""}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {!hasImageError(
                          `${basePath}/autonomy/charging/${index + 1}`
                        ) ? (
                          <Image
                            src={getImagePath(
                              `${basePath}/autonomy/charging/${index + 1}`
                            )}
                            alt={item.title || "Carga"}
                            fill
                            className="object-cover"
                            onError={() =>
                              handleImageError(
                                `${basePath}/autonomy/charging/${index + 1}`
                              )
                            }
                          />
                        ) : (
                          <EmptyMedia
                            aspect="4/3"
                            tone={tone}
                            label={item.title}
                            className="absolute inset-0"
                          />
                        )}
                      </div>
                    </div>

                    {/* Contenido */}
                    <div
                      className={
                        index % 2 === 1
                          ? "lg:col-start-1 lg:row-start-1"
                          : ""
                      }
                    >
                      {item.title && (
                        <h3
                          className={`text-2xl md:text-4xl font-light mb-4 ${
                            isAMG ? "text-white" : ""
                          }`}
                        >
                          <NumberTicker value={item.title} />
                        </h3>
                      )}
                      {item.description && (
                        <RichText
                          className={`text-base md:text-lg font-light leading-relaxed ${
                            isAMG ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {item.description}
                        </RichText>
                      )}
                    </div>
                  </motion.div>
                ))}

              {/* Tab 2 - Tecnología */}
              {activeAutonomyTab === "tab2" &&
                vehicle.chargingTab2Content?.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DUR.element, ease: EASE.secondary, delay: index * 0.1 }}
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center ${
                      index % 2 === 1 ? "lg:grid-flow-dense" : ""
                    }`}
                  >
                    {/* Imagen */}
                    <div
                      className={index % 2 === 1 ? "lg:col-start-2" : ""}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {!hasImageError(
                          `${basePath}/autonomy/technology/${index + 1}`
                        ) ? (
                          <Image
                            src={getImagePath(
                              `${basePath}/autonomy/technology/${index + 1}`
                            )}
                            alt={item.title || "Tecnología"}
                            fill
                            className="object-cover"
                            onError={() =>
                              handleImageError(
                                `${basePath}/autonomy/technology/${
                                  index + 1
                                }`
                              )
                            }
                          />
                        ) : (
                          <EmptyMedia
                            aspect="4/3"
                            tone={tone}
                            label={item.title}
                            className="absolute inset-0"
                          />
                        )}
                      </div>
                    </div>

                    {/* Contenido */}
                    <div
                      className={
                        index % 2 === 1
                          ? "lg:col-start-1 lg:row-start-1"
                          : ""
                      }
                    >
                      {item.title && (
                        <h3
                          className={`text-2xl md:text-4xl font-light mb-4 ${
                            isAMG ? "text-white" : ""
                          }`}
                        >
                          <NumberTicker value={item.title} />
                        </h3>
                      )}
                      {item.description && (
                        <RichText
                          className={`text-base md:text-lg font-light leading-relaxed ${
                            isAMG ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {item.description}
                        </RichText>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
