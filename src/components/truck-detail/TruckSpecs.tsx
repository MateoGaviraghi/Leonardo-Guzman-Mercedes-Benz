import type { Vehicle } from "@/data/vehicles";
import { SpecsSection } from "@/components/vehicle-detail/SpecsSection";

/* ═══════════════════════════════════════════════
   TRUCK SPECS — wrapper de SpecsSection (acordeón editorial 2 col)
   ORDEN y TÍTULOS EXACTOS del template truck actual — NO reordenar.
   ═══════════════════════════════════════════════ */
const TRUCK_SPEC_KEYS: { key: string; label: string }[] = [
  { key: "specsMotorizacion", label: "Motorización" },
  { key: "specsPotencia", label: "Potencia" },
  { key: "specsDimensiones", label: "Dimensiones" },
  { key: "specsCantidades", label: "Cantidades y pesos" },
  { key: "specsPerformance", label: "Performance" },
  { key: "specsCarroceria", label: "Carrocería" },
  { key: "specsChasis", label: "Chasis" },
  { key: "specsConsumo", label: "Consumo y emisión" },
];

export function TruckSpecs({ vehicle }: { vehicle: Vehicle }) {
  const categories = TRUCK_SPEC_KEYS.map(({ key, label }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr = (vehicle as any)[key] as { label: string; valor: string }[] | undefined;
    return Array.isArray(arr) && arr.length > 0 ? { title: label, specs: arr } : null;
  }).filter(
    (c): c is { title: string; specs: { label: string; valor: string }[] } => c !== null
  );

  if (categories.length === 0) return null;

  return (
    <SpecsSection
      vehicle={vehicle}
      isAMG={false}
      categories={categories}
      title="Especificaciones"
    />
  );
}
