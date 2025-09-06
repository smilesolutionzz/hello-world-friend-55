-- 🔒 CRITICAL SECURITY FIX: Remove public access to user feedback data
-- This fixes the vulnerability where personal feedback could be accessed by anyone

-- 1. Drop the dangerous public policy that exposes user feedback
DROP POLICY IF EXISTS "Public feedback is viewable by everyone" ON public.user_feedback;

-- 2. Add policy for admin access (if needed for support purposes)
CREATE POLICY "Admins can view all feedback for support" 
ON public.user_feedback 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Create a secure view for public statistics (if needed)
CREATE OR REPLACE VIEW public.feedback_statistics AS
SELECT 
  test_type,
  ROUND(AVG(rating::numeric), 2) as average_rating,
  COUNT(*) as total_feedback,
  COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_feedback
FROM public.user_feedback 
WHERE is_public = true
GROUP BY test_type;

-- 4. Grant public access to the statistics view only
GRANT SELECT ON public.feedback_statistics TO anon, authenticated;