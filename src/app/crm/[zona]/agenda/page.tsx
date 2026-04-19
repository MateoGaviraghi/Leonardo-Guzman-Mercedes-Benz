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

export default async function AgendaPage({
  params,
}: {
  params: Promise<{ zona: string }>;
}) {
  const { zona: zonaSlug } = await params;
  const supabase = await createSupabaseServer();

  const zonaActual = await getZonaBySlug(supabase, zonaSlug);
  if (!zonaActual) notFound();

  const [cards, products, interests] = await Promise.all([
    getCardsByZone(supabase, "agenda", zonaActual.id),
    getProducts(supabase),
    getInterests(supabase),
  ]);

  return (
    <div>
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
          Agenda · {zonaActual.name}
        </h1>
        <p className="hidden sm:block text-base text-slate-600 max-w-2xl">
          Clientes a los que vas a contactar más adelante. Cuando llegue el
          día del próximo contacto, la tarjeta vuelve automáticamente al
          Pizarrón en la columna Contacto.
        </p>
      </div>

      <ListZone cards={cards} zone="agenda" zona={zonaActual} />
      <CardDetailPanel
        zonaId={zonaActual.id}
        products={products}
        interests={interests}
      />
    </div>
  );
}
