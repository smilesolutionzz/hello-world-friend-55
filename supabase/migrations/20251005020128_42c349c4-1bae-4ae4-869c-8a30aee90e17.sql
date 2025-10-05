-- Add AIHPRO founder Lee Su-seok as main featured expert
-- First, add featured columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experts' AND column_name = 'is_featured') THEN
    ALTER TABLE public.experts ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'experts' AND column_name = 'featured_order') THEN
    ALTER TABLE public.experts ADD COLUMN featured_order integer DEFAULT 999;
  END IF;
END $$;

-- Insert the main featured expert
INSERT INTO public.experts (
  full_name,
  specializations,
  consultation_methods,
  education_background,
  years_experience,
  hourly_rate,
  profile_image_url,
  is_verified,
  is_available,
  bio,
  professional_title,
  is_featured,
  featured_order
) VALUES (
  '이수석',
  ARRAY['특수체육', '발달재활', '심리상담'],
  ARRAY['카톡상담', '화상상담', '대면상담'],
  ARRAY['석사 학위'],
  13,
  250000,
  '/src/assets/expert-lee-suseok.jpg',
  true,
  true,
  'AIHPRO 창립자로서 13년간 5000명 이상의 아동과 학부모를 대상으로 상담해왔습니다. 특수체육, 발달재활, 심리상담 등 다양한 분야에서 전문성을 인정받았으며, EBS 출연 경험을 통해 검증된 전문가입니다. 정확한 아동 파악과 맞춤형 자문을 제공합니다.',
  'AIHPRO 창립자',
  true,
  1
);