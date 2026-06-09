
-- Drop the insecure anon policy that exposed every report with a non-null share_token
DROP POLICY IF EXISTS "public can read by share_token" ON public.center_parent_reports;

-- Secure token-based fetch via SECURITY DEFINER RPC
CREATE OR REPLACE FUNCTION public.get_center_parent_report_by_token(_token text)
RETURNS SETOF public.center_parent_reports
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.center_parent_reports
  WHERE share_token IS NOT NULL
    AND share_token = _token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_center_parent_report_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_center_parent_report_by_token(text) TO anon, authenticated;
