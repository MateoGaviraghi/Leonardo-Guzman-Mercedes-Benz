"use client";

import type { Vehicle } from "@/data/vehicles";
import { AspectosSection } from "@/components/vehicle-detail/AspectosSection";

/* ═══════════════════════════════════════════════
   TRUCK LEDGER — reuso del Data Ledger aprobado (§T·4.2).
   Muere el ribbon con borders: AspectosSection compone
   prefix (prosa) → valor héroe tabular-nums en una línea (fit) →
   label eyebrow, sin cajas, reveal clip vertical por columna.
   Trucks usan los MISMOS campos `aspecto{N}Valor/Label` → cero
   adaptación de datos. Nunca AMG → isAMG={false}.
   ═══════════════════════════════════════════════ */
export function TruckLedger({ vehicle }: { vehicle: Vehicle }) {
  return <AspectosSection vehicle={vehicle} isAMG={false} />;
}
