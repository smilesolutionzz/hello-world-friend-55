
-- 1) Remove insecure anon-readable share_token policy
DROP POLICY IF EXISTS "public can read by share_token" ON public.center_parent_reports;
REVOKE SELECT ON public.center_parent_reports FROM anon;

-- 2) Ensure every published / draft parent report has a share_token
CREATE OR REPLACE FUNCTION public.ensure_parent_report_share_token()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.share_token IS NULL OR NEW.share_token = '' THEN
    NEW.share_token := encode(gen_random_bytes(18), 'base64');
    NEW.share_token := replace(replace(replace(NEW.share_token, '/', '_'), '+', '-'), '=', '');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_parent_report_share_token ON public.center_parent_reports;
CREATE TRIGGER trg_ensure_parent_report_share_token
  BEFORE INSERT OR UPDATE ON public.center_parent_reports
  FOR EACH ROW EXECUTE FUNCTION public.ensure_parent_report_share_token();

-- Backfill existing rows missing a share_token
UPDATE public.center_parent_reports
SET share_token = replace(replace(replace(encode(gen_random_bytes(18), 'base64'), '/', '_'), '+', '-'), '=', '')
WHERE share_token IS NULL OR share_token = '';

-- 3) Phone normalizer: digits only, strip leading country code 82 -> 0
CREATE OR REPLACE FUNCTION public.normalize_kr_phone(_p TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  digits TEXT;
BEGIN
  IF _p IS NULL THEN RETURN NULL; END IF;
  digits := regexp_replace(_p, '\D', '', 'g');
  IF digits LIKE '82%' THEN
    digits := '0' || substring(digits FROM 3);
  END IF;
  RETURN digits;
END;
$$;

-- 4) RPC: verified-guardian fetch of a parent report by share_token
--    Requires: authenticated session, JWT phone matches the linked client's guardian_phone
CREATE OR REPLACE FUNCTION public.get_parent_report_by_token(_token TEXT)
RETURNS TABLE (
  id UUID,
  center_id UUID,
  client_id UUID,
  client_name TEXT,
  center_name TEXT,
  period_start DATE,
  period_end DATE,
  period_type TEXT,
  period_yyyymm TEXT,
  title TEXT,
  status TEXT,
  ai_summary TEXT,
  ai_draft_json JSONB,
  edited_html TEXT,
  html_content TEXT,
  metrics JSONB,
  coach_comment TEXT,
  issued_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_phone TEXT;
  guardian TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'auth_required' USING ERRCODE = '42501';
  END IF;

  jwt_phone := public.normalize_kr_phone(coalesce(auth.jwt() ->> 'phone', ''));
  IF jwt_phone IS NULL OR length(jwt_phone) < 9 THEN
    RAISE EXCEPTION 'phone_required' USING ERRCODE = '42501';
  END IF;

  SELECT public.normalize_kr_phone(c.guardian_phone)
    INTO guardian
  FROM public.center_parent_reports r
  JOIN public.center_clients c ON c.id = r.client_id
  WHERE r.share_token = _token
  LIMIT 1;

  IF guardian IS NULL THEN
    RAISE EXCEPTION 'report_not_found' USING ERRCODE = '42704';
  END IF;

  IF guardian <> jwt_phone THEN
    RAISE EXCEPTION 'phone_mismatch' USING ERRCODE = '42501';
  END IF;

  -- Mark view
  UPDATE public.center_parent_reports
    SET viewed_at = now()
    WHERE share_token = _token AND viewed_at IS NULL;

  RETURN QUERY
  SELECT r.id, r.center_id, r.client_id,
         c.name AS client_name,
         co.name AS center_name,
         r.period_start, r.period_end, r.period_type, r.period_yyyymm,
         r.title, r.status, r.ai_summary, r.ai_draft_json, r.edited_html,
         r.html_content, r.metrics, r.coach_comment, r.issued_at, r.published_at
  FROM public.center_parent_reports r
  JOIN public.center_clients c ON c.id = r.client_id
  LEFT JOIN public.center_organizations co ON co.id = r.center_id
  WHERE r.share_token = _token
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_parent_report_by_token(TEXT) TO authenticated;

-- 5) RPC: lightweight pre-auth lookup (does the token exist? does the linked client have a guardian phone?)
--    Does NOT return any report content. Used so the guardian gate can show "보호자 ___ 번호로 인증" hint.
CREATE OR REPLACE FUNCTION public.peek_parent_report_token(_token TEXT)
RETURNS TABLE (exists_flag BOOLEAN, phone_hint TEXT, client_name TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  normalized TEXT;
BEGIN
  SELECT c.name AS cname, c.guardian_phone AS gphone
    INTO rec
  FROM public.center_parent_reports r
  JOIN public.center_clients c ON c.id = r.client_id
  WHERE r.share_token = _token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  normalized := public.normalize_kr_phone(rec.gphone);
  -- Mask: show last 4 digits only -> "010-****-1234"
  RETURN QUERY SELECT
    true,
    CASE
      WHEN normalized IS NULL OR length(normalized) < 4 THEN NULL
      ELSE substring(normalized FROM 1 FOR 3) || '-****-' || right(normalized, 4)
    END,
    rec.cname;
END;
$$;

GRANT EXECUTE ON FUNCTION public.peek_parent_report_token(TEXT) TO anon, authenticated;
