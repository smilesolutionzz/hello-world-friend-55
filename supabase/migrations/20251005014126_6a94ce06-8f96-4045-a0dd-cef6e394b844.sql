-- Update 박원묵 to 백경열 and change professional title
UPDATE public.experts
SET 
  full_name = '백경열',
  professional_title = '특수체육/행동발달 전문가',
  specializations = ARRAY['특수체육', '행동발달', '감각통합'],
  bio = '특수체육 및 행동발달 전문가로, 아동의 신체 발달과 행동 개선을 위한 맞춤형 프로그램을 제공합니다. 감각통합 치료와 운동 발달 분야에서 풍부한 경험을 보유하고 있습니다.',
  updated_at = now()
WHERE full_name = '박원묵';