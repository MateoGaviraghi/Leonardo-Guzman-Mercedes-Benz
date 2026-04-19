-- ============================================================================
-- CRM Schema - Mercedes-Benz Dealership
-- Fase 1: Tablas, enums, índices, triggers, RLS.
-- Ejecutar en Supabase SQL editor (o vía psql).
-- Idempotente: se puede correr varias veces sin romper.
-- ============================================================================

-- ============ ENUMS ============
DO $$ BEGIN
  CREATE TYPE card_column AS ENUM (
    'contacto',
    'cotizar',
    'negociacion',
    'cierre',
    'agenda',
    'ventas'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE card_zone AS ENUM ('pizarron', 'agenda', 'ventas');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE history_action AS ENUM (
    'created',
    'moved_column',
    'moved_zone',
    'field_updated',
    'note_added',
    'auto_moved_by_date'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ CATÁLOGOS (editables desde UI /crm/catalogos) ============
CREATE TABLE IF NOT EXISTS crm_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catálogo inicial sugerido (idempotente)
INSERT INTO crm_products (name) VALUES
  ('Clase A'), ('Clase C'), ('Clase E'),
  ('GLA'), ('GLB'), ('GLC'), ('GLE'),
  ('Sprinter'), ('Vito'), ('Usado')
ON CONFLICT (name) DO NOTHING;

INSERT INTO crm_interests (name) VALUES
  ('Utilitarios'),
  ('Livianos'),
  ('Semi pesados'),
  ('Pesados'),
  ('Extra pesados')
ON CONFLICT (name) DO NOTHING;

-- ============ TABLA PRINCIPAL ============
CREATE TABLE IF NOT EXISTS crm_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cliente
  client_name  TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,

  -- Estado en el tablero
  current_column card_column NOT NULL DEFAULT 'contacto',
  current_zone   card_zone   NOT NULL DEFAULT 'pizarron',

  -- Fechas clave
  last_contact_at   DATE,
  next_contact_at   DATE,  -- dispara movimiento automático diario
  expected_close_at DATE,
  sold_at           DATE,  -- se setea al mover a zona 'ventas'

  -- Notas libres
  notes TEXT,

  -- Auditoría
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cards_zone_column
  ON crm_cards(current_zone, current_column);

CREATE INDEX IF NOT EXISTS idx_cards_next_contact
  ON crm_cards(next_contact_at)
  WHERE current_zone = 'pizarron' OR current_zone = 'agenda';

CREATE INDEX IF NOT EXISTS idx_cards_client_name
  ON crm_cards USING gin (to_tsvector('spanish', client_name));

-- ============ RELACIONES MANY-TO-MANY ============
CREATE TABLE IF NOT EXISTS crm_card_products (
  card_id    UUID NOT NULL REFERENCES crm_cards(id)   ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES crm_products(id) ON DELETE RESTRICT,
  PRIMARY KEY (card_id, product_id)
);

CREATE TABLE IF NOT EXISTS crm_card_interests (
  card_id     UUID NOT NULL REFERENCES crm_cards(id)      ON DELETE CASCADE,
  interest_id UUID NOT NULL REFERENCES crm_interests(id)  ON DELETE RESTRICT,
  PRIMARY KEY (card_id, interest_id)
);

-- ============ HISTORIAL ============
CREATE TABLE IF NOT EXISTS crm_card_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES crm_cards(id) ON DELETE CASCADE,
  action_type   history_action NOT NULL,
  field_changed TEXT,
  old_value     TEXT,
  new_value     TEXT,
  description   TEXT NOT NULL,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_card
  ON crm_card_history(card_id, created_at DESC);

-- ============ TRIGGER: updated_at automático ============
CREATE OR REPLACE FUNCTION crm_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cards_updated_at ON crm_cards;
CREATE TRIGGER trg_cards_updated_at
  BEFORE UPDATE ON crm_cards
  FOR EACH ROW
  EXECUTE FUNCTION crm_set_updated_at();

-- ============ RLS (Row Level Security) ============
ALTER TABLE crm_cards          ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_interests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_card_products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_card_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_card_history   ENABLE ROW LEVEL SECURITY;

-- Policy: cualquier usuario autenticado puede leer/escribir.
-- (Si más adelante hay varios vendedores, reemplazar por policies por user_id)
DO $$ BEGIN
  CREATE POLICY "crm_cards_auth" ON crm_cards
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_products_auth" ON crm_products
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_interests_auth" ON crm_interests
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_card_products_auth" ON crm_card_products
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_card_interests_auth" ON crm_card_interests
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "crm_card_history_auth" ON crm_card_history
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
