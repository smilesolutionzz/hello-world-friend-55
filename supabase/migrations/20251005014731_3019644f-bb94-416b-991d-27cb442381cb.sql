-- Update 백경열 info and delete 4 experts
-- 1. Update 백경열
UPDATE public.experts
SET 
  specializations = ARRAY['특수체육', '행동발달'],
  bio = '특수체육 및 행동발달 전문가로, 아동의 신체 발달과 행동 개선을 위한 맞춤형 프로그램을 제공합니다. 2년간의 데이터를 보유하고 있습니다.',
  updated_at = now()
WHERE full_name = '백경열';

-- 2. Delete 4 experts
DELETE FROM public.experts
WHERE full_name IN ('예수여', '송성목', '예원묵', '허순한');