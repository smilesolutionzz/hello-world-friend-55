-- Update 오세은 expert specializations
UPDATE public.experts 
SET 
  specializations = ARRAY['음악치료', '놀이치료', '심리치료', '전연령재활'],
  professional_title = '음악/놀이/심리 재활 전문 치료사',
  bio = '14년 경력의 재활 전문 치료사로 음악치료, 놀이치료, 심리치료 분야에서 활동하고 있습니다. 영유아부터 성인까지 전 연령대를 대상으로 맞춤형 재활 프로그램을 제공하며, 개인별 특성에 맞는 치료 계획을 수립합니다.',
  updated_at = now()
WHERE full_name = '오세은';