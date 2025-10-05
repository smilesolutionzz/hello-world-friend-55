-- Update 이상록 to 특수체육 및 운동재활 전문가
UPDATE public.experts
SET 
  specializations = ARRAY['특수체육', '운동재활'],
  professional_title = '특수체육 및 운동재활 전문가',
  bio = '7년 경력의 특수체육 및 운동재활 전문가입니다. 초등, 청소년, 성인을 대상으로 전문적인 상담을 제공합니다. 전화, 화상, 온라인, 문자, 가정 상담 등 다양한 방법으로 상담이 가능합니다.'
WHERE full_name = '이상록';