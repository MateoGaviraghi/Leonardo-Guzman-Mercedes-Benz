import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { timingSafeEqual } from "node:crypto";
import type { Database } from "@/types/supabase";
import { runDailyReschedule } from "@/lib/crm/date-logic";

/**
 * Endpoint invocado por Vercel Cron diariamente a las 00:00 ART (03:00 UTC).
 * Configurado en vercel.json · "0 3 * * *".
 *
 * Auth:
 *   - Vercel agrega `Authorization: Bearer ${CRON_SECRET}` si CRON_SECRET existe
 *     como env var del proyecto. Validamos con comparación timing-safe.
 *   - Toda la ejecución sucede dentro de una función SQL SECURITY DEFINER
 *     (crm_run_daily_reschedule), así que NO necesitamos SUPABASE_SERVICE_ROLE_KEY
 *     — basta con la anon key.
 *
 * Acepta GET (default de Vercel Cron) y POST (para poder gatillarlo manualmente
 * con curl + body si hace falta debug en producción).
 */

export const dynamic = "force-dynamic";

async function handle(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    console.error("[cron/reschedule] CRON_SECRET env var is not set");
    return NextResponse.json(
      { success: false, error: "Servidor no configurado (CRON_SECRET)" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const provided = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : "";

  if (!safeEqual(provided, expected)) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  // Cliente Supabase stateless (sin cookies). La función SQL que llamamos es
  // SECURITY DEFINER con GRANT EXECUTE a anon/authenticated, así que esto alcanza.
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          /* no-op */
        },
      },
    }
  );

  const startedAt = Date.now();
  try {
    const result = await runDailyReschedule(supabase, "cron");
    const durationMs = Date.now() - startedAt;

    // Log estructurado: aparece en los Function Logs de Vercel
    console.log(
      JSON.stringify({
        event: "crm.cron.reschedule.ok",
        moved_count: result.movedCount,
        checked_date: result.checkedDate,
        duration_ms: durationMs,
      })
    );

    return NextResponse.json({ success: true, ...result, durationMs });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    console.error(
      JSON.stringify({
        event: "crm.cron.reschedule.error",
        error: message,
        duration_ms: Date.now() - startedAt,
      })
    );
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export const GET = handle;
export const POST = handle;

// ---------------------------------------------------------------------------

/**
 * Comparación constant-time para evitar timing attacks sobre el secret.
 * Devuelve false si los strings tienen distinta longitud (sin leak temporal).
 */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) {
    // timingSafeEqual crashea con distinto length — comparamos dummy para
    // mantener tiempo parejo igual.
    const dummy = Buffer.alloc(bb.length);
    try {
      timingSafeEqual(dummy, bb);
    } catch {
      /* no-op */
    }
    return false;
  }
  return timingSafeEqual(ab, bb);
}
