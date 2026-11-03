"use client";

import type { Vehicle } from "@/data/vehicles";
import { HeroSection } from "@/components/vehicle-detail/HeroSection";

/* ═══════════════════════════════════════════════
   TRUCK HERO — reuso del HeroSection canónico aprobado
   (SplitText chars en h1 · Ken Burns 1.08→1 · scrim en capas ·
    parallax scrub · secuencia HERO_DELAY · empty-state silver).
   Paths FLAT de trucks vía `heroImageBase` (§T·2.1 / §T·4.1).
   El mobile "negro pelado" del before se resuelve solo: sin
   `hero-mobile` en disco → MultiFormatImage null → queda visible
   el gradiente silver del <section> (empty-state canónico).

   Los CTAs del hero viejo ("Contactame"/"Ver modelos") DESAPARECEN
   del hero (§T·4.1): el hero aprobado no los tiene y el modal PDF se
   abre desde TruckCta. `pdfs`/`onOpenModels` se aceptan sólo por
   compatibilidad con el orquestador FROZEN (WU-T0) — no se renderizan.
   ═══════════════════════════════════════════════ */
export function TruckHero({
  vehicle,
  basePath,
}: {
  vehicle: Vehicle;
  basePath: string;
  pdfs?: NonNullable<Vehicle["truckPdfs"]>;
  onOpenModels?: () => void;
}) {
  return (
    <HeroSection
      vehicle={vehicle}
      isAMG={false}
      basePath={basePath}
      heroImageBase={{
        desktop: `${basePath}/hero`,
        mobile: `${basePath}/hero-mobile`,
      }}
    />
  );
}
