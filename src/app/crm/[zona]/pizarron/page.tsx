import { UserPlus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import {
  getCardsByZone,
  getInterests,
  getProducts,
  getZonaBySlug,
} from "@/lib/crm/queries";
import { Board } from "@/components/crm/Board";
import { CardDetailPanel } from "@/components/crm/CardDetailPanel";

export const dynamic = "force-dynamic";

export default async function PizarronPage({
  params,
}: {
  params: Promise<{ zona: string }>;
}) {
  const { zona: zonaSlug } = await params;
  const supabase = await createSupabaseServer();

  const zonaActual = await getZonaBySlug(supabase, zonaSlug);
  if (!zonaActual) notFound();

  const [cards, products, interests] = await Promise.all([
    getCardsByZone(supabase, "pizarron", zonaActual.id),
    getProducts(supabase),
    getInterests(supabase),
  ]);

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-5 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
            Pizarrón · {zonaActual.name}
          </h1>
          <p className="hidden sm:block text-base text-slate-600 max-w-2xl">
            Movés a los clientes entre las 4 etapas según avance la
            conversación. Las tarjetas vencidas se marcan en rojo.
          </p>
        </div>
        <Link
          href={`/crm/${zonaActual.slug}/pizarron?card=nuevo&col=contacto`}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 min-h-[48px] text-base font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:bg-slate-950 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 shadow-sm"
        >
          <UserPlus className="w-5 h-5" aria-hidden="true" />
          <span className="hidden sm:inline">Nuevo cliente</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      <Board cards={cards} zona={zonaActual} />
      <CardDetailPanel
        zonaId={zonaActual.id}
        products={products}
        interests={interests}
      />
    </div>
  );
}
