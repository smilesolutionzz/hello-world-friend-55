-- Update expert ordering: 이수석(1), 장호탁(2), 김선길(3)
UPDATE public.experts
SET featured_order = 1
WHERE full_name = '이수석';

UPDATE public.experts
SET featured_order = 2
WHERE full_name = '장호탁';

UPDATE public.experts
SET featured_order = 3
WHERE full_name = '김선길';