-- B2B Demo / Trial requests
CREATE TABLE IF NOT EXISTS public.b2b_demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('school','counseling','welfare','corporate')),
  institution_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  employee_count INTEGER,
  request_type TEXT NOT NULL DEFAULT 'free_trial' CHECK (request_type IN ('free_trial','paid_inquiry','demo_download')),
  message TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','contacted','converted','rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.b2b_demo_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can create a request (including unauthenticated guests)
CREATE POLICY "Anyone can submit b2b demo request"
  ON public.b2b_demo_requests FOR INSERT
  WITH CHECK (true);

-- Submitter can view own requests when authenticated
CREATE POLICY "Users can view their own b2b demo requests"
  ON public.b2b_demo_requests FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Admins manage all
CREATE POLICY "Admins can view all b2b demo requests"
  ON public.b2b_demo_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update b2b demo requests"
  ON public.b2b_demo_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE TRIGGER trg_b2b_demo_requests_updated_at
  BEFORE UPDATE ON public.b2b_demo_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_b2b_demo_requests_status ON public.b2b_demo_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_b2b_demo_requests_email ON public.b2b_demo_requests(contact_email);