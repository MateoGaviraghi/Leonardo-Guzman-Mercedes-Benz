-- ============================================================================
-- Lockdown del bucket `fichas-tecnicas`.
--
-- Estado anterior (reportado por Supabase Advisor + auditoría manual):
--   · Bucket `public: true` ✅ (correcto, queremos PDFs accesibles por URL)
--   · Policy "Public read fichas" → SELECT a `public` con bucket_id filter
--     ⚠️ Permitía LISTAR todos los archivos del bucket vía supabase.storage.list().
--     Las URLs públicas NO necesitan esta policy — los buckets `public: true`
--     ya sirven archivos vía /storage/v1/object/public/<bucket>/<path>.
--   · Policy "Auth upload fichas" → INSERT a `public` (anon + authenticated)
--     🚨 El nombre engañaba: cualquiera con la anon key podía subir PDFs al
--     bucket sin estar logueado. Permitía abuso (llenar storage, alojar
--     contenido malicioso accesible desde el dominio del concesionario).
--
-- Estado nuevo:
--   · Bucket sigue público (URLs directas funcionan igual que antes).
--   · Listing/SELECT eliminado (advisor "public_bucket_allows_listing" cierra).
--   · Upload/Update/Delete restringido al rol `authenticated` (admin logueado).
--
-- El código de TruckForm.tsx hace upload con cookies SSR (createSupabaseBrowser
-- + sesión activa), así que entra como `authenticated` y no se rompe.
-- El download usa getPublicUrl() que arma string sin tocar la API.
--
-- Idempotente. Aplicada vía MCP apply_migration.
-- ============================================================================

-- 1) Quitar policies viejas (si existen).
DROP POLICY IF EXISTS "Public read fichas" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload fichas" ON storage.objects;

-- 2) Permitir INSERT solo a authenticated.
DO $$ BEGIN
  CREATE POLICY "fichas_authenticated_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'fichas-tecnicas');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) Permitir UPDATE solo a authenticated (necesario para upsert:true).
DO $$ BEGIN
  CREATE POLICY "fichas_authenticated_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'fichas-tecnicas')
    WITH CHECK (bucket_id = 'fichas-tecnicas');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4) Permitir DELETE solo a authenticated (para reemplazar/limpiar PDFs).
DO $$ BEGIN
  CREATE POLICY "fichas_authenticated_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'fichas-tecnicas');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Nota: NO creamos policy SELECT a propósito. El bucket `public: true` sirve
-- archivos vía /storage/v1/object/public/... sin pasar por RLS.
