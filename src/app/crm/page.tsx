import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getZonas } from "@/lib/crm/queries";

/**
 * /crm → redirige al pizarrón de la primera zona activa.
 * Si no hay zonas activas, manda a /crm/zonas para que el user cree una.
 */
export default async function CrmRootPage() {
  const supabase = await createSupabaseServer();
  const zonas = await getZonas(supabase, { onlyActive: true });

  if (zonas.length === 0) {
    redirect("/crm/zonas");
  }

  redirect(`/crm/${zonas[0].slug}/pizarron`);
}
