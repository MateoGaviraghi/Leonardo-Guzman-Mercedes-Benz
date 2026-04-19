import type { CardColumn, CardZone, ContactKind } from "@/types/crm";

// Labels en español — se usan tanto en UI como en historial legible.
export const COLUMN_LABELS: Record<CardColumn, string> = {
  contacto: "Contacto",
  llamada_visita: "Llamada / Visita",
  cotizar: "Cotizar",
  seguimiento: "Seguimiento",
  agenda: "Agenda",
  ventas: "Ventas",
};

export const ZONE_LABELS: Record<CardZone, string> = {
  pizarron: "Pizarrón",
  agenda: "Agenda",
  ventas: "Ventas",
};

export const CONTACT_KIND_LABELS: Record<ContactKind, string> = {
  llamada: "Llamada",
  visita: "Visita",
};

// Colores semánticos por columna (bordes, chips, headers).
// Verde = éxito / Rojo = alerta / Amarillo = atención / Azul = acción.
export const COLUMN_COLORS: Record<
  CardColumn,
  { bg: string; border: string; text: string; accent: string }
> = {
  contacto: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-900",
    accent: "bg-blue-600",
  },
  llamada_visita: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-900",
    accent: "bg-indigo-600",
  },
  cotizar: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    accent: "bg-amber-600",
  },
  seguimiento: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-900",
    accent: "bg-orange-600",
  },
  agenda: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-900",
    accent: "bg-slate-600",
  },
  ventas: {
    bg: "bg-emerald-100",
    border: "border-emerald-300",
    text: "text-emerald-900",
    accent: "bg-emerald-700",
  },
};

// Orden de avance dentro del pizarrón.
export const NEXT_COLUMN: Partial<Record<CardColumn, CardColumn>> = {
  contacto: "llamada_visita",
  llamada_visita: "cotizar",
  cotizar: "seguimiento",
};

export const OVERDUE_DAYS = 0;
