import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type {
  CardColumn,
  CardZone,
  CreateCardPayload,
  CrmCardRow,
  UpdateCardPayload,
} from "@/types/crm";
import { addHistoryEntry } from "./history";
import { COLUMN_LABELS, ZONE_LABELS } from "./constants";

type Supabase = SupabaseClient<Database>;

// =========================================================================
// CREATE
// =========================================================================
export async function createCard(
  supabase: Supabase,
  payload: CreateCardPayload,
  user: User | null
): Promise<string> {
  const { product_ids = [], interest_ids = [], ...cardFields } = payload;

  if (!payload.zona_id) {
    throw new Error("zona_id es obligatorio para crear una tarjeta");
  }

  const { data: card, error } = (await supabase
    .from("crm_cards")
    .insert({
      ...cardFields,
      created_by: user?.id ?? null,
    } as never)
    .select("id")
    .single()) as { data: { id: string } | null; error: unknown };

  if (error || !card)
    throw (error as Error) ?? new Error("No se pudo crear la tarjeta");

  if (product_ids.length > 0) {
    await supabase
      .from("crm_card_products")
      .insert(
        product_ids.map((pid) => ({
          card_id: card.id,
          product_id: pid,
        })) as never
      );
  }
  if (interest_ids.length > 0) {
    await supabase
      .from("crm_card_interests")
      .insert(
        interest_ids.map((iid) => ({
          card_id: card.id,
          interest_id: iid,
        })) as never
      );
  }

  await addHistoryEntry(supabase, {
    cardId: card.id,
    action: "created",
    description: `Cliente ${payload.client_name} creado en ${
      COLUMN_LABELS[payload.current_column ?? "contacto"]
    }`,
    userId: user?.id,
    userEmail: user?.email ?? null,
  });

  return card.id;
}

// =========================================================================
// UPDATE (campos libres — no mueve de columna/zona, para eso usá moveCard)
// =========================================================================
export async function updateCard(
  supabase: Supabase,
  cardId: string,
  payload: UpdateCardPayload,
  user: User | null
): Promise<void> {
  const { product_ids, interest_ids, ...fields } = payload;

  // Snapshot previo para historial
  const { data: prevRaw } = await supabase
    .from("crm_cards")
    .select("*")
    .eq("id", cardId)
    .single();
  const prev = prevRaw as unknown as CrmCardRow | null;

  if (Object.keys(fields).length > 0) {
    const { error } = await supabase
      .from("crm_cards")
      .update(fields as never)
      .eq("id", cardId);
    if (error) throw error;
  }

  // Relaciones: reemplazo completo
  if (product_ids !== undefined) {
    await supabase.from("crm_card_products").delete().eq("card_id", cardId);
    if (product_ids.length > 0) {
      await supabase.from("crm_card_products").insert(
        product_ids.map((pid) => ({
          card_id: cardId,
          product_id: pid,
        })) as never
      );
    }
  }
  if (interest_ids !== undefined) {
    await supabase.from("crm_card_interests").delete().eq("card_id", cardId);
    if (interest_ids.length > 0) {
      await supabase.from("crm_card_interests").insert(
        interest_ids.map((iid) => ({
          card_id: cardId,
          interest_id: iid,
        })) as never
      );
    }
  }

  // Historial: un entry por campo cambiado (legible)
  if (prev) {
    const labels: Record<string, string> = {
      client_name: "Nombre",
      client_phone: "Teléfono",
      client_email: "Email",
      last_contact_at: "Último contacto",
      next_contact_at: "Próximo contacto",
      expected_close_at: "Fecha estimada de cierre",
      notes: "Notas",
    };

    for (const [key, newVal] of Object.entries(fields)) {
      const oldVal = (prev as unknown as Record<string, unknown>)[key];
      if (oldVal !== newVal && labels[key]) {
        await addHistoryEntry(supabase, {
          cardId,
          action: "field_updated",
          fieldChanged: key,
          oldValue: oldVal == null ? null : String(oldVal),
          newValue: newVal == null ? null : String(newVal),
          description: `${labels[key]} actualizado: ${oldVal ?? "—"} → ${
            newVal ?? "—"
          }`,
          userId: user?.id,
          userEmail: user?.email ?? null,
        });
      }
    }
  }
}

// =========================================================================
// MOVE (entre columnas y/o zonas) — con historial legible
// =========================================================================
export async function moveCard(
  supabase: Supabase,
  cardId: string,
  toColumn: CardColumn,
  toZone: CardZone | undefined,
  user: User | null,
  reason?: string,
  nextContactAt?: string | null
): Promise<void> {
  const { data: prevRaw, error: prevErr } = await supabase
    .from("crm_cards")
    .select("current_column, current_zone, client_name")
    .eq("id", cardId)
    .single();
  if (prevErr || !prevRaw)
    throw prevErr ?? new Error("Tarjeta no encontrada");
  const prev = prevRaw as unknown as {
    current_column: CardColumn;
    current_zone: CardZone;
    client_name: string;
  };

  const finalZone: CardZone = toZone ?? prev.current_zone;

  const updatePayload: Record<string, unknown> = {
    current_column: toColumn,
    current_zone: finalZone,
  };

  // Si entra a Ventas, marcar fecha de venta
  if (finalZone === "ventas") {
    updatePayload.sold_at = new Date().toISOString().slice(0, 10);
  }

  // Si el caller pasó una próxima fecha explícita (ej: postergar cliente)
  // la actualizamos junto con la movida.
  if (nextContactAt !== undefined) {
    updatePayload.next_contact_at = nextContactAt;
  }

  const { error } = await supabase
    .from("crm_cards")
    .update(updatePayload as never)
    .eq("id", cardId);
  if (error) throw error;

  // Historial: distinguimos cambio de zona vs cambio de columna
  const zoneChanged = prev.current_zone !== finalZone;
  const colChanged = prev.current_column !== toColumn;

  if (zoneChanged) {
    await addHistoryEntry(supabase, {
      cardId,
      action: "moved_zone",
      fieldChanged: "current_zone",
      oldValue: prev.current_zone,
      newValue: finalZone,
      description: `Movida de ${ZONE_LABELS[prev.current_zone]} a ${
        ZONE_LABELS[finalZone]
      }${reason ? ` — ${reason}` : ""}`,
      userId: user?.id,
      userEmail: user?.email ?? null,
    });
  }
  if (colChanged) {
    await addHistoryEntry(supabase, {
      cardId,
      action: "moved_column",
      fieldChanged: "current_column",
      oldValue: prev.current_column,
      newValue: toColumn,
      description: `Movida de ${COLUMN_LABELS[prev.current_column]} a ${
        COLUMN_LABELS[toColumn]
      }${reason ? ` — ${reason}` : ""}`,
      userId: user?.id,
      userEmail: user?.email ?? null,
    });
  }
}

// =========================================================================
// DELETE
// =========================================================================
export async function deleteCard(
  supabase: Supabase,
  cardId: string
): Promise<void> {
  const { error } = await supabase.from("crm_cards").delete().eq("id", cardId);
  if (error) throw error;
}
