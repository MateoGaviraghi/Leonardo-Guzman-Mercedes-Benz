-- Migración: Columnas de equipamiento Sprinter
-- Agregar en Supabase > SQL Editor

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS equip_variantes_carroceria    text,
  ADD COLUMN IF NOT EXISTS equip_carga                   text,
  ADD COLUMN IF NOT EXISTS equip_variantes_compartimento text,
  ADD COLUMN IF NOT EXISTS equip_equipamiento_compartimento text,
  ADD COLUMN IF NOT EXISTS equip_puesto_conduccion       text;
