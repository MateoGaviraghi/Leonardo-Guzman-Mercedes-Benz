// ============================================================================
// Tipos de la base de datos Supabase — espejo 1:1 del schema público real.
// Generados con `mcp__supabase__generate_typescript_types`.
// Si agregás/quitás columnas en la DB, regenerá este archivo.
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      crm_card_history: {
        Row: {
          action_type: Database["public"]["Enums"]["history_action"];
          card_id: string;
          created_at: string;
          description: string;
          field_changed: string | null;
          id: string;
          new_value: string | null;
          old_value: string | null;
          user_email: string | null;
          user_id: string | null;
        };
        Insert: {
          action_type: Database["public"]["Enums"]["history_action"];
          card_id: string;
          created_at?: string;
          description: string;
          field_changed?: string | null;
          id?: string;
          new_value?: string | null;
          old_value?: string | null;
          user_email?: string | null;
          user_id?: string | null;
        };
        Update: {
          action_type?: Database["public"]["Enums"]["history_action"];
          card_id?: string;
          created_at?: string;
          description?: string;
          field_changed?: string | null;
          id?: string;
          new_value?: string | null;
          old_value?: string | null;
          user_email?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "crm_card_history_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "crm_cards";
            referencedColumns: ["id"];
          }
        ];
      };
      crm_card_interests: {
        Row: { card_id: string; interest_id: string };
        Insert: { card_id: string; interest_id: string };
        Update: { card_id?: string; interest_id?: string };
        Relationships: [
          {
            foreignKeyName: "crm_card_interests_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "crm_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "crm_card_interests_interest_id_fkey";
            columns: ["interest_id"];
            isOneToOne: false;
            referencedRelation: "crm_interests";
            referencedColumns: ["id"];
          }
        ];
      };
      crm_card_products: {
        Row: { card_id: string; product_id: string };
        Insert: { card_id: string; product_id: string };
        Update: { card_id?: string; product_id?: string };
        Relationships: [
          {
            foreignKeyName: "crm_card_products_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "crm_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "crm_card_products_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "crm_products";
            referencedColumns: ["id"];
          }
        ];
      };
      crm_cards: {
        Row: {
          client_email: string | null;
          client_name: string;
          client_phone: string | null;
          contact_kind: Database["public"]["Enums"]["contact_kind"] | null;
          created_at: string;
          created_by: string | null;
          current_column: Database["public"]["Enums"]["card_column"];
          current_zone: Database["public"]["Enums"]["card_zone"];
          expected_close_at: string | null;
          id: string;
          last_contact_at: string | null;
          next_contact_at: string | null;
          notes: string | null;
          product_details: string | null;
          sold_at: string | null;
          updated_at: string;
          zona_id: string;
        };
        Insert: {
          client_email?: string | null;
          client_name: string;
          client_phone?: string | null;
          contact_kind?: Database["public"]["Enums"]["contact_kind"] | null;
          created_at?: string;
          created_by?: string | null;
          current_column?: Database["public"]["Enums"]["card_column"];
          current_zone?: Database["public"]["Enums"]["card_zone"];
          expected_close_at?: string | null;
          id?: string;
          last_contact_at?: string | null;
          next_contact_at?: string | null;
          notes?: string | null;
          product_details?: string | null;
          sold_at?: string | null;
          updated_at?: string;
          zona_id: string;
        };
        Update: {
          client_email?: string | null;
          client_name?: string;
          client_phone?: string | null;
          contact_kind?: Database["public"]["Enums"]["contact_kind"] | null;
          created_at?: string;
          created_by?: string | null;
          current_column?: Database["public"]["Enums"]["card_column"];
          current_zone?: Database["public"]["Enums"]["card_zone"];
          expected_close_at?: string | null;
          id?: string;
          last_contact_at?: string | null;
          next_contact_at?: string | null;
          notes?: string | null;
          product_details?: string | null;
          sold_at?: string | null;
          updated_at?: string;
          zona_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "crm_cards_zona_id_fkey";
            columns: ["zona_id"];
            isOneToOne: false;
            referencedRelation: "crm_zonas";
            referencedColumns: ["id"];
          }
        ];
      };
      crm_interests: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
        };
        Relationships: [];
      };
      crm_products: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          kind: Database["public"]["Enums"]["product_kind"];
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          kind?: Database["public"]["Enums"]["product_kind"];
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          kind?: Database["public"]["Enums"]["product_kind"];
          name?: string;
        };
        Relationships: [];
      };
      crm_reschedule_log: {
        Row: {
          checked_date: string;
          error_message: string | null;
          id: string;
          moved_count: number;
          ran_at: string;
          source: string;
        };
        Insert: {
          checked_date: string;
          error_message?: string | null;
          id?: string;
          moved_count?: number;
          ran_at?: string;
          source: string;
        };
        Update: {
          checked_date?: string;
          error_message?: string | null;
          id?: string;
          moved_count?: number;
          ran_at?: string;
          source?: string;
        };
        Relationships: [];
      };
      crm_zonas: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          aspecto_1_label: string | null;
          aspecto_1_valor: string | null;
          aspecto_2_label: string | null;
          aspecto_2_valor: string | null;
          aspecto_3_label: string | null;
          aspecto_3_valor: string | null;
          aspecto_4_label: string | null;
          aspecto_4_valor: string | null;
          brand: string;
          category: string;
          color_1_description: string | null;
          color_1_title: string | null;
          color_2_description: string | null;
          color_2_title: string | null;
          color_3_description: string | null;
          color_3_title: string | null;
          color_4_description: string | null;
          color_4_title: string | null;
          color_5_description: string | null;
          color_5_title: string | null;
          created_at: string | null;
          equip_asistencia: Json | null;
          equip_carga: string | null;
          equip_confort: Json | null;
          equip_equipamiento_compartimento: string | null;
          equip_exterior: Json | null;
          equip_interior: Json | null;
          equip_multimedia: Json | null;
          equip_puesto_conduccion: string | null;
          equip_seguridad: Json | null;
          equip_tren_rodaje: Json | null;
          equip_variantes_carroceria: string | null;
          equip_variantes_compartimento: string | null;
          equipment_general_description: string | null;
          equipment_general_title: string | null;
          exterior_1_description: string | null;
          exterior_1_title: string | null;
          exterior_10_description: string | null;
          exterior_10_title: string | null;
          exterior_2_description: string | null;
          exterior_2_title: string | null;
          exterior_3_description: string | null;
          exterior_3_title: string | null;
          exterior_4_description: string | null;
          exterior_4_title: string | null;
          exterior_5_description: string | null;
          exterior_5_title: string | null;
          exterior_6_description: string | null;
          exterior_6_title: string | null;
          exterior_7_description: string | null;
          exterior_7_title: string | null;
          exterior_8_description: string | null;
          exterior_8_title: string | null;
          exterior_9_description: string | null;
          exterior_9_title: string | null;
          fuel_type: string | null;
          id: string;
          interior_1_description: string | null;
          interior_1_title: string | null;
          interior_10_description: string | null;
          interior_10_title: string | null;
          interior_2_description: string | null;
          interior_2_title: string | null;
          interior_3_description: string | null;
          interior_3_title: string | null;
          interior_4_description: string | null;
          interior_4_title: string | null;
          interior_5_description: string | null;
          interior_5_title: string | null;
          interior_6_description: string | null;
          interior_6_title: string | null;
          interior_7_description: string | null;
          interior_7_title: string | null;
          interior_8_description: string | null;
          interior_8_title: string | null;
          interior_9_description: string | null;
          interior_9_title: string | null;
          is_amg: boolean;
          name: string;
          specs_bateria_carga: Json | null;
          specs_cantidades: Json | null;
          specs_carroceria: Json | null;
          specs_chasis: Json | null;
          specs_consumo: Json | null;
          specs_dimensiones: Json | null;
          specs_motorizacion: Json | null;
          specs_performance: Json | null;
          specs_pesos: Json | null;
          specs_potencia: Json | null;
          subtitle: string | null;
          truck_pdfs: Json | null;
          truck_sections: Json | null;
          updated_at: string | null;
        };
        Insert: {
          aspecto_1_label?: string | null;
          aspecto_1_valor?: string | null;
          aspecto_2_label?: string | null;
          aspecto_2_valor?: string | null;
          aspecto_3_label?: string | null;
          aspecto_3_valor?: string | null;
          aspecto_4_label?: string | null;
          aspecto_4_valor?: string | null;
          brand?: string;
          category: string;
          color_1_description?: string | null;
          color_1_title?: string | null;
          color_2_description?: string | null;
          color_2_title?: string | null;
          color_3_description?: string | null;
          color_3_title?: string | null;
          color_4_description?: string | null;
          color_4_title?: string | null;
          color_5_description?: string | null;
          color_5_title?: string | null;
          created_at?: string | null;
          equip_asistencia?: Json | null;
          equip_carga?: string | null;
          equip_confort?: Json | null;
          equip_equipamiento_compartimento?: string | null;
          equip_exterior?: Json | null;
          equip_interior?: Json | null;
          equip_multimedia?: Json | null;
          equip_puesto_conduccion?: string | null;
          equip_seguridad?: Json | null;
          equip_tren_rodaje?: Json | null;
          equip_variantes_carroceria?: string | null;
          equip_variantes_compartimento?: string | null;
          equipment_general_description?: string | null;
          equipment_general_title?: string | null;
          exterior_1_description?: string | null;
          exterior_1_title?: string | null;
          exterior_10_description?: string | null;
          exterior_10_title?: string | null;
          exterior_2_description?: string | null;
          exterior_2_title?: string | null;
          exterior_3_description?: string | null;
          exterior_3_title?: string | null;
          exterior_4_description?: string | null;
          exterior_4_title?: string | null;
          exterior_5_description?: string | null;
          exterior_5_title?: string | null;
          exterior_6_description?: string | null;
          exterior_6_title?: string | null;
          exterior_7_description?: string | null;
          exterior_7_title?: string | null;
          exterior_8_description?: string | null;
          exterior_8_title?: string | null;
          exterior_9_description?: string | null;
          exterior_9_title?: string | null;
          fuel_type?: string | null;
          id: string;
          interior_1_description?: string | null;
          interior_1_title?: string | null;
          interior_10_description?: string | null;
          interior_10_title?: string | null;
          interior_2_description?: string | null;
          interior_2_title?: string | null;
          interior_3_description?: string | null;
          interior_3_title?: string | null;
          interior_4_description?: string | null;
          interior_4_title?: string | null;
          interior_5_description?: string | null;
          interior_5_title?: string | null;
          interior_6_description?: string | null;
          interior_6_title?: string | null;
          interior_7_description?: string | null;
          interior_7_title?: string | null;
          interior_8_description?: string | null;
          interior_8_title?: string | null;
          interior_9_description?: string | null;
          interior_9_title?: string | null;
          is_amg?: boolean;
          name: string;
          specs_bateria_carga?: Json | null;
          specs_cantidades?: Json | null;
          specs_carroceria?: Json | null;
          specs_chasis?: Json | null;
          specs_consumo?: Json | null;
          specs_dimensiones?: Json | null;
          specs_motorizacion?: Json | null;
          specs_performance?: Json | null;
          specs_pesos?: Json | null;
          specs_potencia?: Json | null;
          subtitle?: string | null;
          truck_pdfs?: Json | null;
          truck_sections?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          aspecto_1_label?: string | null;
          aspecto_1_valor?: string | null;
          aspecto_2_label?: string | null;
          aspecto_2_valor?: string | null;
          aspecto_3_label?: string | null;
          aspecto_3_valor?: string | null;
          aspecto_4_label?: string | null;
          aspecto_4_valor?: string | null;
          brand?: string;
          category?: string;
          color_1_description?: string | null;
          color_1_title?: string | null;
          color_2_description?: string | null;
          color_2_title?: string | null;
          color_3_description?: string | null;
          color_3_title?: string | null;
          color_4_description?: string | null;
          color_4_title?: string | null;
          color_5_description?: string | null;
          color_5_title?: string | null;
          created_at?: string | null;
          equip_asistencia?: Json | null;
          equip_carga?: string | null;
          equip_confort?: Json | null;
          equip_equipamiento_compartimento?: string | null;
          equip_exterior?: Json | null;
          equip_interior?: Json | null;
          equip_multimedia?: Json | null;
          equip_puesto_conduccion?: string | null;
          equip_seguridad?: Json | null;
          equip_tren_rodaje?: Json | null;
          equip_variantes_carroceria?: string | null;
          equip_variantes_compartimento?: string | null;
          equipment_general_description?: string | null;
          equipment_general_title?: string | null;
          exterior_1_description?: string | null;
          exterior_1_title?: string | null;
          exterior_10_description?: string | null;
          exterior_10_title?: string | null;
          exterior_2_description?: string | null;
          exterior_2_title?: string | null;
          exterior_3_description?: string | null;
          exterior_3_title?: string | null;
          exterior_4_description?: string | null;
          exterior_4_title?: string | null;
          exterior_5_description?: string | null;
          exterior_5_title?: string | null;
          exterior_6_description?: string | null;
          exterior_6_title?: string | null;
          exterior_7_description?: string | null;
          exterior_7_title?: string | null;
          exterior_8_description?: string | null;
          exterior_8_title?: string | null;
          exterior_9_description?: string | null;
          exterior_9_title?: string | null;
          fuel_type?: string | null;
          id?: string;
          interior_1_description?: string | null;
          interior_1_title?: string | null;
          interior_10_description?: string | null;
          interior_10_title?: string | null;
          interior_2_description?: string | null;
          interior_2_title?: string | null;
          interior_3_description?: string | null;
          interior_3_title?: string | null;
          interior_4_description?: string | null;
          interior_4_title?: string | null;
          interior_5_description?: string | null;
          interior_5_title?: string | null;
          interior_6_description?: string | null;
          interior_6_title?: string | null;
          interior_7_description?: string | null;
          interior_7_title?: string | null;
          interior_8_description?: string | null;
          interior_8_title?: string | null;
          interior_9_description?: string | null;
          interior_9_title?: string | null;
          is_amg?: boolean;
          name?: string;
          specs_bateria_carga?: Json | null;
          specs_cantidades?: Json | null;
          specs_carroceria?: Json | null;
          specs_chasis?: Json | null;
          specs_consumo?: Json | null;
          specs_dimensiones?: Json | null;
          specs_motorizacion?: Json | null;
          specs_performance?: Json | null;
          specs_pesos?: Json | null;
          specs_potencia?: Json | null;
          subtitle?: string | null;
          truck_pdfs?: Json | null;
          truck_sections?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      crm_run_daily_reschedule: { Args: { p_source?: string }; Returns: Json };
    };
    Enums: {
      card_column:
        | "contacto"
        | "cotizar"
        | "llamada_visita"
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
      product_kind: "auto" | "van" | "truck" | "otros";
    };
    CompositeTypes: { [_ in never]: never };
  };
};
