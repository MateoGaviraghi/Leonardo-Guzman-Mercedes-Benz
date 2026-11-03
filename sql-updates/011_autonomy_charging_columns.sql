-- 011: Columnas de Autonomía y Carga para vehículos eléctricos (sección AutonomySection).
-- Nombres EXACTOS a los que ya lee src/lib/parseVehicle.ts (líneas 32-33 y 48-57).
-- Aprobado por Mateo 2026-07-21 (CONFIRM autonomía, opción A).
-- Aplicar en: Supabase Dashboard → SQL Editor → pegar → Run.

alter table public.vehicles
  add column if not exists autonomy_general_title text,
  add column if not exists autonomy_general_description text,
  add column if not exists autonomy_card1_title text,
  add column if not exists autonomy_card1_description text,
  add column if not exists autonomy_card1_link text,
  add column if not exists autonomy_card2_title text,
  add column if not exists autonomy_card2_description text,
  add column if not exists autonomy_card2_link text,
  add column if not exists charging_tab1_title text,
  add column if not exists charging_tab2_title text,
  add column if not exists charging_tab1_content jsonb,
  add column if not exists charging_tab2_content jsonb;
