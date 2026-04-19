import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Lógica de movimiento automático por fecha.
 * -----------------------------------------------------------------------------
 * El cálculo REAL lo hace la función SQL `public.crm_run_daily_reschedule(TEXT)`
 * (SECURITY DEFINER, definida en sql-updates/004_reschedule_log_and_function.sql).
 * Esta función PostgreSQL:
 *   - calcula `hoy` usando `NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires'`
 *     (más confiable que hacerlo en JS — una única fuente de verdad)
 *   - mueve cards de `agenda` a `pizarron/contacto` si `next_contact_at <= hoy`
 *   - escribe historial con descripción legible
 *   - escribe un registro en `crm_reschedule_log` (observabilidad)
 *   - es idempotente: correrla 10 veces el mismo día sólo mueve cards una vez
 *
 * Se invoca en dos momentos:
 *   1. CRON DIARIO 00:00 ART — Vercel Cron (vercel.json) → p_source='cron'
 *   2. SAFETY-NET al cargar el layout del CRM → p_source='safety_net'
 *      (red de seguridad si el cron falló o aún no corrió)
 * -----------------------------------------------------------------------------
 */

type Supabase = SupabaseClient<Database>;

export type RescheduleResult = {
  movedCount: number;
  checkedDate: string;
  source: "cron" | "safety_net" | "manual";
};

export type RescheduleSource = "cron" | "safety_net" | "manual";

/**
 * Dispara la función SQL. Devuelve el resumen de la corrida.
 * Lanza Error si la RPC falla — el caller decide si loguea o propaga.
 */
export async function runDailyReschedule(
  supabase: Supabase,
  source: RescheduleSource = "manual"
): Promise<RescheduleResult> {
  const { data, error } = await supabase.rpc("crm_run_daily_reschedule", {
    p_source: source,
  } as never);

  if (error) throw error;

  const payload = (data ?? {}) as {
    moved_count?: number;
    checked_date?: string;
    source?: RescheduleSource;
  };

  return {
    movedCount: payload.moved_count ?? 0,
    checkedDate: payload.checked_date ?? todayIsoDate(),
    source: payload.source ?? source,
  };
}

// ---------------------------------------------------------------------------
// Helpers de UI (siguen viviendo en JS, no tocan la base de datos)
// ---------------------------------------------------------------------------

/**
 * Fecha de hoy en hora Argentina (UTC-3, sin DST) en formato YYYY-MM-DD.
 * Usa Intl.DateTimeFormat (en lugar de restar 3h manualmente) para ser
 * robusto ante cualquier zona horaria del servidor.
 */
export function todayIsoDate(): string {
  // 'en-CA' produce el formato ISO YYYY-MM-DD.
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export function isOverdue(nextContactAt: string | null): boolean {
  if (!nextContactAt) return false;
  return nextContactAt < todayIsoDate();
}

export function daysOverdue(nextContactAt: string | null): number {
  if (!nextContactAt) return 0;
  const today = new Date(todayIsoDate());
  const next = new Date(nextContactAt);
  const diffMs = today.getTime() - next.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Diferencia en días entre un ISO date (YYYY-MM-DD) y hoy.
 * Positivo = en el futuro. Negativo = en el pasado.
 */
export function daysFromToday(iso: string | null): number | null {
  if (!iso) return null;
  const today = new Date(todayIsoDate());
  const target = new Date(iso);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Etiqueta relativa humana. Ej: "Hoy", "Mañana", "En 3 días", "Hace 2 días".
 * Usada en Agenda (próximo contacto) y Ventas (fecha de venta).
 */
export function relativeDateLabel(iso: string | null): string {
  const d = daysFromToday(iso);
  if (d === null) return "Sin fecha";
  if (d === 0) return "Hoy";
  if (d === 1) return "Mañana";
  if (d === -1) return "Ayer";
  if (d > 1) return `En ${d} días`;
  return `Hace ${-d} ${-d === 1 ? "día" : "días"}`;
}

/**
 * Categoría de urgencia para agrupar en la vista Agenda.
 */
export type AgendaBucket =
  | "overdue_or_today"
  | "this_week"
  | "this_month"
  | "later"
  | "no_date";

export function agendaBucket(nextContactAt: string | null): AgendaBucket {
  const d = daysFromToday(nextContactAt);
  if (d === null) return "no_date";
  if (d <= 0) return "overdue_or_today";
  if (d <= 7) return "this_week";
  if (d <= 30) return "this_month";
  return "later";
}

/**
 * Categoría temporal para agrupar en la vista Ventas (sold_at).
 */
export type VentasBucket = "this_month" | "last_month" | "older" | "no_date";

export function ventasBucket(soldAt: string | null): VentasBucket {
  const d = daysFromToday(soldAt);
  if (d === null) return "no_date";
  if (d >= -30) return "this_month";
  if (d >= -60) return "last_month";
  return "older";
}

/**
 * Timestamp relativo para el historial: "justo ahora", "hace 5 min",
 * "hace 2 h", "Ayer · 14:30", "DD/MM/YYYY · HH:MM".
 * Recibe un ISO con fecha+hora (ej: created_at de la DB).
 */
export function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);

  if (diffSec < 45) return "justo ahora";
  if (diffMin < 60) return `hace ${diffMin} ${diffMin === 1 ? "minuto" : "minutos"}`;
  if (diffHr < 24) return `hace ${diffHr} ${diffHr === 1 ? "hora" : "horas"}`;

  // A partir de ayer mostramos hora también
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const dayDiff = Math.floor(diffHr / 24);
  if (dayDiff === 1) return `Ayer · ${hh}:${mm}`;
  if (dayDiff < 7) return `Hace ${dayDiff} días · ${hh}:${mm}`;

  const dd = String(d.getDate()).padStart(2, "0");
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mo}/${yyyy} · ${hh}:${mm}`;
}

/**
 * Clave de agrupación por día calendario. Normalizada a ART.
 * Retorna "today", "yesterday" o un ISO YYYY-MM-DD para días más viejos.
 */
export function historyDayKey(iso: string): "today" | "yesterday" | string {
  const today = todayIsoDate();
  // Fecha local ART del timestamp
  const local = new Date(iso).toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  });
  if (local === today) return "today";
  const yDate = new Date(today);
  yDate.setDate(yDate.getDate() - 1);
  const yesterday = yDate.toISOString().slice(0, 10);
  if (local === yesterday) return "yesterday";
  return local;
}

export function historyDayLabel(key: string): string {
  if (key === "today") return "Hoy";
  if (key === "yesterday") return "Ayer";
  const [y, m, d] = key.split("-");
  return `${d}/${m}/${y}`;
}
