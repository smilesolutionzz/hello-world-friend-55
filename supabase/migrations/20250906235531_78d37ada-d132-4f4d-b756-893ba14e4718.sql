-- Fix security definer view warning by removing the view and creating a secure function instead
DROP VIEW IF EXISTS public.growth_leaderboard;

-- Create a secure function for public leaderboard data that doesn't expose sensitive information
CREATE OR REPLACE FUNCTION public.get_anonymous_leaderboard()
RETURNS TABLE(
  rank bigint,
  total_points integer,
  story_points integer,
  challenge_points integer,
  reversal_points integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY ugp.total_points DESC) as rank,
    ugp.total_points,
    ugp.story_points,
    ugp.challenge_points,
    ugp.reversal_points
  FROM public.user_growth_points ugp
  WHERE ugp.total_points > 0  -- Only show users with activity
  ORDER BY ugp.total_points DESC
  LIMIT 50;  -- Limit to top 50 to prevent data mining
END;
$$;

-- Grant access to authenticated users only
REVOKE ALL ON FUNCTION public.get_anonymous_leaderboard FROM public;
GRANT EXECUTE ON FUNCTION public.get_anonymous_leaderboard TO authenticated;