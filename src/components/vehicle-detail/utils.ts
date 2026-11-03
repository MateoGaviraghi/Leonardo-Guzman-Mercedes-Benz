import type { AvailableTab } from "./types";

// Helper para calcular qué tabs están disponibles en una sección (Exterior/Interior).
// Devuelve solo los tabs que tienen contenido — así no renderizamos botones vacíos.
// Movido verbatim desde VehicleDetailClient.tsx (WU0).
export function buildAvailableTabs<
  T extends { id: string; label: string; available: boolean }
>(defs: T[]): AvailableTab[] {
  return defs.filter((t) => t.available).map(({ id, label }) => ({ id, label }));
}

// Primer grupo numérico contiguo de un string (mismo patrón que NumberTicker.tsx).
// Utilidad pura para casos que necesiten parsear el valor sin montar el componente.
const NUM = /(\d[\d.,]*)/;

export function parseTickerValue(
  value: string
): { raw: string; target: number; decimals: number } | null {
  const m = value.match(NUM);
  if (!m) return null;
  const raw = m[1];
  const target = Number(raw.replace(/\./g, "").replace(",", "."));
  const decimals = (raw.split(/[.,]/)[1] || "").length;
  return { raw, target, decimals };
}
