-- Update 송세영 to 송성목
UPDATE public.experts
SET 
  full_name = '송성목',
  updated_at = now()
WHERE full_name = '송세영';