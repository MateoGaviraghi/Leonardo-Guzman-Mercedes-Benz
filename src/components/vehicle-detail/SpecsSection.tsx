"use client";

import { useRef, useState } from "react";
import type { Vehicle } from "@/data/vehicles";
import { AccordionItem } from "./AccordionItem";
import { useMaskedLinesReveal } from "./useSectionReveal";

export function SpecsSection({
  vehicle,
  isAMG,
  categories,
  title = "Especificaciones Técnicas",
}: {
  vehicle: Vehicle;
  isAMG: boolean;
  categories?: { title: string; specs: { label: string; valor: string }[] }[];
  title?: string;
}) {
  const [openSpecIndex, setOpenSpecIndex] = useState<number | null>(0);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  useMaskedLinesReveal(h2Ref);

  const cats = categories ?? null; // null → rama autos existente (VERBATIM)

  if (cats && cats.length === 0) return null;

  if (
    cats === null &&
    !(
      (vehicle.specsConsumo && vehicle.specsConsumo.length > 0) ||
      (vehicle.specsMotorizacion && vehicle.specsMotorizacion.length > 0) ||
      (vehicle.specsPotencia && vehicle.specsPotencia.length > 0) ||
      (vehicle.specsDimensiones && vehicle.specsDimensiones.length > 0) ||
      (vehicle.specsPerformance && vehicle.specsPerformance.length > 0) ||
      (vehicle.specsCarroceria && vehicle.specsCarroceria.length > 0) ||
      (vehicle.specsChasis && vehicle.specsChasis.length > 0) ||
      (vehicle.specsCantidades && vehicle.specsCantidades.length > 0) ||
      (vehicle.specsBateriaCarga && vehicle.specsBateriaCarga.length > 0)
    )
  ) {
    return null;
  }

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
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Col izq (4): titulo alineado izq, STICKY en desktop */}
          <div className="lg:col-span-4">
            <h2
              ref={h2Ref}
              data-chrome
              className={`text-h2 font-light text-left lg:sticky lg:top-24 ${
                isAMG ? "text-amg-teal" : ""
              }`}
            >
              {title}
            </h2>
          </div>

          {/* Col der (8): las 9 categorias (orden/condicionales INTACTOS) */}
          <div
            className={`lg:col-span-8 border-t ${
              isAMG ? "border-amg-teal/30" : "border-gray-200"
            }`}
          >
            {cats ? (
              cats.map((c, i) => (
                <AccordionItem
                  key={c.title}
                  title={c.title}
                  specs={c.specs}
                  index={i}
                  isOpen={openSpecIndex === i}
                  onToggle={() =>
                    setOpenSpecIndex(openSpecIndex === i ? null : i)
                  }
                  isAMG={isAMG}
                  anyOpen={openSpecIndex !== null}
                />
              ))
            ) : (
              <>
            {vehicle.specsConsumo && vehicle.specsConsumo.length > 0 && (
              <AccordionItem
                title="Consumo y emisión"
                specs={vehicle.specsConsumo}
                index={0}
                isOpen={openSpecIndex === 0}
                onToggle={() =>
                  setOpenSpecIndex(openSpecIndex === 0 ? null : 0)
                }
                isAMG={isAMG}
                anyOpen={openSpecIndex !== null}
              />
            )}

            {vehicle.specsMotorizacion &&
              vehicle.specsMotorizacion.length > 0 && (
                <AccordionItem
                  title="Motorización"
                  specs={vehicle.specsMotorizacion}
                  index={1}
                  isOpen={openSpecIndex === 1}
                  onToggle={() =>
                    setOpenSpecIndex(openSpecIndex === 1 ? null : 1)
                  }
                  isAMG={isAMG}
                  anyOpen={openSpecIndex !== null}
                />
              )}

            {vehicle.specsPotencia && vehicle.specsPotencia.length > 0 && (
              <AccordionItem
                title="Potencia y autonomía"
                specs={vehicle.specsPotencia}
                index={2}
                isOpen={openSpecIndex === 2}
                onToggle={() =>
                  setOpenSpecIndex(openSpecIndex === 2 ? null : 2)
                }
                isAMG={isAMG}
                anyOpen={openSpecIndex !== null}
              />
            )}

            {vehicle.specsDimensiones &&
              vehicle.specsDimensiones.length > 0 && (
                <AccordionItem
                  title="Dimensiones"
                  specs={vehicle.specsDimensiones}
                  index={3}
                  isOpen={openSpecIndex === 3}
                  onToggle={() =>
                    setOpenSpecIndex(openSpecIndex === 3 ? null : 3)
                  }
                  isAMG={isAMG}
                  anyOpen={openSpecIndex !== null}
                />
              )}

            {vehicle.specsPerformance &&
              vehicle.specsPerformance.length > 0 && (
                <AccordionItem
                  title="Performance"
                  specs={vehicle.specsPerformance}
                  index={4}
                  isOpen={openSpecIndex === 4}
                  onToggle={() =>
                    setOpenSpecIndex(openSpecIndex === 4 ? null : 4)
                  }
                  isAMG={isAMG}
                  anyOpen={openSpecIndex !== null}
                />
              )}

            {vehicle.specsCarroceria &&
              vehicle.specsCarroceria.length > 0 && (
                <AccordionItem
                  title="Carrocería"
                  specs={vehicle.specsCarroceria}
                  index={5}
                  isOpen={openSpecIndex === 5}
                  onToggle={() =>
                    setOpenSpecIndex(openSpecIndex === 5 ? null : 5)
                  }
                  isAMG={isAMG}
                  anyOpen={openSpecIndex !== null}
                />
              )}

            {vehicle.specsChasis && vehicle.specsChasis.length > 0 && (
              <AccordionItem
                title="Chasis"
                specs={vehicle.specsChasis}
                index={6}
                isOpen={openSpecIndex === 6}
                onToggle={() =>
                  setOpenSpecIndex(openSpecIndex === 6 ? null : 6)
                }
                isAMG={isAMG}
                anyOpen={openSpecIndex !== null}
              />
            )}

            {vehicle.specsCantidades &&
              vehicle.specsCantidades.length > 0 && (
                <AccordionItem
                  title="Cantidades dimensiones y pesos"
                  specs={vehicle.specsCantidades}
                  index={7}
                  isOpen={openSpecIndex === 7}
                  onToggle={() =>
                    setOpenSpecIndex(openSpecIndex === 7 ? null : 7)
                  }
                  isAMG={isAMG}
                  anyOpen={openSpecIndex !== null}
                />
              )}

            {vehicle.specsBateriaCarga &&
              vehicle.specsBateriaCarga.length > 0 && (
                <AccordionItem
                  title="Batería y carga"
                  specs={vehicle.specsBateriaCarga}
                  index={8}
                  isOpen={openSpecIndex === 8}
                  onToggle={() =>
                    setOpenSpecIndex(openSpecIndex === 8 ? null : 8)
                  }
                  isAMG={isAMG}
                  anyOpen={openSpecIndex !== null}
                />
              )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
