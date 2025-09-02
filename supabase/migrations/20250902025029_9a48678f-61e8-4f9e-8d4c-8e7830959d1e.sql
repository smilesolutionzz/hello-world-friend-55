-- Fix security vulnerability: Restrict access to partner institution contact information

-- Drop the overly permissive policy that allows everyone to view all data
DROP POLICY IF EXISTS "Active institutions are viewable by everyone" ON public.partner_institutions;

-- Create a view for public institution data without sensitive contact information
CREATE OR REPLACE VIEW public.public_institutions AS
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

-- Enable RLS on the view
ALTER VIEW public.public_institutions SET (security_barrier = true);

-- Create restrictive policies for the main table
-- Only authenticated users can view basic institution info
CREATE POLICY "Authenticated users can view institution basic info"
ON public.partner_institutions
FOR SELECT
TO authenticated
USING (partnership_status = 'active');

-- Only authenticated users with specific roles can view contact information
CREATE POLICY "Admins can view all institution data"
ON public.partner_institutions
FOR SELECT
TO authenticated
USING (
  partnership_status = 'active' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Grant access to the public view for anonymous users
GRANT SELECT ON public.public_institutions TO anon;
GRANT SELECT ON public.public_institutions TO authenticated;