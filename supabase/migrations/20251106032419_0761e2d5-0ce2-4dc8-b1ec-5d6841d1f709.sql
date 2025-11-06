-- 제휴기관 예약 테이블 생성
CREATE TABLE IF NOT EXISTS public.institution_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  institution_id TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  consultation_type TEXT NOT NULL DEFAULT 'institution',
  notes TEXT,
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.institution_bookings ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 예약만 볼 수 있도록
CREATE POLICY "Users can view their own institution bookings"
ON public.institution_bookings
FOR SELECT
USING (auth.uid() = user_id);

-- 사용자가 자신의 예약을 생성할 수 있도록
CREATE POLICY "Users can create their own institution bookings"
ON public.institution_bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 사용자가 자신의 예약을 수정할 수 있도록
CREATE POLICY "Users can update their own institution bookings"
ON public.institution_bookings
FOR UPDATE
USING (auth.uid() = user_id);

-- 사용자가 자신의 예약을 삭제할 수 있도록
CREATE POLICY "Users can delete their own institution bookings"
ON public.institution_bookings
FOR DELETE
USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_institution_bookings_updated_at
BEFORE UPDATE ON public.institution_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 인덱스 생성
CREATE INDEX idx_institution_bookings_user_id ON public.institution_bookings(user_id);
CREATE INDEX idx_institution_bookings_institution_id ON public.institution_bookings(institution_id);
CREATE INDEX idx_institution_bookings_booking_date ON public.institution_bookings(booking_date);
CREATE INDEX idx_institution_bookings_status ON public.institution_bookings(status);