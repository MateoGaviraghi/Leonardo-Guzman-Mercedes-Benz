-- ============================================================================
-- Fase 5: Observabilidad del reschedule + función SECURITY DEFINER
-- Idempotente. Ya aplicada en producción via MCP apply_migration.
-- ============================================================================

-- Log de ejecuciones del reschedule (cron + safety-net + manual)
CREATE TABLE IF NOT EXISTS crm_reschedule_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source        TEXT NOT NULL CHECK (source IN ('cron','safety_net','manual')),
  checked_date  DATE NOT NULL,
  moved_count   INT  NOT NULL DEFAULT 0,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_reschedule_log_ran_at
  ON crm_reschedule_log(ran_at DESC);

ALTER TABLE crm_reschedule_log ENABLE ROW LEVEL SECURITY;

-- Lectura: cualquier usuario autenticado (para endpoint /api/crm/cron/status).
-- Writes: solo vía la función SECURITY DEFINER de abajo — ningún policy de write.
DO $$ BEGIN
  CREATE POLICY "crm_reschedule_log_read" ON crm_reschedule_log
    FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- Función: mueve cards de agenda → pizarron/contacto cuando next_contact_at
-- ya venció. Escribe historial e inserta en crm_reschedule_log.
--
-- SECURITY DEFINER: corre con privilegios del owner (postgres), bypasea RLS.
-- Con EXECUTE grant a anon/authenticated, podés invocarla desde:
--   - cron endpoint (anon key + CRON_SECRET header → supabase.rpc(...))
--   - layout safety-net (sesión de usuario → supabase.rpc(...))
--
-- Idempotente: correrla N veces el mismo día → N registros de log,
-- pero cada card solo se mueve una vez (ya no está en 'agenda' después).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_run_daily_reschedule(p_source TEXT DEFAULT 'manual')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today       DATE;
  v_due_ids     UUID[];
  v_moved_count INT := 0;
BEGIN
  IF p_source NOT IN ('cron','safety_net','manual') THEN
    RAISE EXCEPTION 'source inválido: %', p_source;
  END IF;

  v_today := (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date;

  SELECT COALESCE(array_agg(id), '{}') INTO v_due_ids
  FROM crm_cards
  WHERE current_zone = 'agenda'
    AND next_contact_at IS NOT NULL
    AND next_contact_at <= v_today;

  IF array_length(v_due_ids, 1) IS NOT NULL THEN
    v_moved_count := array_length(v_due_ids, 1);

    UPDATE crm_cards
    SET current_zone = 'pizarron',
        current_column = 'contacto'
    WHERE id = ANY(v_due_ids);

    INSERT INTO crm_card_history
      (card_id, action_type, field_changed, old_value, new_value,
       description, user_email)
    SELECT
      cid, 'auto_moved_by_date', 'current_zone', 'agenda', 'pizarron',
      'Movida automáticamente a Contacto (venció fecha de próximo contacto: '
        || v_today || ')',
      'sistema@crm'
    FROM unnest(v_due_ids) AS cid;
  END IF;

  INSERT INTO crm_reschedule_log (source, checked_date, moved_count)
  VALUES (p_source, v_today, v_moved_count);

  RETURN jsonb_build_object(
    'moved_count',  v_moved_count,
    'checked_date', v_today,
    'source',       p_source
  );

EXCEPTION WHEN OTHERS THEN
  INSERT INTO crm_reschedule_log (source, checked_date, moved_count, error_message)
  VALUES (
    p_source,
    (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date,
    0,
    SQLERRM
  );
  RAISE;
END $$;

GRANT EXECUTE ON FUNCTION public.crm_run_daily_reschedule(TEXT)
  TO anon, authenticated;
