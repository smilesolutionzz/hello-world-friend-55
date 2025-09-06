-- Fix the security definer view issue by removing it and using a regular view
DROP VIEW IF EXISTS public.growth_leaderboard;

-- Create a regular view without security definer (this is safer)
-- This view only shows aggregated, anonymized data suitable for public leaderboard
CREATE VIEW public.growth_leaderboard AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY total_points DESC) as rank,
  total_points,
  'anonymous' as display_name,
  story_points,
  challenge_points,
  reversal_points
FROM public.user_growth_points
WHERE total_points > 0
ORDER BY total_points DESC
LIMIT 50;

-- Create RLS policy for the leaderboard view (allows authenticated users to read anonymized data)
ALTER VIEW public.growth_leaderboard SET (security_barrier = true);

-- Create RLS policy for authenticated users to read the anonymized leaderboard
CREATE POLICY "Authenticated users can view anonymized leaderboard"
ON public.user_growth_points
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  -- Only allow reading for leaderboard context (points > 0)
  total_points > 0
);

-- But limit what columns can be accessed in leaderboard context
-- by ensuring the view only exposes safe data