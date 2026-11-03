// Vehículos que existen en Supabase pero NO se muestran en el sitio público
// (catálogo, carrusel del home y página de detalle → 404). El admin los sigue
// viendo y editando: lee `/api/vehicles` sin este filtro.
//
// Existe porque la tabla `vehicles` no tiene columna de visibilidad. Se agregó
// el 2026-11-03 para publicar el rediseño sin esperar la carga de estos dos,
// que quedaron vacíos (sin datos ni fotos) desde el wipe del 2026-07-21.
// Para volver a mostrar uno: sacar su id de la lista y publicar.
export const HIDDEN_VEHICLE_IDS: readonly string[] = [
  "f05eb9e8-d811-4c3f-bdc8-c272747514b0", // CLE Coupé
  "e7a7cac6-5c3d-49cc-9d62-fae1d08eb720", // Clase A Hatchback
];

export function isPublicVehicle(id: string): boolean {
  return !HIDDEN_VEHICLE_IDS.includes(id);
}
