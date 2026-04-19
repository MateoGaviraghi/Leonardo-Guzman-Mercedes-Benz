import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/crm/cron/status
 * Devuelve las últimas 20 corridas del reschedule (cron + safety-net + manual).
 * Protegido por el middleware: requiere sesión autenticada.
 *
 * Útil para:
 *   - debugging ("¿corrió el cron hoy?")
 *   - dashboard de admin
 *   - postmortems ("¿cuántas cards se movieron la semana pasada?")
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServer();

  try {
    const { data, error } = await supabase
      .from("crm_reschedule_log")
      .select("ran_at, source, checked_date, moved_count, error_message")
      .order("ran_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    const runs = (data ?? []) as Array<{
      ran_at: string;
      source: "cron" | "safety_net" | "manual";
      checked_date: string;
      moved_count: number;
      error_message: string | null;
    }>;

    // Resumen: última corrida por fuente + totales
    const lastCron = runs.find((r) => r.source === "cron");
    const lastSafetyNet = runs.find((r) => r.source === "safety_net");
    const totalMovedLast7Days = runs
      .filter((r) => {
        const ms = new Date(r.ran_at).getTime();
        return Date.now() - ms < 7 * 24 * 60 * 60 * 1000;
      })
      .reduce((sum, r) => sum + r.moved_count, 0);

    return NextResponse.json({
      success: true,
      summary: {
        last_cron_run: lastCron ?? null,
        last_safety_net_run: lastSafetyNet ?? null,
        total_moved_last_7_days: totalMovedLast7Days,
      },
      recent_runs: runs,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
