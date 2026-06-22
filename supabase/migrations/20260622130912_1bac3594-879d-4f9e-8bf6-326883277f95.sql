
-- Extend voucher_audit_items with source citation + generation capability + stable code
ALTER TABLE public.voucher_audit_items
  ADD COLUMN IF NOT EXISTS item_code TEXT,
  ADD COLUMN IF NOT EXISTS source_citation TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'common', -- 'official' | 'common' | 'custom'
  ADD COLUMN IF NOT EXISTS can_generate_doc BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS generate_prompt TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS voucher_audit_items_code_uniq
  ON public.voucher_audit_items(voucher_type_id, item_code) WHERE item_code IS NOT NULL;

-- Per-center checklist state
CREATE TABLE IF NOT EXISTS public.center_audit_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL,
  audit_item_id UUID NOT NULL REFERENCES public.voucher_audit_items(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | done | na
  note TEXT,
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (center_id, audit_item_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.center_audit_state TO authenticated;
GRANT ALL ON public.center_audit_state TO service_role;

ALTER TABLE public.center_audit_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Center members read audit state"
  ON public.center_audit_state FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.center_members m WHERE m.center_id = center_audit_state.center_id AND m.user_id = auth.uid()));

CREATE POLICY "Center members write audit state"
  ON public.center_audit_state FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.center_members m WHERE m.center_id = center_audit_state.center_id AND m.user_id = auth.uid()));

CREATE POLICY "Center members update audit state"
  ON public.center_audit_state FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.center_members m WHERE m.center_id = center_audit_state.center_id AND m.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.center_members m WHERE m.center_id = center_audit_state.center_id AND m.user_id = auth.uid()));

CREATE POLICY "Center members delete audit state"
  ON public.center_audit_state FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.center_members m WHERE m.center_id = center_audit_state.center_id AND m.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS center_audit_state_center_idx ON public.center_audit_state(center_id);
