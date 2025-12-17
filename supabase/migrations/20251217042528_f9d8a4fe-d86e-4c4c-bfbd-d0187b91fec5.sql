-- PMF 검증을 위한 이벤트 추적 테이블
CREATE TABLE public.pmf_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB,
  page_path TEXT,
  user_segment TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  user_agent TEXT,
  screen_size TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PMF 피드백 (NPS 포함) 테이블
CREATE TABLE public.pmf_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
  feedback_text TEXT,
  would_pay BOOLEAN,
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.pmf_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmf_feedback ENABLE ROW LEVEL SECURITY;

-- PMF 이벤트는 누구나 삽입 가능 (익명 추적)
CREATE POLICY "Anyone can insert pmf events" 
ON public.pmf_events FOR INSERT 
WITH CHECK (true);

-- PMF 이벤트는 관리자만 조회 가능
CREATE POLICY "Only admins can view pmf events" 
ON public.pmf_events FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- PMF 피드백은 누구나 삽입 가능
CREATE POLICY "Anyone can insert pmf feedback" 
ON public.pmf_feedback FOR INSERT 
WITH CHECK (true);

-- 본인 피드백 조회 가능
CREATE POLICY "Users can view own feedback" 
ON public.pmf_feedback FOR SELECT 
USING (auth.uid() = user_id);

-- 관리자는 모든 피드백 조회 가능
CREATE POLICY "Admins can view all feedback" 
ON public.pmf_feedback FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- 인덱스 생성
CREATE INDEX idx_pmf_events_timestamp ON public.pmf_events(timestamp);
CREATE INDEX idx_pmf_events_event_type ON public.pmf_events(event_type);
CREATE INDEX idx_pmf_feedback_created_at ON public.pmf_feedback(created_at);
CREATE INDEX idx_pmf_feedback_nps ON public.pmf_feedback(nps_score);