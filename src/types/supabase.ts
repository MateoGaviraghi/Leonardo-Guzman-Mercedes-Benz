import type { Vehicle } from "@/data/vehicles";
import type {
  CrmCardRow,
  CrmProduct,
  CrmInterest,
  CrmCardHistoryEntry,
  CrmZona,
} from "@/types/crm";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: Vehicle & {
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Vehicle, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Vehicle, "id" | "created_at" | "updated_at">> & {
          updated_at?: string;
        };
        Relationships: [];
      };
      crm_cards: {
        Row: CrmCardRow;
        Insert: Omit<CrmCardRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CrmCardRow, "id" | "created_at">> & {
          updated_at?: string;
        };
        Relationships: [];
      };
      crm_products: {
        Row: CrmProduct;
        Insert: Omit<CrmProduct, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CrmProduct, "id" | "created_at">>;
        Relationships: [];
      };
      crm_interests: {
        Row: CrmInterest;
        Insert: Omit<CrmInterest, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CrmInterest, "id" | "created_at">>;
        Relationships: [];
      };
      crm_card_products: {
        Row: { card_id: string; product_id: string };
        Insert: { card_id: string; product_id: string };
        Update: { card_id?: string; product_id?: string };
        Relationships: [];
      };
      crm_card_interests: {
        Row: { card_id: string; interest_id: string };
        Insert: { card_id: string; interest_id: string };
        Update: { card_id?: string; interest_id?: string };
        Relationships: [];
      };
      crm_card_history: {
        Row: CrmCardHistoryEntry;
        Insert: Omit<CrmCardHistoryEntry, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CrmCardHistoryEntry, "id" | "created_at">>;
        Relationships: [];
      };
      crm_zonas: {
        Row: CrmZona;
        Insert: Omit<CrmZona, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CrmZona, "id" | "created_at">> & {
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      card_column:
        | "contacto"
        | "llamada_visita"
        | "cotizar"
        | "seguimiento"
        | "agenda"
        | "ventas";
      card_zone: "pizarron" | "agenda" | "ventas";
      contact_kind: "llamada" | "visita";
      history_action:
        | "created"
        | "moved_column"
        | "moved_zone"
        | "field_updated"
        | "note_added"
        | "auto_moved_by_date";
    };
    CompositeTypes: Record<never, never>;
  };
}
