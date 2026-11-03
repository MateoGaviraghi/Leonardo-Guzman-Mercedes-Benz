"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Vehicle } from "@/data/vehicles";
import { getInitialEquipmentTab } from "@/lib/parseVehicle";
import { RichText } from "@/components/RichText";
import { MultiFormatImage } from "./MultiFormatImage";
import { EmptyMedia } from "./EmptyMedia";
import { FocusCards, FocusCard } from "./FocusCards";
import { SlidingTabs } from "./SlidingTabs";
import { buildAvailableTabs } from "./utils";
import { DUR, EASE } from "@/lib/motion-tokens";
import { useMaskedLinesReveal } from "./useSectionReveal";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import type { TitledItem } from "./types";

/**
 * Los 7 bloques de equipamiento, en el orden original (verbatim).
 * `folder` = subcarpeta bajo `${basePath}/equipment/`. `alt` = fallback de alt
 * text idéntico al que tenía cada bloque antes de refactorizar a `.map`.
 */
const EQUIPMENT_CATEGORIES = [
  { id: "exterior", label: "Exterior", folder: "exterior", alt: "Exterior" },
  { id: "interior", label: "Interior", folder: "interior", alt: "Interior" },
  {
    id: "multimedia",
    label: "Sistema multimedia",
    folder: "multimedia",
    alt: "Multimedia",
  },
  {
    id: "asistencia",
    label: "Sistemas de asistencia",
    folder: "asistencia",
    alt: "Asistencia",
  },
  { id: "confort", label: "Confort", folder: "confort", alt: "Confort" },
  {
    id: "tren-rodaje",
    label: "Tren de rodaje",
    folder: "tren-rodaje",
    alt: "Tren de rodaje",
  },
  {
    id: "seguridad",
    label: "Seguridad",
    folder: "seguridad",
    alt: "Seguridad",
  },
] as const;

function itemsFor(vehicle: Vehicle, id: (typeof EQUIPMENT_CATEGORIES)[number]["id"]): TitledItem[] {
  switch (id) {
    case "exterior":
      return vehicle.equipExterior ?? [];
    case "interior":
      return vehicle.equipInterior ?? [];
    case "multimedia":
      return vehicle.equipMultimedia ?? [];
    case "asistencia":
      return vehicle.equipAsistencia ?? [];
    case "confort":
      return vehicle.equipConfort ?? [];
    case "tren-rodaje":
      return vehicle.equipTrenRodaje ?? [];
    case "seguridad":
      return vehicle.equipSeguridad ?? [];
  }
}

