"use client";

import { useState } from "react";
import type { Vehicle } from "@/data/vehicles";
import { BackButton } from "@/components/vehicle-detail/BackButton";
import { TruckHero } from "@/components/truck-detail/TruckHero";
import { TruckLedger } from "@/components/truck-detail/TruckLedger";
import { TruckIntro } from "@/components/truck-detail/TruckIntro";
import { TruckSections } from "@/components/truck-detail/TruckSections";
import { TruckSpecs } from "@/components/truck-detail/TruckSpecs";
import { TruckPdfModal } from "@/components/truck-detail/TruckPdfModal";
import { TruckCta } from "@/components/truck-detail/TruckCta";

/* ═══════════════════════════════════════════════
   MAIN COMPONENT — orquestador delgado (WU-T0)
   ═══════════════════════════════════════════════ */
export default function TruckDetailClient({
  vehicle,
}: {
  vehicle: Vehicle;
}) {
  const basePath = `/vehicles/${vehicle.id}`;
  const pdfs = vehicle.truckPdfs || [];
  const [modelsOpen, setModelsOpen] = useState(false);
  const openModels = () => setModelsOpen(true);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      <BackButton fadeOnScroll />
      <TruckPdfModal pdfs={pdfs} isOpen={modelsOpen} onClose={() => setModelsOpen(false)} />

      <TruckHero vehicle={vehicle} basePath={basePath} pdfs={pdfs} onOpenModels={openModels} />
      <TruckLedger vehicle={vehicle} />
      <TruckIntro vehicle={vehicle} />
      <TruckSections vehicle={vehicle} basePath={basePath} />
      <TruckSpecs vehicle={vehicle} />
      <TruckCta vehicle={vehicle} basePath={basePath} pdfs={pdfs} onOpenModels={openModels} />
    </div>
  );
}
