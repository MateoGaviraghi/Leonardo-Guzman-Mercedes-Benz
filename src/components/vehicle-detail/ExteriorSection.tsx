"use client";

import { useRef, useState } from "react";
import type { Vehicle } from "@/data/vehicles";
import { buildAvailableTabs } from "./utils";
import { ImageCarousel } from "./ImageCarousel";
import { EquipmentCardGrid } from "./EquipmentCardGrid";
import { SlidingTabs } from "./SlidingTabs";
import { useMaskedLinesReveal } from "./useSectionReveal";

/* ═════════════════════════════════════════════════════════════
    EXTERIOR — sección con tabs internos (patrón MB Argentina).
    Tabs disponibles según los datos del vehículo:
      • Aspectos destacados   ← exterior_1..10
      • Variantes carrocería  ← equip_variantes_carroceria   (Sprinter)
      • Acceso y carga        ← equip_carga                  (Sprinter)
    Si solo hay 1 tab no mostramos la barra de navegación (UX más limpia).
    ════════════════════════════════════════════════════════════ */
export function ExteriorSection({
  vehicle,
  isAMG,
  basePath,
}: {
  vehicle: Vehicle;
  isAMG: boolean;
  basePath: string;
}) {
  // Inicializamos con el primer tab disponible para no arrancar apuntando
  // a un tab que el vehículo no tiene.
  const [activeExteriorTab, setActiveExteriorTab] = useState<string>(() => {
    const hasAspectos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].some(
      (n) =>
        vehicle[`exterior${n}Title` as keyof Vehicle] ||
        vehicle[`exterior${n}Description` as keyof Vehicle]
    );
    if (hasAspectos) return "aspectos";
    if (
      (vehicle.equipVariantesCarroceria as unknown as unknown[] | undefined)
        ?.length
    )
      return "variantes-carroceria";
    if ((vehicle.equipCarga as unknown as unknown[] | undefined)?.length)
      return "carga";
    return "aspectos";
  });
  const h2Ref = useRef<HTMLHeadingElement>(null);
  useMaskedLinesReveal(h2Ref);

  const aspectosItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    .map((num) => ({
      num,
      title: vehicle[`exterior${num}Title` as keyof Vehicle] as
        | string
        | undefined,
      description: vehicle[
        `exterior${num}Description` as keyof Vehicle
      ] as string | undefined,
    }))
    .filter((it) => it.title || it.description);
  const variantesCarroceria =
    (vehicle.equipVariantesCarroceria as
      | Array<{ title?: string; description?: string }>
      | undefined) ?? [];
  const accesoCarga =
    (vehicle.equipCarga as
      | Array<{ title?: string; description?: string }>
      | undefined) ?? [];

  const tabs = buildAvailableTabs([
    {
      id: "aspectos",
      label: "Aspectos destacados",
      available: aspectosItems.length > 0,
    },
    {
      id: "variantes-carroceria",
      label: "Variantes de la carrocería",
      available: variantesCarroceria.length > 0,
    },
    {
      id: "carga",
      label: "Acceso y carga",
      available: accesoCarga.length > 0,
    },
  ]);

  if (tabs.length === 0) return null;
  // Si el tab activo ya no existe (caso edge), caemos al primero disponible.
  const active = tabs.find((t) => t.id === activeExteriorTab)?.id ?? tabs[0].id;

  return (
    <section
      className={`py-24 md:py-32 relative ${
        isAMG
          ? "bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white"
          : "bg-white text-black"
      }`}
    >
      {isAMG && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amg-teal/40 to-transparent" />
      )}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h2
          ref={h2Ref}
          className={`text-h1 font-light mb-10 sm:mb-12 text-center ${
            isAMG ? "text-amg-teal" : ""
          }`}
        >
          Exterior
        </h2>

        {/* Tabs nav — bloque invertido deslizante, solo si hay más de un tab */}
        {tabs.length > 1 && (
          <div className="mb-10 sm:mb-14 md:mb-16">
            <SlidingTabs
              tabs={tabs}
              activeId={active}
              onChange={setActiveExteriorTab}
              scope="exterior"
              variant="papel"
              isAMG={isAMG}
            />
          </div>
        )}

        {/* Tab content */}
        <div className="min-h-[300px]">
          {active === "aspectos" && aspectosItems.length > 0 && (
            <ImageCarousel
              items={aspectosItems}
              basePath={basePath}
              type="exterior"
              isAMG={isAMG}
              variant="light"
            />
          )}
          {active === "variantes-carroceria" &&
            variantesCarroceria.length > 0 && (
              <EquipmentCardGrid
                items={variantesCarroceria}
                basePath={basePath}
                category="variantes-carroceria"
                variant="light"
                isAMG={isAMG}
              />
            )}
          {active === "carga" && accesoCarga.length > 0 && (
            <EquipmentCardGrid
              items={accesoCarga}
              basePath={basePath}
              category="carga"
              variant="light"
              isAMG={isAMG}
            />
          )}
        </div>
      </div>
    </section>
  );
}
