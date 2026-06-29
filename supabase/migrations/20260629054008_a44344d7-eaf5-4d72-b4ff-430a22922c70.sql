
DROP POLICY IF EXISTS leads_center_select ON public.leads;
DROP POLICY IF EXISTS leads_center_update ON public.leads;

CREATE POLICY leads_center_select ON public.leads
  FOR SELECT TO authenticated
  USING (
    center_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.center_members m
      WHERE m.center_id = leads.center_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner'::center_role, 'admin'::center_role)
    )
  );

CREATE POLICY leads_center_update ON public.leads
  FOR UPDATE TO authenticated
  USING (
    center_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.center_members m
      WHERE m.center_id = leads.center_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner'::center_role, 'admin'::center_role)
    )
  )
  WITH CHECK (
    center_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.center_members m
      WHERE m.center_id = leads.center_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner'::center_role, 'admin'::center_role)
    )
  );

GRANT SELECT ON public.payments TO authenticated;

CREATE POLICY payments_user_select ON public.payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.token_orders o
      WHERE o.order_id = payments.order_id
        AND o.user_id = auth.uid()
    )
  );
