
-- 01. 월별 정산 마감 락
CREATE TABLE public.center_billing_closings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL,
  period_yyyymm TEXT NOT NULL,
  closed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_by UUID,
  total_charge_krw INTEGER NOT NULL DEFAULT 0,
  total_payment_krw INTEGER NOT NULL DEFAULT 0,
  total_ar_krw INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  UNIQUE (center_id, period_yyyymm)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.center_billing_closings TO authenticated;
GRANT ALL ON public.center_billing_closings TO service_role;
ALTER TABLE public.center_billing_closings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read closings" ON public.center_billing_closings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.center_members m WHERE m.center_id = center_billing_closings.center_id AND m.user_id = auth.uid()));
CREATE POLICY "admins write closings" ON public.center_billing_closings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.center_members m WHERE m.center_id = center_billing_closings.center_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.center_members m WHERE m.center_id = center_billing_closings.center_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')));


-- 02. 바우처 청구 묶음
CREATE TABLE public.center_voucher_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL,
  period_yyyymm TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  total_amount_krw INTEGER NOT NULL DEFAULT 0,
  total_count INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  file_url TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_cvc_center_period ON public.center_voucher_claims(center_id, period_yyyymm DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.center_voucher_claims TO authenticated;
GRANT ALL ON public.center_voucher_claims TO service_role;
ALTER TABLE public.center_voucher_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read claims" ON public.center_voucher_claims FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.center_members m WHERE m.center_id = center_voucher_claims.center_id AND m.user_id = auth.uid()));
CREATE POLICY "admins write claims" ON public.center_voucher_claims FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.center_members m WHERE m.center_id = center_voucher_claims.center_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.center_members m WHERE m.center_id = center_voucher_claims.center_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')));


-- 03. 청구 라인 (회기 단위)
CREATE TABLE public.center_voucher_claim_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.center_voucher_claims(id) ON DELETE CASCADE,
  session_id UUID,
  client_id UUID,
  therapist_id UUID,
  service_date DATE NOT NULL,
  voucher_no TEXT,
  amount_krw INTEGER NOT NULL DEFAULT 0,
  copayment_krw INTEGER NOT NULL DEFAULT 0,
  subsidy_krw INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ok',
  warning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_cvci_claim ON public.center_voucher_claim_items(claim_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.center_voucher_claim_items TO authenticated;
GRANT ALL ON public.center_voucher_claim_items TO service_role;
ALTER TABLE public.center_voucher_claim_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read claim items" ON public.center_voucher_claim_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.center_voucher_claims c
    JOIN public.center_members m ON m.center_id = c.center_id
    WHERE c.id = center_voucher_claim_items.claim_id AND m.user_id = auth.uid()
  ));
CREATE POLICY "admins write claim items" ON public.center_voucher_claim_items FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.center_voucher_claims c
    JOIN public.center_members m ON m.center_id = c.center_id
    WHERE c.id = center_voucher_claim_items.claim_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.center_voucher_claims c
    JOIN public.center_members m ON m.center_id = c.center_id
    WHERE c.id = center_voucher_claim_items.claim_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')
  ));


-- 04. 부모 리포트에 보호자 공유 필드 추가
ALTER TABLE public.center_parent_reports
  ADD COLUMN IF NOT EXISTS period_yyyymm TEXT,
  ADD COLUMN IF NOT EXISTS ai_summary TEXT,
  ADD COLUMN IF NOT EXISTS coach_comment TEXT,
  ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;

-- 공유 토큰이 있으면 비로그인도 조회 가능
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='center_parent_reports' AND policyname='public can read by share_token'
  ) THEN
    EXECUTE 'GRANT SELECT ON public.center_parent_reports TO anon';
    EXECUTE $POL$CREATE POLICY "public can read by share_token" ON public.center_parent_reports FOR SELECT TO anon USING (share_token IS NOT NULL)$POL$;
  END IF;
END $$;


-- 05. updated_at 트리거
CREATE TRIGGER trg_cvc_updated BEFORE UPDATE ON public.center_voucher_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
