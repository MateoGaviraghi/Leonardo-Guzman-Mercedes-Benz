-- 012: Destacados 11 y 12 de Exterior e Interior (hasta ahora el máximo era 10).
-- Por qué: la Clase G trae 10 destacados de exterior y el Mercedes-AMG GT 43 Coupé 11,
-- más la presentación (slot 1). Aprobado por Mateo 2026-11-06 ("Ampliar a 12 lugares").
-- Columnas nuevas, opcionales: los autos ya cargados no cambian.
-- Aplicar en: Supabase Dashboard → SQL Editor → pegar → Run.

alter table public.vehicles
  add column if not exists exterior_11_title text,
  add column if not exists exterior_11_description text,
  add column if not exists exterior_12_title text,
  add column if not exists exterior_12_description text,
  add column if not exists interior_11_title text,
  add column if not exists interior_11_description text,
  add column if not exists interior_12_title text,
  add column if not exists interior_12_description text;
