-- 무통장 입금 신청 테이블 생성
CREATE TABLE IF NOT EXISTS public.bank_transfer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  depositor_name TEXT NOT NULL,
  transfer_amount INTEGER NOT NULL,
  requested_tokens INTEGER DEFAULT 0,
  bank_name TEXT,
  transfer_date DATE,
  request_note TEXT,
  request_type TEXT NOT NULL DEFAULT 'token_purchase',
  subscription_plan_id TEXT,
  subscription_duration_months INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.bank_transfer_requests ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 신청만 생성 가능
CREATE POLICY "Users can create their own transfer requests"
ON public.bank_transfer_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 신청만 조회 가능
CREATE POLICY "Users can view their own transfer requests"
ON public.bank_transfer_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 관리자는 모든 신청 조회 가능
CREATE POLICY "Admins can view all transfer requests"
ON public.bank_transfer_requests
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 관리자는 모든 신청 업데이트 가능
CREATE POLICY "Admins can update all transfer requests"
ON public.bank_transfer_requests
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 인덱스 생성
CREATE INDEX idx_bank_transfer_requests_user_id ON public.bank_transfer_requests(user_id);
CREATE INDEX idx_bank_transfer_requests_status ON public.bank_transfer_requests(status);
CREATE INDEX idx_bank_transfer_requests_created_at ON public.bank_transfer_requests(created_at DESC);