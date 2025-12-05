-- Add INSERT policy for test_types table so users can create new test types
CREATE POLICY "Users can insert test types"
ON public.test_types
FOR INSERT
WITH CHECK (true);

-- Add Korean test type entries (without ON CONFLICT since no unique constraint)
INSERT INTO public.test_types (name, description) 
SELECT name, description FROM (VALUES 
  ('우울증 검사', '우울증 선별 검사'),
  ('스트레스 검사', '스트레스 수준 평가'),
  ('ADHD 검사', 'ADHD 평가'),
  ('불안감 검사', '불안 장애 평가'),
  ('자존감 검사', '자존감 수준 평가'),
  ('애착 유형 검사', '애착 유형 평가'),
  ('빅파이브 성격검사', 'Big Five 성격 검사'),
  ('직업 성향 검사', '직업 적성 및 성향 검사'),
  ('영유아 발달검사', '영유아 발달 평가'),
  ('아동 심리검사', '아동/청소년 심리 검사'),
  ('성인 심리검사', '성인 심리 검사'),
  ('언어발달 검사', '언어 발달 평가')
) AS new_types(name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.test_types t WHERE t.name = new_types.name
);