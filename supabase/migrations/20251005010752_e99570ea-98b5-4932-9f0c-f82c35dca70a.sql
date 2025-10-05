-- Update expert profile images with asset paths
UPDATE public.experts 
SET profile_image_url = '/src/assets/expert-jang-hotak.jpg',
    updated_at = now()
WHERE full_name = '장호탁';

UPDATE public.experts 
SET profile_image_url = '/src/assets/expert-kim-sungil.jpg',
    updated_at = now()
WHERE full_name = '김선길';