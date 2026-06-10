-- Drop the existing permissive read/update/delete policies
DROP POLICY IF EXISTS leads_auth_read ON public.leads;
DROP POLICY IF EXISTS leads_auth_update ON public.leads;
DROP POLICY IF EXISTS leads_auth_delete ON public.leads;

-- Admin: full visibility
CREATE POLICY leads_admin_select ON public.leads
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY leads_admin_update ON public.leads
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY leads_admin_delete ON public.leads
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Center members: only their own center
CREATE POLICY leads_center_select ON public.leads
  FOR SELECT TO authenticated
  USING (
    center_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.center_members m
      WHERE m.center_id = leads.center_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY leads_center_update ON public.leads
  FOR UPDATE TO authenticated
  USING (
    center_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.center_members m
      WHERE m.center_id = leads.center_id AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    center_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.center_members m
      WHERE m.center_id = leads.center_id AND m.user_id = auth.uid()
    )
  );