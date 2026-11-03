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
import { routeByDate } from "./date-logic";

type Supabase = SupabaseClient<Database>;

// =========================================================================
// Whitelist de columnas escribibles desde el cliente (mass-assignment guard)
// =========================================================================
// Espeja exactamente las claves de CreateCardPayload (menos product_ids/
// interest_ids, que se manejan aparte como relaciones). Nunca dejar pasar
// created_by/created_at/sold_at/id: esos se derivan server-side (moveCard
// para sold_at, el propio createCard para created_by).
const ALLOWED_CARD_FIELDS = [
  "zona_id",
  "client_name",
  "client_phone",
  "client_email",
  "contact_kind",
  "last_contact_at",
  "next_contact_at",
  "expected_close_at",
  "notes",
  "product_details",
] as const;

type AllowedCardField = (typeof ALLOWED_CARD_FIELDS)[number];

function whitelistCardFields<T extends Record<string, unknown>>(
  fields: T
): Pick<T, Extract<keyof T, AllowedCardField>> {
  const clean = {} as Pick<T, Extract<keyof T, AllowedCardField>>;
  for (const key of Object.keys(fields) as (keyof T)[]) {
    if ((ALLOWED_CARD_FIELDS as readonly string[]).includes(key as string)) {
      (clean as Record<string, unknown>)[key as string] = fields[key];
    }
  }
  return clean;
}

// =========================================================================
// CREATE
// =========================================================================
export async function createCard(
  supabase: Supabase,
  payload: CreateCardPayload,
  user: User | null
): Promise<string> {
  const { product_ids = [], interest_ids = [], ...rawFields } = payload;
  const cardFields = whitelistCardFields(rawFields);

  if (!payload.zona_id) {
    throw new Error("zona_id es obligatorio para crear una tarjeta");
  }

  // Placement inicial SOLICITADO por el cliente = semilla, nunca write crudo.
  // Se valida contra el enum (descarta basura de un body crafteado) y se pasa
  // por routeByDate, que aplica la regla de 20 días y respeta 'ventas'.
  const requestedColumn: CardColumn =
    payload.current_column && payload.current_column in COLUMN_LABELS
      ? payload.current_column
      : "contacto";
  const requestedZone: CardZone =
    payload.current_zone && payload.current_zone in ZONE_LABELS
      ? payload.current_zone
      : "pizarron";

  const routed = routeByDate(
    cardFields.next_contact_at ?? null,
    requestedColumn,
    requestedZone
  );

  const insertPayload: Record<string, unknown> = {
    ...cardFields,
    current_column: routed.column,
    current_zone: routed.zone,
    created_by: user?.id ?? null,
  };

  // Cierra el residual de crear directo en Ventas sin fecha de venta.
  if (routed.zone === "ventas") {
    insertPayload.sold_at = new Date().toISOString().slice(0, 10);
  }

  const { data: card, error } = (await supabase
    .from("crm_cards")
    .insert(insertPayload as never)
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
      COLUMN_LABELS[routed.column]
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
  const { product_ids, interest_ids, ...rawFields } = payload;
  const fields = whitelistCardFields(rawFields);

  // Snapshot previo para historial
  const { data: prevRaw } = await supabase
    .from("crm_cards")
    .select("*")
    .eq("id", cardId)
    .single();
  const prev = prevRaw as unknown as CrmCardRow | null;

  // Regla de los 20 días: si se cambia next_contact_at, re-derivar columna/zona
  // SERVER-SIDE a partir del estado previo + la nueva fecha. current_column/
  // current_zone NUNCA salen del body (fuera de la whitelist): la única forma de
  // mover una card es esta derivación por fecha o moveCard.
  const routing: { current_column?: CardColumn; current_zone?: CardZone } = {};
  if (prev && "next_contact_at" in fields) {
    const routed = routeByDate(
      fields.next_contact_at ?? null,
      prev.current_column,
      prev.current_zone
    );
    routing.current_column = routed.column;
    routing.current_zone = routed.zone;
  }

  const updatePayload = { ...fields, ...routing };
  if (Object.keys(updatePayload).length > 0) {
    const { error } = await supabase
      .from("crm_cards")
      .update(updatePayload as never)
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
