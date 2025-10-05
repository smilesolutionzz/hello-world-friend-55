-- Update expert rates to per-session pricing
UPDATE public.experts
SET hourly_rate = 100000
WHERE full_name = '이수석';

UPDATE public.experts
SET hourly_rate = 50000
WHERE full_name = '이하연';