-- Migración: Agregar nuevos campos a la tabla vehicles
-- Ejecutar este script en Supabase SQL Editor

-- Agregar campos de exterior 7-10
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS exterior_7_title TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS exterior_7_description TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS exterior_8_title TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS exterior_8_description TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS exterior_9_title TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS exterior_9_description TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS exterior_10_title TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS exterior_10_description TEXT;

-- Agregar campos de interior 7-10
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS interior_7_title TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS interior_7_description TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS interior_8_title TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS interior_8_description TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS interior_9_title TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS interior_9_description TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS interior_10_title TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS interior_10_description TEXT;

-- Agregar campo de especificaciones de batería y carga (para vehículos eléctricos)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS specs_bateria_carga JSONB;

-- Agregar campo de equipamiento de seguridad
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS equip_seguridad JSONB;

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
AND column_name IN (
  'exterior_7_title', 'exterior_7_description',
  'exterior_8_title', 'exterior_8_description',
  'exterior_9_title', 'exterior_9_description',
  'exterior_10_title', 'exterior_10_description',
  'interior_7_title', 'interior_7_description',
  'interior_8_title', 'interior_8_description',
  'interior_9_title', 'interior_9_description',
  'interior_10_title', 'interior_10_description',
  'specs_bateria_carga',
  'equip_seguridad'
)
ORDER BY column_name;
