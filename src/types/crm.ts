// Tipos del dominio CRM — espejo 1:1 del schema en sql-updates/003_crm_schema.sql

export type CardColumn =
  | "contacto"
  | "llamada_visita"
  | "cotizar"
  | "seguimiento"
  | "agenda"
  | "ventas";

export type CardZone = "pizarron" | "agenda" | "ventas";

export type ContactKind = "llamada" | "visita";

export type HistoryAction =
  | "created"
  | "moved_column"
  | "moved_zone"
  | "field_updated"
  | "note_added"
  | "auto_moved_by_date";

// Orden canónico de las 4 etapas del pizarrón (tal como se muestran en UI)
export const BOARD_COLUMNS: CardColumn[] = [
  "contacto",
  "llamada_visita",
  "cotizar",
  "seguimiento",
];

export type ProductKind = "auto" | "van" | "truck" | "otros";

export type CrmProduct = {
  id: string;
  name: string;
  kind: ProductKind;
  is_active: boolean;
  created_at: string;
};

export type CrmInterest = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export type CrmZona = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CrmCardRow = {
  id: string;
  zona_id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  current_column: CardColumn;
  current_zone: CardZone;
  contact_kind: ContactKind | null;
  last_contact_at: string | null; // ISO date (YYYY-MM-DD)
  next_contact_at: string | null;
  expected_close_at: string | null;
  sold_at: string | null;
  notes: string | null;
  product_details: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

// Card enriquecida con relaciones (products/interests) — es lo que el front consume.
export type CrmCard = CrmCardRow & {
  products: CrmProduct[];
  interests: CrmInterest[];
};

export type CrmCardHistoryEntry = {
  id: string;
  card_id: string;
  action_type: HistoryAction;
  field_changed: string | null;
  old_value: string | null;
  new_value: string | null;
  description: string;
  user_id: string | null;
  user_email: string | null;
  created_at: string;
};

// Payloads de la API ----------------------------------------------------------

export type CreateCardPayload = {
  zona_id: string;
  client_name: string;
  client_phone?: string | null;
  client_email?: string | null;
  current_column?: CardColumn;
  current_zone?: CardZone;
  contact_kind?: ContactKind | null;
  last_contact_at?: string | null;
  next_contact_at?: string | null;
  expected_close_at?: string | null;
  notes?: string | null;
  product_details?: string | null;
  product_ids?: string[];
  interest_ids?: string[];
};

export type UpdateCardPayload = Partial<CreateCardPayload>;

export type MoveCardPayload = {
  to_column: CardColumn;
  to_zone?: CardZone;
  reason?: string;
  /** Si se pasa, actualiza next_contact_at junto con la movida. */
  next_contact_at?: string | null;
};
