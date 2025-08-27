-- 치료사 테이블 생성
CREATE TABLE public.therapists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  color_code TEXT NOT NULL DEFAULT '#22c55e',
  is_active BOOLEAN NOT NULL DEFAULT true,
  working_hours JSONB DEFAULT '{"mon": {"start": "09:00", "end": "18:00"}, "tue": {"start": "09:00", "end": "18:00"}, "wed": {"start": "09:00", "end": "18:00"}, "thu": {"start": "09:00", "end": "18:00"}, "fri": {"start": "09:00", "end": "18:00"}}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 치료 일정 테이블 생성
CREATE TABLE public.therapy_appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.institution_members(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  appointment_type TEXT NOT NULL DEFAULT '개별치료',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_appointments ENABLE ROW LEVEL SECURITY;

-- 치료사 정책
CREATE POLICY "Institution admins can manage their therapists"
ON public.therapists FOR ALL
USING (
  institution_id IN (
    SELECT id FROM public.institutions 
    WHERE admin_id = auth.uid()
  )
);

-- 치료 일정 정책
CREATE POLICY "Institution admins can manage their appointments"
ON public.therapy_appointments FOR ALL
USING (
  institution_id IN (
    SELECT id FROM public.institutions 
    WHERE admin_id = auth.uid()
  )
);

-- 업데이트 트리거 추가
CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON public.therapists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_therapy_appointments_updated_at
  BEFORE UPDATE ON public.therapy_appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();