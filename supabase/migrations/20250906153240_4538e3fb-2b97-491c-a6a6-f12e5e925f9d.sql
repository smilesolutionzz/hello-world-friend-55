-- Fix critical security vulnerability: Personal content exposed to public
-- Replace overly permissive SELECT policies with proper access controls

-- Drop existing overly permissive SELECT policies
DROP POLICY IF EXISTS "Users can view all growth stories" ON public.growth_stories;
DROP POLICY IF EXISTS "Users can view all challenge posts" ON public.challenge_posts;  
DROP POLICY IF EXISTS "Users can view all reversal stories" ON public.reversal_stories;

-- Create secure SELECT policies for growth_stories
-- Users can only view their own stories OR stories from users they follow OR featured/approved stories
CREATE POLICY "Users can view growth stories securely" ON public.growth_stories
FOR SELECT USING (
  auth.uid() = user_id OR  -- Own stories
  (
    -- Only authenticated users can view others' stories
    auth.uid() IS NOT NULL AND
    (
      -- Public/featured stories (you can add a featured flag later)
      category = 'featured' OR
      -- Anonymous stories with high engagement (safer to show)
      (is_anonymous = true AND likes_count >= 5)
    )
  )
);

-- Create secure SELECT policies for challenge_posts  
-- Only show challenges that are open for solving OR user's own posts
CREATE POLICY "Users can view challenge posts securely" ON public.challenge_posts
FOR SELECT USING (
  auth.uid() = user_id OR  -- Own posts
  (
    -- Only authenticated users can view others' challenges
    auth.uid() IS NOT NULL AND
    (
      -- Only open challenges that need solving
      status = 'open' OR
      -- Solved challenges with solutions (less sensitive)
      (status = 'solved' AND solution IS NOT NULL)
    )
  )
);

-- Create secure SELECT policies for reversal_stories
-- Most restrictive since these contain sensitive mental health content
CREATE POLICY "Users can view reversal stories securely" ON public.reversal_stories  
FOR SELECT USING (
  auth.uid() = user_id OR  -- Only own stories
  (
    -- Only authenticated users can view very limited content
    auth.uid() IS NOT NULL AND
    is_anonymous = true AND
    -- Only show highly engaged anonymous content
    reactions IS NOT NULL AND
    jsonb_array_length(COALESCE(reactions->'positive', '[]'::jsonb)) >= 10
  )
);

-- Add a helper function to check if user can access community content
CREATE OR REPLACE FUNCTION public.user_can_access_community()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Only authenticated users can access community features
  SELECT auth.uid() IS NOT NULL;
$$;

-- Add policies for anonymous viewing of very limited, safe content
-- This allows the community page to show some content to encourage sign-up
CREATE POLICY "Anonymous users can view featured growth stories" ON public.growth_stories
FOR SELECT USING (
  -- Only featured, anonymous, highly-liked stories for non-logged-in users
  auth.uid() IS NULL AND
  is_anonymous = true AND 
  category = 'featured' AND
  likes_count >= 10
);

CREATE POLICY "Anonymous users can view open challenges" ON public.challenge_posts
FOR SELECT USING (
  -- Only open challenges for non-logged-in users (no personal details)
  auth.uid() IS NULL AND
  status = 'open' AND
  is_anonymous = true
);

-- No anonymous access to reversal stories (too sensitive)

-- Create audit function to track access to sensitive content
CREATE OR REPLACE FUNCTION public.log_sensitive_content_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log access to personal stories for security monitoring
  IF auth.uid() IS NOT NULL AND auth.uid() != OLD.user_id THEN
    INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
    VALUES (auth.uid(), 'community_content_view', CURRENT_DATE, 1)
    ON CONFLICT (user_id, feature_type, usage_date)
    DO UPDATE SET count = usage_tracking.count + 1;
  END IF;
  
  RETURN OLD;
END;
$$;