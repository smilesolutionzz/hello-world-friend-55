DROP POLICY IF EXISTS center_parent_reports_insert ON public.center_parent_reports;

CREATE POLICY center_parent_reports_insert
ON public.center_parent_reports
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_center_role(center_id, ARRAY['owner'::center_role, 'admin'::center_role, 'therapist'::center_role])
);