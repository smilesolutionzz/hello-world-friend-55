-- Fix the security definer view issue by removing that property
DROP VIEW IF EXISTS public.public_institutions;

-- Create a regular view (not security definer) for public institution data
CREATE VIEW public.public_institutions AS
SELECT 
  id,
  name,
  institution_type,
  address,
  description,
  website_url,
  profile_image_url,
  gallery_images,
  services_offered,
  specializations,
  facilities,
  accessibility_features,
  operating_hours,
  parking_available,
  rating,
  review_count,
  total_experts,
  established_year,
  latitude,
  longitude,
  partnership_status,
  created_at,
  updated_at
FROM public.partner_institutions
WHERE partnership_status = 'active';

-- Grant access to the public view
GRANT SELECT ON public.public_institutions TO anon;
GRANT SELECT ON public.public_institutions TO authenticated;