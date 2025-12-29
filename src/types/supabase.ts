import type { Vehicle } from "@/data/vehicles";

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
      };
    };
  };
}
