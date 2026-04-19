-- ============================================================================
-- Ajuste de crm_run_daily_reschedule:
--
--   Antes: movía agenda → pizarrón solo cuando la fecha ya había pasado
--          (next_contact_at <= hoy)
--
--   Ahora: mueve cuando quedan ≤ 20 días a la fecha de próximo contacto
--          (incluye vencidas y futuras hasta 20 días)
--
-- Espeja la regla del formulario "Postergar cliente":
--   · > 20 días al futuro → Agenda
--   · ≤ 20 días           → Contacto (pizarrón)
--
-- Sin fecha (NULL) no se toca.
-- Ya aplicada en prod via MCP apply_migration. Idempotente.
-- ============================================================================

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
    AND next_contact_at <= v_today + INTERVAL '20 days';

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
      c.id,
      'auto_moved_by_date',
      'current_zone',
      'agenda',
      'pizarron',
      'Movida automáticamente a Contacto — ' ||
        CASE
          WHEN c.next_contact_at < v_today
            THEN 'venció hace ' || (v_today - c.next_contact_at) || ' ' ||
                 CASE WHEN (v_today - c.next_contact_at) = 1 THEN 'día' ELSE 'días' END
          WHEN c.next_contact_at = v_today
            THEN 'próximo contacto hoy'
          ELSE 'quedan ' || (c.next_contact_at - v_today) || ' ' ||
               CASE WHEN (c.next_contact_at - v_today) = 1 THEN 'día' ELSE 'días' END ||
               ' al próximo contacto'
        END,
      'sistema@crm'
    FROM crm_cards c
    WHERE c.id = ANY(v_due_ids);
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
