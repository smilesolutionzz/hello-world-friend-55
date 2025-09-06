-- Fix critical security vulnerability: Personal content exposed to public
-- Replace overly permissive SELECT policies with proper access controls

-- Drop existing overly permissive SELECT policies
DROP POLICY IF EXISTS "Users can view all growth stories" ON public.growth_stories;
DROP POLICY IF EXISTS "Users can view all challenge posts" ON public.challenge_posts;  
DROP POLICY IF EXISTS "Users can view all reversal stories" ON public.reversal_stories;

-- Create secure SELECT policies for growth_stories
-- Users can only view their own stories OR very limited approved content
CREATE POLICY "Users can view growth stories securely" ON public.growth_stories
FOR SELECT USING (
  auth.uid() = user_id OR  -- Own stories
  (
    -- Only authenticated users can view others' stories
    auth.uid() IS NOT NULL AND
    (
      -- Only anonymous stories with high engagement (safer to show)
      (is_anonymous = true AND likes_count >= 5) OR
      -- Public/featured stories
      category = 'featured'
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
-- Note: reversal_stories doesn't have is_anonymous column, so only own stories
CREATE POLICY "Users can view reversal stories securely" ON public.reversal_stories  
FOR SELECT USING (
  auth.uid() = user_id  -- Only own stories for maximum privacy
);

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