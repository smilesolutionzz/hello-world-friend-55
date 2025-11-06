-- Consultation packages table
CREATE TABLE IF NOT EXISTS public.consultation_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sessions_count INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  price_per_session INTEGER NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User purchased packages
CREATE TABLE IF NOT EXISTS public.user_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  package_id UUID NOT NULL REFERENCES public.consultation_packages(id),
  sessions_remaining INTEGER NOT NULL,
  sessions_total INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Waitlist table
CREATE TABLE IF NOT EXISTS public.booking_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  expert_id UUID NOT NULL REFERENCES public.experts(id),
  preferred_date DATE NOT NULL,
  preferred_time_start TIME,
  preferred_time_end TIME,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'booked', 'expired')),
  notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Quick consultation flag
ALTER TABLE public.consultation_bookings ADD COLUMN IF NOT EXISTS is_quick_consultation BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.consultation_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_waitlist ENABLE ROW LEVEL SECURITY;

-- Packages policies
CREATE POLICY "Anyone can view active packages" ON public.consultation_packages FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage packages" ON public.consultation_packages FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- User packages policies
CREATE POLICY "Users can view own packages" ON public.user_packages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create packages" ON public.user_packages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update packages" ON public.user_packages FOR UPDATE USING (true);

-- Waitlist policies
CREATE POLICY "Users can view own waitlist" ON public.booking_waitlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create waitlist entries" ON public.booking_waitlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own waitlist" ON public.booking_waitlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own waitlist" ON public.booking_waitlist FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Experts can view their waitlist" ON public.booking_waitlist FOR SELECT USING (expert_id IN (SELECT id FROM public.experts WHERE user_id = auth.uid()));

-- Insert default packages
INSERT INTO public.consultation_packages (name, description, sessions_count, total_tokens, price_per_session, discount_percentage) VALUES
('스타터 패키지', '5회 상담 패키지 - 10% 할인', 5, 450, 90, 10),
('베스트 패키지', '10회 상담 패키지 - 20% 할인', 10, 800, 80, 20),
('프리미엄 패키지', '20회 상담 패키지 - 30% 할인', 20, 1400, 70, 30)
ON CONFLICT DO NOTHING;