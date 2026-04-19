import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getZonas } from "@/lib/crm/queries";
import { ZonasAdmin } from "@/components/crm/ZonasAdmin";

export const dynamic = "force-dynamic";

export default async function ZonasPage() {
  const supabase = await createSupabaseServer();
  // Traer TODAS las zonas (activas e inactivas) para el ABM
  const zonas = await getZonas(supabase, { onlyActive: false });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <Link
          href="/crm"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Volver al CRM
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Gestionar zonas
        </h1>
        <p className="text-base text-slate-600 max-w-2xl">
          Cada zona tiene su propio pizarrón, agenda y ventas. Usá las zonas
          para separar tus contactos por geografía (ej: Sunchales, Rafaela) o
          cualquier criterio que te sirva.
        </p>
      </div>

      <ZonasAdmin initialZonas={zonas} />
    </div>
  );
}
