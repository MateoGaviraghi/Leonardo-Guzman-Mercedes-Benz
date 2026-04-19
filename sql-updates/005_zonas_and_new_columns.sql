-- ============================================================================
-- Reestructura mayor:
--   - Renombre de enum card_column: negociacion → llamada_visita,
--     cierre → seguimiento
--   - Nuevo enum contact_kind (llamada | visita) + col en crm_cards
--   - Nueva tabla crm_zonas (cada zona = workspace con su pizarrón/agenda/ventas)
--   - zona_id NOT NULL en crm_cards, con backfill a zona "General"
-- Ya aplicada en prod vía MCP apply_migration. Idempotente.
-- ============================================================================

-- 1) Renombres de enum (preservan posición sortorder)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'negociacion' AND enumtypid = 'card_column'::regtype
  ) THEN
    ALTER TYPE card_column RENAME VALUE 'negociacion' TO 'llamada_visita';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'cierre' AND enumtypid = 'card_column'::regtype
  ) THEN
    ALTER TYPE card_column RENAME VALUE 'cierre' TO 'seguimiento';
  END IF;
END $$;

-- 2) Tipo de contacto (llamada / visita)
DO $$ BEGIN
  CREATE TYPE contact_kind AS ENUM ('llamada', 'visita');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE crm_cards
  ADD COLUMN IF NOT EXISTS contact_kind contact_kind;

-- 3) Zonas (workspaces geográficos)
CREATE TABLE IF NOT EXISTS crm_zonas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zonas_active ON crm_zonas(is_active, name);

ALTER TABLE crm_zonas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "crm_zonas_auth" ON crm_zonas
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS trg_zonas_updated_at ON crm_zonas;
CREATE TRIGGER trg_zonas_updated_at
  BEFORE UPDATE ON crm_zonas
  FOR EACH ROW EXECUTE FUNCTION crm_set_updated_at();

INSERT INTO crm_zonas (name, slug) VALUES
  ('General',   'general'),
  ('Sunchales', 'sunchales')
ON CONFLICT (slug) DO NOTHING;

-- 4) zona_id en cards (backfill a "General")
ALTER TABLE crm_cards
  ADD COLUMN IF NOT EXISTS zona_id UUID REFERENCES crm_zonas(id) ON DELETE RESTRICT;

UPDATE crm_cards
SET zona_id = (SELECT id FROM crm_zonas WHERE slug = 'general')
WHERE zona_id IS NULL;

ALTER TABLE crm_cards
  ALTER COLUMN zona_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cards_zona_zone_column
  ON crm_cards(zona_id, current_zone, current_column);
