import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy de Next.js 16 (ex-middleware).
 * Se encarga de:
 *   - Admin de vehículos APAGADO (D-047, 2026-11-09): /admin y /vehicles/vista-previa
 *     mandan al inicio; /api/vehicles no acepta escrituras y /api/admin no responde.
 *     Los autos se cargan desde carga/ (cargar.js con la clave de servicio).
 *     Las páginas siguen en el código: para volver a prenderlo, sacar este bloque.
 *   - Redirigir /crm al login si no hay sesión
 *   - Bloquear /api/crm sin sesión
 *   - Dejar pasar /api/crm/cron/reschedule (se valida con CRON_SECRET en el endpoint)
 */
export async function proxy(request: NextRequest) {
  const ruta = request.nextUrl.pathname;

  // ---- ADMIN DE VEHÍCULOS APAGADO (D-047) ----
  if (ruta.startsWith("/admin") || ruta.startsWith("/vehicles/vista-previa")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (ruta.startsWith("/api/admin")) {
    return NextResponse.json({ success: false, error: "No disponible" }, { status: 404 });
  }
  if (ruta.startsWith("/api/vehicles") && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return NextResponse.json(
      { success: false, error: "La carga de vehículos desde la web está apagada" },
      { status: 405 }
    );
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isCrmRoute = pathname.startsWith("/crm");
  const isCrmLogin = pathname === "/crm/login";

  // ---- CRM (sección separada de /admin) ----
  if (isCrmRoute && !isCrmLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/crm/login";
    return NextResponse.redirect(url);
  }
  if (isCrmLogin && user) {
    // /crm resuelve server-side a /crm/[primera-zona-activa]/pizarron.
    const url = request.nextUrl.clone();
    url.pathname = "/crm";
    return NextResponse.redirect(url);
  }

  // ---- API: /api/crm (todo protegido) ----
  // Excepción: /api/crm/cron/reschedule se valida con CRON_SECRET (no con sesión),
  // para que Vercel Cron pueda gatillarlo. El resto (incluyendo /cron/status)
  // requiere sesión autenticada normal.
  if (
    pathname.startsWith("/api/crm") &&
    pathname !== "/api/crm/cron/reschedule"
  ) {
    if (!user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/vehicles/vista-previa/:path*",
    "/crm/:path*",
    "/api/vehicles/:path*",
    "/api/admin/:path*",
    "/api/crm/:path*",
  ],
};