export function EquipmentSection({
  vehicle,
  isAMG,
  basePath,
}: {
  vehicle: Vehicle;
  isAMG: boolean;
  basePath: string;
}) {
  const [activeEquipmentTab, setActiveEquipmentTab] = useState<string>(
    getInitialEquipmentTab(vehicle)
  );
  const h2Ref = useRef<HTMLHeadingElement>(null);
  useMaskedLinesReveal(h2Ref);
  const reduced = usePrefersReducedMotion();

  if (
    !(
      vehicle.equipmentGeneralTitle &&
      ((vehicle.equipExterior && vehicle.equipExterior.length > 0) ||
        (vehicle.equipInterior && vehicle.equipInterior.length > 0) ||
        (vehicle.equipMultimedia && vehicle.equipMultimedia.length > 0) ||
        (vehicle.equipAsistencia && vehicle.equipAsistencia.length > 0) ||
        (vehicle.equipConfort && vehicle.equipConfort.length > 0) ||
        (vehicle.equipTrenRodaje && vehicle.equipTrenRodaje.length > 0) ||
        (vehicle.equipSeguridad && vehicle.equipSeguridad.length > 0))
    )
  ) {
    return null;
  }

  const tabs = buildAvailableTabs(
    EQUIPMENT_CATEGORIES.map((cat) => ({
      id: cat.id,
      label: cat.label,
      available: itemsFor(vehicle, cat.id).length > 0,
    }))
  );

  const activeId =
    tabs.find((t) => t.id === activeEquipmentTab)?.id ?? tabs[0]?.id ?? activeEquipmentTab;
  const activeCategory = EQUIPMENT_CATEGORIES.find((cat) => cat.id === activeId);
  const activeItems = activeCategory ? itemsFor(vehicle, activeCategory.id) : [];

  return (
    <section
      className={`py-24 md:py-32 text-white relative ${
        isAMG
          ? "bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950"
          : "bg-black"
      }`}
    >
      {isAMG && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amg-teal/40 to-transparent" />
      )}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h2
          ref={h2Ref}
          className={`text-h1 font-light mb-6 text-center ${
            isAMG ? "text-amg-teal" : ""
          }`}
        >
          {vehicle.equipmentGeneralTitle}
        </h2>
        {vehicle.equipmentGeneralDescription && (
          <p className="text-lg md:text-xl text-gray-200 font-light mb-16 md:mb-24 max-w-3xl mx-auto text-center">
            {vehicle.equipmentGeneralDescription}
          </p>
        )}

        {/* Tabs Navigation */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          {tabs.length > 1 ? (
            <SlidingTabs
              tabs={tabs}
              activeId={activeId}
              onChange={setActiveEquipmentTab}
              scope="equipment"
              variant="dark"
              isAMG={isAMG}
            />
          ) : (
            // SlidingTabs oculta la barra cuando hay un solo tab (paridad con
            // Exterior/Interior). Equipamiento SIEMPRE mostró su tab activo
            // como botón — se preserva ese botón único para no perder el
            // punto de anclaje accesible del gate de integridad.
            tabs[0] && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setActiveEquipmentTab(tabs[0].id)}
                  className={`relative px-4 py-2 text-xs font-light tracking-wider uppercase sm:text-sm ${
                    isAMG ? "bg-amg-teal text-black" : "bg-white text-ink"
                  }`}
                >
                  {tabs[0].label}
                </button>
              </div>
            )
          )}
        </div>

        {/* Tab Content */}
        <div
          id={tabs.length > 1 ? "equipment-panel" : undefined}
          role={tabs.length > 1 ? "tabpanel" : undefined}
          aria-labelledby={tabs.length > 1 ? `equipment-tab-${activeId}` : undefined}
          className="min-h-[300px] sm:min-h-[350px] md:min-h-[400px]"
        >
          {activeCategory && activeItems.length > 0 && (
            <motion.div
              key={activeCategory.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: DUR.element, ease: EASE.secondary }}
            >
              <FocusCards className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {activeItems.map((item, index) => {
                  const imagePath = `${basePath}/equipment/${activeCategory.folder}/${
                    index + 1
                  }`;
                  return (
                    <motion.div
                      key={index}
                      initial={reduced ? false : { opacity: 0, scale: 0.97 }}
                      whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
                      animate={reduced ? { opacity: 1, scale: 1 } : undefined}
                      viewport={{ once: true }}
                      transition={{
                        delay: Math.floor(index / 3) * 0.25,
                        duration: DUR.element,
                        ease: EASE.secondary,
                      }}
                    >
                      <FocusCard
                        className={
                          isAMG
                            ? "rounded-lg overflow-hidden border border-amg-teal/20 hover:border-amg-teal/50"
                            : ""
                        }
                      >
                        <div
                          className={`group relative aspect-[4/3] overflow-hidden mb-3 sm:mb-4 ${
                            isAMG ? "bg-neutral-800" : "bg-zinc-800"
                          }`}
                        >
                          <EmptyMedia aspect="4/3" tone="dark" className="absolute inset-0" />
                          <MultiFormatImage
                            basePath={imagePath}
                            alt={item.title || activeCategory.alt}
                            className="object-cover"
                          />
                          {isAMG && (
                            <div className="absolute inset-0 bg-gradient-to-t from-amg-teal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--dur-element)] ease-[var(--ease-secondary)]" />
                          )}
                        </div>
                        {(item.title || item.description) && (
                          <div className={`py-2 sm:py-3 ${isAMG ? "px-3" : ""}`}>
                            {item.title && (
                              <h4
                                className={`text-base sm:text-lg font-light mb-1 sm:mb-2 ${
                                  isAMG ? "text-amg-teal" : "text-white"
                                }`}
                              >
                                {item.title}
                              </h4>
                            )}
                            {item.description && (
                              <RichText className="text-sm text-gray-200 font-light leading-relaxed">
                                {item.description}
                              </RichText>
                            )}
                          </div>
                        )}
                      </FocusCard>
                    </motion.div>
                  );
                })}
              </FocusCards>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
