import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy de Next.js 16 (ex-middleware).
 * Se encarga de:
 *   - Redirigir rutas de /admin y /crm al login si no hay sesión
 *   - Bloquear /api/vehicles (escritura) y /api/crm sin sesión
 *   - Dejar pasar /api/crm/cron/reschedule (se valida con CRON_SECRET en el endpoint)
 */
export async function proxy(request: NextRequest) {
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

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  const isCrmRoute = pathname.startsWith("/crm");
  const isCrmLogin = pathname === "/crm/login";

  // ---- ADMIN (panel de vehículos) ----
  if (isAdminRoute && !isAdminLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  if (isAdminLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

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

  // ---- API: /api/vehicles (escritura autenticada) ----
  if (pathname.startsWith("/api/vehicles")) {
    const method = request.method;
    if (["POST", "PUT", "DELETE"].includes(method) && !user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }
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
    "/crm/:path*",
    "/api/vehicles/:path*",
    "/api/crm/:path*",
  ],
};
