-- ========================================
-- AGREGAR COLUMNAS DE EQUIPAMIENTO EXTERIOR E INTERIOR
-- Para vehículos AMG - Agregar categorías de equipamiento
-- Fecha: 2026-01-13
-- ========================================

-- Agregar columna equip_exterior (JSONB)
-- Para almacenar items del equipamiento exterior
-- Estructura: [{ title?: string, description?: string }, ...]
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS equip_exterior JSONB DEFAULT '[]'::jsonb;

-- Agregar columna equip_interior (JSONB)
-- Para almacenar items del equipamiento interior
-- Estructura: [{ title?: string, description?: string }, ...]
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS equip_interior JSONB DEFAULT '[]'::jsonb;

-- Agregar comentarios para documentación
COMMENT ON COLUMN vehicles.equip_exterior IS 'Equipamiento exterior (especialmente para vehículos AMG). Formato: [{ title?: string, description?: string }]';
COMMENT ON COLUMN vehicles.equip_interior IS 'Equipamiento interior (especialmente para vehículos AMG). Formato: [{ title?: string, description?: string }]';

-- Verificar que se agregaron correctamente
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'vehicles' 
  AND column_name IN ('equip_exterior', 'equip_interior')
ORDER BY column_name;
