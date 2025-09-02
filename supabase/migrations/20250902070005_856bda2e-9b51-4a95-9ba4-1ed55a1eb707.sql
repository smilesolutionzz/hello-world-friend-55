-- 무통장입금 요청 테이블
CREATE TABLE public.bank_transfer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  depositor_name TEXT NOT NULL,
  transfer_amount INTEGER NOT NULL,
  requested_tokens INTEGER NOT NULL,
  bank_name TEXT,
  transfer_date DATE,
  request_note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  processed_at TIMESTAMPTZ,
  processed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 정책
ALTER TABLE public.bank_transfer_requests ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 요청만 생성/조회 가능
CREATE POLICY "Users can create their own transfer requests" 
ON public.bank_transfer_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own transfer requests" 
ON public.bank_transfer_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- 관리자는 모든 요청 관리 가능
CREATE POLICY "Admins can manage all transfer requests" 
ON public.bank_transfer_requests 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));