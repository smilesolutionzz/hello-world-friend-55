-- Update 여맥진 to 이하연 and emphasize 한점미소발달센터 본점 센터장
UPDATE public.experts
SET 
  full_name = '이하연',
  professional_title = '한점미소발달센터 본점 센터장',
  bio = '한점미소발달센터 본점 센터장으로, 20년간 언어 및 작업치료를 전문으로 해온 전문가입니다. 아동의 발달 과정을 세심하게 관찰하고 개별화된 치료 프로그램을 제공합니다.',
  updated_at = now()
WHERE full_name = '여맥진';