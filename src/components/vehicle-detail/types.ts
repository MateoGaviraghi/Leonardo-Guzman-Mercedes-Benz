// Tipos compartidos entre las secciones de src/components/vehicle-detail/.
// WU0 los fija; WU1-4 los consumen read-only (no romper la forma).

/** Item genérico título+descripción, usado por EquipmentCardGrid y galerías. */
export interface TitledItem {
  title?: string;
  description?: string;
}

/** Item de carrusel de imágenes (Exterior/Interior aspectos): numerado 1..N. */
export interface CarouselItem {
  num: number;
  title?: string;
  description?: string;
}

/** Spec label/valor de una categoría del acordeón de Especificaciones Técnicas. */
export interface SpecRow {
  label: string;
  valor: string;
}

/** Definición de tab disponible (post-filtrado por `buildAvailableTabs`). */
export interface AvailableTab {
  id: string;
  label: string;
}
