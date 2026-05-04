-- B2B 리드 후속 메일 큐 (D+1 자료 안내, D+3 케이스 스터디)
CREATE TABLE public.b2b_followup_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID,
  recipient_email TEXT NOT NULL,
  contact_name TEXT,
  institution_name TEXT,
  followup_type TEXT NOT NULL CHECK (followup_type IN ('resources_d1', 'case_studies_d3')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'skipped', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_b2b_followup_due
  ON public.b2b_followup_queue (scheduled_at)
  WHERE status = 'pending';

CREATE UNIQUE INDEX idx_b2b_followup_unique
  ON public.b2b_followup_queue (inquiry_id, followup_type)
  WHERE inquiry_id IS NOT NULL;

ALTER TABLE public.b2b_followup_queue ENABLE ROW LEVEL SECURITY;

-- 누구나 enqueue 가능 (notify-b2b-inquiry가 호출)
CREATE POLICY "Anyone can enqueue followup"
  ON public.b2b_followup_queue FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 관리자만 조회/관리
CREATE POLICY "Admins can view followup queue"
  ON public.b2b_followup_queue FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage followup queue"
  ON public.b2b_followup_queue FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));