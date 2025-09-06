-- 🔒 CRITICAL SECURITY FIX: Remove public access to user feedback data
-- This fixes the vulnerability where personal feedback could be accessed by anyone

-- 1. Drop the dangerous public policy that exposes user feedback
DROP POLICY IF EXISTS "Public feedback is viewable by everyone" ON public.user_feedback;

-- 2. Create a more secure policy for public feedback (only non-sensitive aggregated data)
-- Only allow viewing of anonymized, aggregated feedback statistics, not individual records
CREATE POLICY "Anonymous aggregated feedback stats only" 
ON public.user_feedback 
FOR SELECT 
USING (
  -- Only allow access to count and average data, not individual records
  -- This policy intentionally restricts individual record access
  false -- Temporarily block all public access until we implement proper aggregation views
);

-- 3. Ensure users can still manage their own feedback
-- Keep existing secure policies for user's own data
-- "Users can view their own feedback" - already exists and is secure
-- "Users can insert their own feedback" - already exists and is secure  
-- "Users can update their own feedback" - already exists and is secure

-- 4. Add policy for admin access (if needed for support purposes)
CREATE POLICY "Admins can view all feedback for support" 
ON public.user_feedback 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 5. Create a secure view for public statistics (if needed)
CREATE OR REPLACE VIEW public.feedback_statistics AS
SELECT 
  test_type,
  ROUND(AVG(rating::numeric), 2) as average_rating,
  COUNT(*) as total_feedback,
  COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_feedback
FROM public.user_feedback 
WHERE is_public = true
GROUP BY test_type;

-- 6. Grant public access to the statistics view only
GRANT SELECT ON public.feedback_statistics TO anon, authenticated;

-- 7. Add a comment explaining the security measure
COMMENT ON POLICY "Anonymous aggregated feedback stats only" ON public.user_feedback IS 
'Security policy: Prevents exposure of individual user feedback records to protect user privacy. Use feedback_statistics view for public data.';

-- 8. Audit log: Record this security fix
INSERT INTO public.admin_notifications (
  notification_type,
  title, 
  message,
  priority
) VALUES (
  'security_fix',
  'Critical Security Fix Applied',
  'Removed public access to individual user feedback records. Created secure aggregated view instead.',
  'high'
);