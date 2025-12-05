-- Add MBTI test type if not exists
INSERT INTO public.test_types (name, description) 
SELECT 'MBTI 검사', 'MBTI 성격 유형 검사'
WHERE NOT EXISTS (
  SELECT 1 FROM public.test_types WHERE name = 'MBTI 검사'
);