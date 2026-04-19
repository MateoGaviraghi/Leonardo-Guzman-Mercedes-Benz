import type { CardColumn, CardZone } from "@/types/crm";

/**
 * Llama al endpoint POST /api/crm/cards/:id/move.
 * Lanza Error si la respuesta no es 2xx para que el caller pueda mostrar toast.
 */
export async function apiMoveCard(
  cardId: string,
  payload: {
    to_column: CardColumn;
    to_zone?: CardZone;
    reason?: string;
    next_contact_at?: string | null;
  }
): Promise<void> {
  const res = await fetch(`/api/crm/cards/${cardId}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data?.error ?? "No se pudo mover la tarjeta");
  }
}
