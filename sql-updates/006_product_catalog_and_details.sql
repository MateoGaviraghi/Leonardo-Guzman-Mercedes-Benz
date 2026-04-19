-- ============================================================================
-- Expansión del catálogo de productos + campo libre product_details en cards.
-- Ya aplicada en prod via MCP apply_migration. Idempotente.
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE product_kind AS ENUM ('auto', 'van', 'truck', 'otros');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE crm_products
  ADD COLUMN IF NOT EXISTS kind product_kind NOT NULL DEFAULT 'auto';

UPDATE crm_products SET kind = 'van'   WHERE name IN ('Sprinter', 'Vito');
UPDATE crm_products SET kind = 'otros' WHERE name = 'Usado';

INSERT INTO crm_products (name, kind) VALUES
  ('Clase B',   'auto'),
  ('Clase CLA', 'auto'),
  ('Clase CLE', 'auto'),
  ('Clase CLS', 'auto'),
  ('Clase S',   'auto'),
  ('Clase V',   'auto'),
  ('GLS',       'auto'),
  ('Clase G',   'auto'),
  ('EQA',       'auto'),
  ('EQB',       'auto'),
  ('EQE',       'auto'),
  ('EQS',       'auto'),
  ('Arocs',  'truck'),
  ('Accelo', 'truck'),
  ('Atego',  'truck'),
  ('Actros', 'truck'),
  ('Axor',   'truck')
ON CONFLICT (name) DO UPDATE SET kind = EXCLUDED.kind;

UPDATE crm_products SET kind = 'auto' WHERE name IN (
  'Clase A', 'Clase C', 'Clase E', 'GLA', 'GLB', 'GLC', 'GLE'
);

ALTER TABLE crm_cards
  ADD COLUMN IF NOT EXISTS product_details TEXT;

CREATE INDEX IF NOT EXISTS idx_products_kind_active
  ON crm_products(kind, is_active);
