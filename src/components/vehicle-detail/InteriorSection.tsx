"use client";

import { useRef, useState } from "react";
import type { Vehicle } from "@/data/vehicles";
import { buildAvailableTabs } from "./utils";
import { ImageCarousel } from "./ImageCarousel";
import { EquipmentCardGrid } from "./EquipmentCardGrid";
import { SlidingTabs } from "./SlidingTabs";
import { useMaskedLinesReveal } from "./useSectionReveal";

/* ═════════════════════════════════════════════════════════════
    INTERIOR — sección con tabs internos (patrón MB Argentina).
    Tabs disponibles según los datos del vehículo:
      • Aspectos destacados        ← interior_1..10
      • Variantes del compartimento ← equip_variantes_compartimento
      • Equipamiento compartimento  ← equip_equipamiento_compartimento
      • Puesto de conducción        ← equip_puesto_conduccion
    ════════════════════════════════════════════════════════════ */
export function InteriorSection({
  vehicle,
  isAMG,
  basePath,
}: {
  vehicle: Vehicle;
  isAMG: boolean;
  basePath: string;
}) {
  const [activeInteriorTab, setActiveInteriorTab] = useState<string>(() => {
    const hasAspectos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].some(
      (n) =>
        vehicle[`interior${n}Title` as keyof Vehicle] ||
        vehicle[`interior${n}Description` as keyof Vehicle]
    );
    if (hasAspectos) return "aspectos";
    if (
      (vehicle.equipVariantesCompartimento as unknown as unknown[] | undefined)
        ?.length
    )
      return "variantes-compartimento";
    if (
      (vehicle.equipEquipamientoCompartimento as unknown as unknown[] | undefined)
        ?.length
    )
      return "equipamiento-compartimento";
    if (
      (vehicle.equipPuestoConduccion as unknown as unknown[] | undefined)?.length
    )
      return "puesto-conduccion";
    return "aspectos";
  });
  const h2Ref = useRef<HTMLHeadingElement>(null);
  useMaskedLinesReveal(h2Ref);

  const aspectosItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    .map((num) => ({
      num,
      title: vehicle[`interior${num}Title` as keyof Vehicle] as
        | string
        | undefined,
      description: vehicle[
        `interior${num}Description` as keyof Vehicle
      ] as string | undefined,
    }))
    .filter((it) => it.title || it.description);
  const variantesCompartimento =
    (vehicle.equipVariantesCompartimento as
      | Array<{ title?: string; description?: string }>
      | undefined) ?? [];
  const equipamientoCompartimento =
    (vehicle.equipEquipamientoCompartimento as
      | Array<{ title?: string; description?: string }>
      | undefined) ?? [];
  const puestoConduccion =
    (vehicle.equipPuestoConduccion as
      | Array<{ title?: string; description?: string }>
      | undefined) ?? [];

  const tabs = buildAvailableTabs([
    {
      id: "aspectos",
      label: "Aspectos destacados",
      available: aspectosItems.length > 0,
    },
    {
      id: "variantes-compartimento",
      label: "Variantes del compartimento",
      available: variantesCompartimento.length > 0,
    },
    {
      id: "equipamiento-compartimento",
      label: "Compartimento de pasajeros",
      available: equipamientoCompartimento.length > 0,
    },
    {
      id: "puesto-conduccion",
      label: "Puesto de conducción",
      available: puestoConduccion.length > 0,
    },
  ]);

  if (tabs.length === 0) return null;
  const active = tabs.find((t) => t.id === activeInteriorTab)?.id ?? tabs[0].id;

  return (
    <section
      className={`py-24 md:py-32 text-white relative ${
        isAMG
          ? "bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950"
          : "bg-black"
      }`}
    >
      {isAMG && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amg-teal/30 to-transparent" />
      )}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h2
          ref={h2Ref}
          className={`text-h1 font-light mb-10 sm:mb-12 text-center ${
            isAMG ? "text-amg-teal" : ""
          }`}
        >
          Interior
        </h2>

        {/* Tabs nav — bloque invertido deslizante, solo si hay más de un tab */}
        {tabs.length > 1 && (
          <div className="mb-10 sm:mb-14 md:mb-16">
            <SlidingTabs
              tabs={tabs}
              activeId={active}
              onChange={setActiveInteriorTab}
              scope="interior"
              variant="dark"
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
              type="interior"
              isAMG={isAMG}
              variant="dark"
            />
          )}
          {active === "variantes-compartimento" &&
            variantesCompartimento.length > 0 && (
              <EquipmentCardGrid
                items={variantesCompartimento}
                basePath={basePath}
                category="variantes-compartimento"
                variant="dark"
                isAMG={isAMG}
              />
            )}
          {active === "equipamiento-compartimento" &&
            equipamientoCompartimento.length > 0 && (
              <EquipmentCardGrid
                items={equipamientoCompartimento}
                basePath={basePath}
                category="equipamiento-compartimento"
                variant="dark"
                isAMG={isAMG}
              />
            )}
          {active === "puesto-conduccion" && puestoConduccion.length > 0 && (
            <EquipmentCardGrid
              items={puestoConduccion}
              basePath={basePath}
              category="puesto-conduccion"
              variant="dark"
              isAMG={isAMG}
            />
          )}
        </div>
      </div>
    </section>
  );
}
