import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type {
  CardZone,
  CrmCard,
  CrmCardHistoryEntry,
  CrmCardRow,
  CrmInterest,
  CrmProduct,
  CrmZona,
} from "@/types/crm";

type Supabase = SupabaseClient<Database>;

type JoinedCardRow = CrmCardRow & {
  products: { crm_products: CrmProduct | null }[];
  interests: { crm_interests: CrmInterest | null }[];
};

function normalizeJoined(row: JoinedCardRow): CrmCard {
  return {
    ...row,
    products: row.products
      .map((p) => p.crm_products)
      .filter((p): p is CrmProduct => p !== null),
    interests: row.interests
      .map((i) => i.crm_interests)
      .filter((i): i is CrmInterest => i !== null),
  };
}

// ============================================================================
// ZONAS
// ============================================================================

export async function getZonas(
  supabase: Supabase,
  opts?: { onlyActive?: boolean }
): Promise<CrmZona[]> {
  let query = supabase.from("crm_zonas").select("*");
  if (opts?.onlyActive ?? true) query = query.eq("is_active", true);
  const { data, error } = await query.order("name");
  if (error) throw error;
  return (data ?? []) as unknown as CrmZona[];
}

export async function getZonaBySlug(
  supabase: Supabase,
  slug: string
): Promise<CrmZona | null> {
  const { data, error } = await supabase
    .from("crm_zonas")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as CrmZona | null) ?? null;
}

// ============================================================================
// CARDS (scoped por zona_id)
// ============================================================================

export async function getCardsByZone(
  supabase: Supabase,
  zone: CardZone,
  zonaId: string
): Promise<CrmCard[]> {
  const { data, error } = await supabase
    .from("crm_cards")
    .select(
      `
      *,
      products:crm_card_products(
        crm_products(id, name, is_active, created_at)
      ),
      interests:crm_card_interests(
        crm_interests(id, name, is_active, created_at)
      )
    `
    )
    .eq("zona_id", zonaId)
    .eq("current_zone", zone)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return (data as unknown as JoinedCardRow[]).map(normalizeJoined);
}

export async function getCardById(
  supabase: Supabase,
  id: string
): Promise<CrmCard | null> {
  const { data, error } = await supabase
    .from("crm_cards")
    .select(
      `
      *,
      products:crm_card_products(
        crm_products(id, name, is_active, created_at)
      ),
      interests:crm_card_interests(
        crm_interests(id, name, is_active, created_at)
      )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return normalizeJoined(data as unknown as JoinedCardRow);
}

export async function getCardHistory(
  supabase: Supabase,
  cardId: string
): Promise<CrmCardHistoryEntry[]> {
  const { data, error } = await supabase
    .from("crm_card_history")
    .select("*")
    .eq("card_id", cardId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as CrmCardHistoryEntry[];
}

export async function getProducts(supabase: Supabase): Promise<CrmProduct[]> {
  const { data, error } = await supabase
    .from("crm_products")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []) as unknown as CrmProduct[];
}

export async function getInterests(supabase: Supabase): Promise<CrmInterest[]> {
  const { data, error } = await supabase
    .from("crm_interests")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []) as unknown as CrmInterest[];
}

/**
 * Conteo de tarjetas por zona de trabajo (pizarron/agenda/ventas)
 * dentro de una zona geográfica específica.
 */
export async function countCardsByZone(
  supabase: Supabase,
  zone: CardZone,
  zonaId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("crm_cards")
    .select("id", { count: "exact", head: true })
    .eq("zona_id", zonaId)
    .eq("current_zone", zone);
  if (error) throw error;
  return count ?? 0;
}

/**
 * Tarjetas vencidas dentro de la zona geográfica (pizarrón, next_contact_at < hoy).
 */
export async function getOverdueCount(
  supabase: Supabase,
  zonaId: string
): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { count, error } = await supabase
    .from("crm_cards")
    .select("id", { count: "exact", head: true })
    .eq("zona_id", zonaId)
    .eq("current_zone", "pizarron")
    .lt("next_contact_at", today);
  if (error) throw error;
  return count ?? 0;
}
