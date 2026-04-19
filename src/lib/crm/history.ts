import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { HistoryAction } from "@/types/crm";

type Supabase = SupabaseClient<Database>;

type AddHistoryArgs = {
  cardId: string;
  action: HistoryAction;
  description: string;
  fieldChanged?: string;
  oldValue?: string | null;
  newValue?: string | null;
  userId?: string | null;
  userEmail?: string | null;
};

/**
 * Registra una entrada de historial para una tarjeta.
 * La descripción se renderiza tal cual en la timeline, así que tiene que ser
 * legible para el usuario final ("Movida de Contacto a Cotizar", no códigos).
 */
export async function addHistoryEntry(
  supabase: Supabase,
  args: AddHistoryArgs
): Promise<void> {
  const { error } = await supabase.from("crm_card_history").insert({
    card_id: args.cardId,
    action_type: args.action,
    field_changed: args.fieldChanged ?? null,
    old_value: args.oldValue ?? null,
    new_value: args.newValue ?? null,
    description: args.description,
    user_id: args.userId ?? null,
    user_email: args.userEmail ?? null,
  } as never);

  if (error) {
    // No reventamos la operación principal si falla el historial:
    // el estado queda correcto en la tabla de cards, solo se pierde la auditoría.
    console.error("[crm/history] failed to insert entry", error);
  }
}
