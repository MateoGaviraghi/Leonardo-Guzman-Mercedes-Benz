"use client";

import { useEffect } from "react";
import type { Vehicle } from "@/data/vehicles";
import { BackButton } from "@/components/vehicle-detail/BackButton";
import { HeroSection } from "@/components/vehicle-detail/HeroSection";
import { AspectosSection } from "@/components/vehicle-detail/AspectosSection";
import { ExteriorSection } from "@/components/vehicle-detail/ExteriorSection";
import { InteriorSection } from "@/components/vehicle-detail/InteriorSection";
import { ColorsSection } from "@/components/vehicle-detail/ColorsSection";
import { EquipmentSection } from "@/components/vehicle-detail/EquipmentSection";
import { SpecsSection } from "@/components/vehicle-detail/SpecsSection";
import { AutonomySection } from "@/components/vehicle-detail/AutonomySection";
import { CtaSection } from "@/components/vehicle-detail/CtaSection";
import { BackToTop } from "@/components/vehicle-detail/BackToTop";

export default function VehicleDetailClient({
  vehicle: initialVehicle,
  hasColorImages = false,
}: {
  vehicle: Vehicle;
  /** Server detectó si hay archivos `1.<formato>` en /public/vehicles/<id>/colors/.
   *  Si es false, ocultamos la sección "Colores Disponibles" en lugar de mostrar
   *  un carrusel vacío. */
  hasColorImages?: boolean;
}) {
  const vehicleId = initialVehicle.id;
  const vehicle = initialVehicle;
  const basePath = `/vehicles/${vehicleId}`;

  // Detectar si es un vehículo AMG
  const isAMG = vehicle.is_amg || false;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const supportsScrollRestoration = "scrollRestoration" in window.history;
    const prev = supportsScrollRestoration
      ? window.history.scrollRestoration
      : undefined;
    if (supportsScrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    return () => {
      if (supportsScrollRestoration && prev) {
        window.history.scrollRestoration = prev;
      }
    };
  }, []);

  return (
    <div className={`min-h-screen ${isAMG ? "bg-neutral-950" : "bg-black"}`}>
      <BackButton />
      <HeroSection vehicle={vehicle} isAMG={isAMG} basePath={basePath} />
      <AspectosSection vehicle={vehicle} isAMG={isAMG} />
      <ExteriorSection vehicle={vehicle} isAMG={isAMG} basePath={basePath} />
      <InteriorSection vehicle={vehicle} isAMG={isAMG} basePath={basePath} />
      {hasColorImages && (
        <ColorsSection vehicleId={vehicleId} isAMG={isAMG} />
      )}
      <EquipmentSection vehicle={vehicle} isAMG={isAMG} basePath={basePath} />
      <SpecsSection vehicle={vehicle} isAMG={isAMG} />
      <AutonomySection vehicle={vehicle} isAMG={isAMG} basePath={basePath} />
      <CtaSection isAMG={isAMG} />
      <BackToTop isAMG={isAMG} />
    </div>
  );
}
