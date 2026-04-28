-- ============================================================================
-- Cierra el último agujero del CRM cron: revoca EXECUTE de
-- `crm_run_daily_reschedule` al rol anon.
--
-- Estado anterior (reportado por Supabase Advisor):
--   · `anon_security_definer_function_executable` (WARN)
--     Cualquiera con la anon key del proyecto podía llamar
--     POST /rest/v1/rpc/crm_run_daily_reschedule directamente y disparar
--     el reschedule. La función es SECURITY DEFINER, así que se ejecutaba
--     con privilegios del owner (postgres) — no rompía datos (es
--     idempotente) pero ensuciaba `crm_reschedule_log` y filtraba info
--     sobre el funcionamiento interno.
--
-- Estado nuevo:
--   · anon: ❌ no puede ejecutar.
--   · authenticated: ✅ puede ejecutar (necesario para el safety_net del
--     layout `/crm/[zona]` que la dispara desde el browser del vendedor).
--   · service_role: ✅ puede ejecutar (necesario para el endpoint del cron
--     `/api/crm/cron/reschedule`, que ahora la llama con service_role).
--
-- ⚠️ ORDEN DE DEPLOY ⚠️
--   Antes de aplicar:
--   1. Agregar SUPABASE_SERVICE_ROLE_KEY a las env vars de Vercel
--      (Dashboard → Project Settings → Environment Variables).
--      Copiar de Supabase → Settings → API → Project API keys → service_role.
--   2. Agregar la misma variable a `.env.local` para tests locales del cron.
--   3. Re-deploy de la app en Vercel (o `npm run dev` localmente).
--   4. Recién entonces aplicar esta migration.
--
--   Si se aplica esta migration SIN tener la env var, el cron empezará a
--   fallar con "permission denied for function crm_run_daily_reschedule".
--   Para revertir mientras tanto:
--     GRANT EXECUTE ON FUNCTION public.crm_run_daily_reschedule(TEXT) TO anon;
--
-- Idempotente. NO aplicada todavía.
-- ============================================================================

-- IMPORTANTE: PostgreSQL otorga EXECUTE a PUBLIC por default a las funciones,
-- y `anon` hereda de PUBLIC. Hay que revocar de AMBOS (PUBLIC + anon explícito)
-- para cerrar el acceso anónimo. Solo revocar de `anon` no alcanza.
REVOKE EXECUTE ON FUNCTION public.crm_run_daily_reschedule(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.crm_run_daily_reschedule(TEXT) FROM anon;

-- (Re-)otorgamos a authenticated y service_role, idempotente.
GRANT EXECUTE ON FUNCTION public.crm_run_daily_reschedule(TEXT)
  TO authenticated, service_role;
