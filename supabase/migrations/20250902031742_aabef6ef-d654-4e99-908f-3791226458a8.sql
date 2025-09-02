-- 전문가 프로필 테이블
CREATE TABLE public.experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  professional_title TEXT NOT NULL,
  license_number TEXT,
  specializations TEXT[] NOT NULL DEFAULT '{}',
  years_experience INTEGER NOT NULL DEFAULT 0,
  education_background TEXT[],
  certifications TEXT[],
  bio TEXT,
  profile_image_url TEXT,
  hourly_rate INTEGER NOT NULL DEFAULT 50000, -- 원 단위
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  total_sessions INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0.00,
  languages TEXT[] DEFAULT '{"Korean"}',
  consultation_methods TEXT[] DEFAULT '{"text"}', -- text, voice, video
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 전문가 가능 시간 테이블
CREATE TABLE public.expert_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(expert_id, day_of_week, start_time, end_time)
);

-- 상담 예약 테이블
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  chat_room_id UUID REFERENCES public.chat_rooms(id),
  consultation_type TEXT NOT NULL DEFAULT 'text', -- text, voice, video
  scheduled_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, in_progress, completed, cancelled
  price INTEGER NOT NULL, -- 토큰 또는 원 단위
  payment_method TEXT DEFAULT 'tokens', -- tokens, cash
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 전문가 수익 테이블
CREATE TABLE public.expert_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- 전문가가 받을 금액
  commission_rate NUMERIC(5,2) DEFAULT 30.00, -- 플랫폼 수수료율 (%)
  platform_fee INTEGER NOT NULL, -- 플랫폼 수수료
  expert_earning INTEGER NOT NULL, -- 전문가 실수익
  status TEXT DEFAULT 'pending', -- pending, paid, cancelled
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_earnings ENABLE ROW LEVEL SECURITY;

-- 전문가 프로필 정책
CREATE POLICY "Experts can manage their own profile" ON public.experts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view verified experts" ON public.experts
  FOR SELECT USING (is_verified = true AND is_available = true);

-- 전문가 가능시간 정책  
CREATE POLICY "Experts can manage their availability" ON public.expert_availability
  FOR ALL USING (
    expert_id IN (SELECT id FROM public.experts WHERE user_id = auth.uid())
  );

CREATE POLICY "Everyone can view expert availability" ON public.expert_availability
  FOR SELECT USING (is_active = true);

-- 상담 정책
CREATE POLICY "Users can view their own consultations" ON public.consultations
  FOR SELECT USING (
    auth.uid() = user_id OR 
    expert_id IN (SELECT id FROM public.experts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create consultations" ON public.consultations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and experts can update their consultations" ON public.consultations
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    expert_id IN (SELECT id FROM public.experts WHERE user_id = auth.uid())
  );

-- 전문가 수익 정책
CREATE POLICY "Experts can view their earnings" ON public.expert_earnings
  FOR SELECT USING (
    expert_id IN (SELECT id FROM public.experts WHERE user_id = auth.uid())
  );

-- 트리거 함수들
CREATE OR REPLACE FUNCTION update_expert_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_consultation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER experts_updated_at
  BEFORE UPDATE ON public.experts
  FOR EACH ROW
  EXECUTE FUNCTION update_expert_updated_at();

CREATE TRIGGER consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_updated_at();

-- 전문가 등급 업데이트 함수
CREATE OR REPLACE FUNCTION update_expert_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- 상담 완료시 전문가 통계 업데이트
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.experts 
    SET 
      total_sessions = total_sessions + 1,
      average_rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM public.consultations 
        WHERE expert_id = NEW.expert_id AND rating IS NOT NULL
      )
    WHERE id = NEW.expert_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_expert_stats_trigger
  AFTER UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_expert_stats();