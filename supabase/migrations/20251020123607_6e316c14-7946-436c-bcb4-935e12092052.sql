-- Update 이기훈 expert profile to APA발달센터
UPDATE public.experts 
SET 
  professional_title = 'APA발달센터 기관장',
  bio = '특수체육, 발달재활, 행동치료, 부모상담 등 폭넓은 전문성을 보유하고 있습니다.',
  specializations = ARRAY['특수체육', '발달재활', '행동치료', '부모상담'],
  updated_at = now()
WHERE id = '00000000-0000-0000-0000-000000000003';