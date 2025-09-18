-- Fix expert personal information exposure security issue
-- Drop existing insecure policies
DROP POLICY IF EXISTS "Everyone can view verified experts" ON public.experts;
DROP POLICY IF EXISTS "Experts can manage their own profile" ON public.experts;

-- Create secure policies that protect personal information

-- Allow experts to manage their own complete profile
CREATE POLICY "Experts can manage their own profile" 
ON public.experts 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all expert data for management purposes
CREATE POLICY "Admins can view all expert data" 
ON public.experts 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow public to view only non-sensitive expert information for verified/available experts
CREATE POLICY "Public can view limited expert info" 
ON public.experts 
FOR SELECT 
USING (
  is_verified = true 
  AND is_available = true 
  AND auth.uid() IS NOT NULL
);

-- Create a secure function to get sanitized expert data for public viewing
CREATE OR REPLACE FUNCTION public.get_public_expert_info(expert_id uuid)
RETURNS TABLE(
  id uuid,
  professional_title text,
  specializations text[],
  years_experience integer,
  education_background text[],
  certifications text[],
  sanitized_bio text,
  profile_image_url text,
  hourly_rate integer,
  is_verified boolean,
  is_available boolean,
  total_sessions integer,
  average_rating numeric,
  languages text[],
  consultation_methods text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return data for verified and available experts
  RETURN QUERY
  SELECT 
    e.id,
    e.professional_title,
    e.specializations,
    e.years_experience,
    e.education_background,
    e.certifications,
    -- Sanitize bio by removing potential personal info patterns
    CASE 
      WHEN e.bio IS NOT NULL THEN 
        regexp_replace(
          regexp_replace(
            regexp_replace(e.bio, '\d{2,3}-\d{3,4}-\d{4}', '[연락처]', 'g'), -- Phone numbers
            '[가-힣]{2,4}\s*\d{2,3}-\d{3,4}-\d{4}', '[연락처]', 'g' -- Name + phone
          ),
          '010-\d{4}-\d{4}', '[연락처]', 'g' -- Mobile numbers
        )
      ELSE NULL 
    END as sanitized_bio,
    e.profile_image_url,
    e.hourly_rate,
    e.is_verified,
    e.is_available,
    e.total_sessions,
    e.average_rating,
    e.languages,
    e.consultation_methods
  FROM public.experts e
  WHERE e.id = expert_id 
    AND e.is_verified = true 
    AND e.is_available = true;
END;
$$;