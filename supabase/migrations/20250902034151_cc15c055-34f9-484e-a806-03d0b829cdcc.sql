-- 전문가 고용 계약 테이블 생성
CREATE TABLE public.expert_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'monthly', -- monthly, quarterly, semi_annual
  duration_months INTEGER NOT NULL DEFAULT 1,
  hourly_rate INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  sessions_per_week INTEGER NOT NULL DEFAULT 2,
  additional_services JSONB DEFAULT '[]'::JSONB,
  contract_start_date DATE NOT NULL,
  contract_end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, completed, cancelled
  stripe_subscription_id TEXT,
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  contract_terms JSONB DEFAULT '{}'::JSONB,
  notes TEXT
);

-- RLS 정책 설정
ALTER TABLE public.expert_contracts ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 계약만 볼 수 있음
CREATE POLICY "Users can view their own contracts" 
ON public.expert_contracts 
FOR SELECT 
USING (auth.uid() = user_id);

-- 사용자는 자신의 계약을 생성할 수 있음
CREATE POLICY "Users can create their own contracts" 
ON public.expert_contracts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 계약을 업데이트할 수 있음
CREATE POLICY "Users can update their own contracts" 
ON public.expert_contracts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 전문가는 자신과 관련된 계약을 볼 수 있음
CREATE POLICY "Experts can view their contracts" 
ON public.expert_contracts 
FOR SELECT 
USING (expert_id IN (
  SELECT id FROM experts WHERE user_id = auth.uid()
));

-- 전문가는 자신의 계약 상태를 업데이트할 수 있음
CREATE POLICY "Experts can update contract status" 
ON public.expert_contracts 
FOR UPDATE 
USING (expert_id IN (
  SELECT id FROM experts WHERE user_id = auth.uid()
));

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER update_expert_contracts_updated_at
  BEFORE UPDATE ON public.expert_contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();