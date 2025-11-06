-- 전문가 스케줄 테이블 (가용 시간 관리)
CREATE TABLE IF NOT EXISTS public.expert_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=일요일, 6=토요일
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- 전문가 휴무일 관리
CREATE TABLE IF NOT EXISTS public.expert_time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- 예약 테이블 (중복 방지 포함)
CREATE TABLE IF NOT EXISTS public.consultation_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  tokens_paid INTEGER NOT NULL,
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  -- 같은 전문가가 같은 시간에 중복 예약 방지
  CONSTRAINT unique_expert_booking UNIQUE (expert_id, booking_date, start_time)
);

-- 예약 상태 변경 트리거
CREATE OR REPLACE FUNCTION update_booking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    NEW.confirmed_at = now();
  END IF;
  
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consultation_bookings_updated_at
  BEFORE UPDATE ON public.consultation_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_updated_at();

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_expert_schedules_expert ON public.expert_schedules(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_time_off_expert ON public.expert_time_off(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_time_off_dates ON public.expert_time_off(expert_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_expert ON public.consultation_bookings(expert_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_user ON public.consultation_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_status ON public.consultation_bookings(status);

-- RLS 정책
ALTER TABLE public.expert_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;

-- 전문가 스케줄: 모두 볼 수 있음, 본인만 수정
CREATE POLICY "Anyone can view expert schedules"
  ON public.expert_schedules FOR SELECT
  USING (true);

CREATE POLICY "Experts can manage their own schedules"
  ON public.expert_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.experts
      WHERE experts.id = expert_schedules.expert_id
      AND experts.user_id = auth.uid()
    )
  );

-- 전문가 휴무일: 모두 볼 수 있음, 본인만 수정
CREATE POLICY "Anyone can view expert time off"
  ON public.expert_time_off FOR SELECT
  USING (true);

CREATE POLICY "Experts can manage their own time off"
  ON public.expert_time_off FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.experts
      WHERE experts.id = expert_time_off.expert_id
      AND experts.user_id = auth.uid()
    )
  );

-- 예약: 본인 예약만 보고 생성, 전문가는 자기 예약 모두 볼 수 있음
CREATE POLICY "Users can view their own bookings"
  ON public.consultation_bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Experts can view their bookings"
  ON public.consultation_bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.experts
      WHERE experts.id = consultation_bookings.expert_id
      AND experts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create bookings"
  ON public.consultation_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own bookings"
  ON public.consultation_bookings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Experts can update their bookings"
  ON public.consultation_bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.experts
      WHERE experts.id = consultation_bookings.expert_id
      AND experts.user_id = auth.uid()
    )
  );

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultation_bookings;