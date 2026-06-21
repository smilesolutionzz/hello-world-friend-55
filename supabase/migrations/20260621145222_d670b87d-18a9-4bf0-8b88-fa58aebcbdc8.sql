
CREATE TABLE IF NOT EXISTS public.center_activity_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  meta jsonb DEFAULT '{}'::jsonb,
  actor_user_id uuid,
  read_by uuid[] NOT NULL DEFAULT '{}'::uuid[],
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.center_activity_notifications TO authenticated;
GRANT ALL ON public.center_activity_notifications TO service_role;

CREATE INDEX IF NOT EXISTS idx_can_center_created ON public.center_activity_notifications (center_id, created_at DESC);

ALTER TABLE public.center_activity_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "center members read notifications"
  ON public.center_activity_notifications FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.center_members m WHERE m.center_id = center_activity_notifications.center_id AND m.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "center members mark read"
  ON public.center_activity_notifications FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.center_members m WHERE m.center_id = center_activity_notifications.center_id AND m.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.center_members m WHERE m.center_id = center_activity_notifications.center_id AND m.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.center_activity_notifications;

-- 트리거 함수: 일정 변경 → 알림 자동 생성
CREATE OR REPLACE FUNCTION public.tg_center_session_notify()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client text;
  v_therapist text;
  v_program text;
  v_actor uuid := auth.uid();
  v_type text;
  v_title text;
  v_body text;
  v_row record;
  v_status_changed boolean;
BEGIN
  IF TG_OP = 'DELETE' THEN v_row := OLD; ELSE v_row := NEW; END IF;

  SELECT name INTO v_client FROM public.center_clients WHERE id = v_row.client_id;
  SELECT name INTO v_therapist FROM public.center_therapists WHERE id = v_row.therapist_id;
  SELECT name INTO v_program FROM public.center_programs WHERE id = v_row.program_id;

  v_client := COALESCE(v_client, '이용자');
  v_therapist := COALESCE(v_therapist, '미배정');
  v_program := COALESCE(v_program, '일정');

  IF TG_OP = 'INSERT' THEN
    v_type := 'session_created';
    v_title := '[' || v_program || '] ' || v_client;
    v_body := v_therapist || '님이 [' || to_char(v_row.session_date, 'MM-DD') || ' ' || COALESCE(to_char(v_row.start_time, 'HH24:MI'), '--:--') || '] 일정을 등록하였습니다.';
  ELSIF TG_OP = 'UPDATE' THEN
    v_status_changed := (OLD.status IS DISTINCT FROM NEW.status);
    IF v_status_changed AND NEW.status::text IN ('cancelled', 'cancelled_voucher', 'cancelled_carry', 'no_show') THEN
      v_type := 'session_cancelled';
      v_title := '[' || v_program || '] ' || v_client;
      v_body := v_therapist || '님이 [' || to_char(NEW.session_date, 'MM-DD') || ' ' || COALESCE(to_char(NEW.start_time, 'HH24:MI'), '--:--') || '] 일정을 취소 상태로 변경하였습니다.';
    ELSIF (OLD.session_date IS DISTINCT FROM NEW.session_date) OR (OLD.start_time IS DISTINCT FROM NEW.start_time) OR (OLD.therapist_id IS DISTINCT FROM NEW.therapist_id) THEN
      v_type := 'session_updated';
      v_title := '[' || v_program || '] ' || v_client;
      v_body := v_therapist || '님이 [' || to_char(NEW.session_date, 'MM-DD') || ' ' || COALESCE(to_char(NEW.start_time, 'HH24:MI'), '--:--') || '] 일정을 변경하였습니다.';
    ELSE
      RETURN NEW;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_type := 'session_deleted';
    v_title := '[' || v_program || '] ' || v_client;
    v_body := v_therapist || '님이 [' || to_char(OLD.session_date, 'MM-DD') || ' ' || COALESCE(to_char(OLD.start_time, 'HH24:MI'), '--:--') || '] 일정을 삭제하였습니다.';
  END IF;

  INSERT INTO public.center_activity_notifications (center_id, type, title, body, link, meta, actor_user_id)
  VALUES (
    v_row.center_id,
    v_type,
    v_title,
    v_body,
    '/b2b-center/app/schedule',
    jsonb_build_object('session_id', v_row.id, 'client_id', v_row.client_id, 'therapist_id', v_row.therapist_id, 'session_date', v_row.session_date, 'start_time', v_row.start_time),
    v_actor
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_center_session_notify_ins ON public.center_sessions;
CREATE TRIGGER trg_center_session_notify_ins
  AFTER INSERT ON public.center_sessions
  FOR EACH ROW EXECUTE FUNCTION public.tg_center_session_notify();

DROP TRIGGER IF EXISTS trg_center_session_notify_upd ON public.center_sessions;
CREATE TRIGGER trg_center_session_notify_upd
  AFTER UPDATE ON public.center_sessions
  FOR EACH ROW EXECUTE FUNCTION public.tg_center_session_notify();

DROP TRIGGER IF EXISTS trg_center_session_notify_del ON public.center_sessions;
CREATE TRIGGER trg_center_session_notify_del
  AFTER DELETE ON public.center_sessions
  FOR EACH ROW EXECUTE FUNCTION public.tg_center_session_notify();

-- 읽음 처리 RPC
CREATE OR REPLACE FUNCTION public.mark_center_notifications_read(_ids uuid[])
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.center_activity_notifications
  SET read_by = (
    SELECT ARRAY(SELECT DISTINCT unnest(read_by || ARRAY[auth.uid()]))
  )
  WHERE id = ANY(_ids)
    AND NOT (auth.uid() = ANY(read_by));
$$;

GRANT EXECUTE ON FUNCTION public.mark_center_notifications_read(uuid[]) TO authenticated;
