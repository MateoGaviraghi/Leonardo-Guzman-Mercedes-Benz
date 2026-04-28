-- ============================================================================
-- Habilita RLS en `vehicles` (estaba deshabilitado: cualquiera con la anon
-- key podía insertar/actualizar/borrar vehículos directamente vía
-- /rest/v1/vehicles, bypaseando completamente el proxy.ts de la app).
--
-- Reportado por Supabase Advisor:
--   - rls_disabled_in_public        (level: ERROR)
--   - policy_exists_rls_disabled    (level: ERROR)  ← la policy SELECT existía
--                                                      pero no se aplicaba.
--
-- Comportamiento resultante:
--   · anon (sitio público / GET sin sesión): SELECT ✅ (policy ya existente
--     "Enable read access for all users"), INSERT/UPDATE/DELETE ❌ bloqueado.
--   · authenticated (admin logueado vía SSR client): todo permitido por la
--     nueva policy `vehicles_authenticated_write`.
--
-- ⚠️ ORDEN DE DEPLOY ⚠️
-- Esta migration cierra el agujero de seguridad PERO requiere que el código
-- de /api/vehicles ya esté deployado usando `createSupabaseServer` (SSR
-- client autenticado). Ese cambio vino en el mismo PR — aplicá esta
-- migration DESPUÉS de que Vercel haya buildeado el deploy nuevo, no antes.
--
-- Si la aplicás antes, el admin actual (que escribe con anon key) empieza a
-- recibir 401/403 hasta que el deploy termine.
--
-- Idempotente: se puede correr varias veces sin romper.
-- ============================================================================

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Policy de escritura para usuarios autenticados (admin panel).
-- La policy SELECT pública ya existe ("Enable read access for all users",
-- creada con el schema original) y queda intacta.
DO $$ BEGIN
  CREATE POLICY "vehicles_authenticated_write" ON public.vehicles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
