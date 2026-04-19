import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import {
  getCardsByZone,
  getInterests,
  getProducts,
  getZonaBySlug,
} from "@/lib/crm/queries";
import { ListZone } from "@/components/crm/ListZone";
import { CardDetailPanel } from "@/components/crm/CardDetailPanel";

export const dynamic = "force-dynamic";

export default async function VentasPage({
  params,
}: {
  params: Promise<{ zona: string }>;
}) {
  const { zona: zonaSlug } = await params;
  const supabase = await createSupabaseServer();

  const zonaActual = await getZonaBySlug(supabase, zonaSlug);
  if (!zonaActual) notFound();

  const [cards, products, interests] = await Promise.all([
    getCardsByZone(supabase, "ventas", zonaActual.id),
    getProducts(supabase),
    getInterests(supabase),
  ]);

  return (
    <div>
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
          Ventas · {zonaActual.name}
        </h1>
        <p className="hidden sm:block text-base text-slate-600 max-w-2xl">
          Historial de operaciones ganadas. Podés volver a llevar una tarjeta
          al pizarrón si el cliente retoma la conversación.
        </p>
      </div>

      <ListZone cards={cards} zone="ventas" zona={zonaActual} />
      <CardDetailPanel
        zonaId={zonaActual.id}
        products={products}
        interests={interests}
      />
    </div>
  );
}
