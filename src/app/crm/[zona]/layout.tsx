import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import {
  countCardsByZone,
  getOverdueCount,
  getZonaBySlug,
  getZonas,
} from "@/lib/crm/queries";
import { runDailyReschedule } from "@/lib/crm/date-logic";
import { CrmHeader } from "@/components/crm/CrmHeader";

/**
 * Layout de una zona específica (/crm/[zona]/*).
 * Resuelve la zona del slug, fetchea los conteos para esa zona y renderiza el
 * header con el ZonaSelector + ZoneSwitcher + búsqueda + vencidas.
 */
export default async function ZonaLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ zona: string }>;
}) {
  const { zona: zonaSlug } = await params;
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Aunque el /crm/layout.tsx ya valida auth, lo re-chequeamos acá para tener
  // el user y poder construir el header completo sin un fetch extra.
  const userEmail = user?.email ?? "";

  const [zonaActual, zonas] = await Promise.all([
    getZonaBySlug(supabase, zonaSlug),
    getZonas(supabase, { onlyActive: true }),
  ]);

  if (!zonaActual) {
    notFound();
  }

  // Red de seguridad del reschedule (global — cubre todas las zonas).
  const timeBoxedReschedule = Promise.race([
    runDailyReschedule(supabase, "safety_net").catch((e) => {
      console.error("[crm/[zona]/layout] reschedule failed", e);
      return null;
    }),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
  ]);

  const [, pizarronCount, agendaCount, ventasCount, overdueCount] =
    await Promise.all([
      timeBoxedReschedule,
      countCardsByZone(supabase, "pizarron", zonaActual.id),
      countCardsByZone(supabase, "agenda", zonaActual.id),
      countCardsByZone(supabase, "ventas", zonaActual.id),
      getOverdueCount(supabase, zonaActual.id),
    ]);

  return (
    <>
      <CrmHeader
        userEmail={userEmail}
        zonaActual={zonaActual}
        zonas={zonas}
        counts={{
          pizarron: pizarronCount,
          agenda: agendaCount,
          ventas: ventasCount,
        }}
        overdueCount={overdueCount}
      />
      <main className="w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
        {children}
      </main>
    </>
  );
}
