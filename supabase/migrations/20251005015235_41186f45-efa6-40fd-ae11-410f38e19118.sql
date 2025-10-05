-- Update 이하연 expert to art therapy and psychological counseling specialist
UPDATE public.experts
SET 
  specializations = ARRAY['미술치료', '심리상담', '성리내상담'],
  professional_title = '미술치료 및 심리상담 전문가',
  bio = '한적미스발달센터 본점, 세티장으로 다년간 여어 및 작업치료를 전문으로 해온 전문가입니다. 아동의 발달 과정을 세심하게 관찰하고 개별화된 치료 프로그램을 제공합니다.',
  years_experience = 5,
  hourly_rate = 200000,
  updated_at = now()
WHERE full_name = '이하연';