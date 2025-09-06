-- Fix critical security vulnerability: Remove public access to user_growth_points table
-- This prevents competitors from stealing user engagement and behavior data

-- Drop the overly permissive policy that allows anyone to read all growth points data
DROP POLICY IF EXISTS "Users can view growth points leaderboard" ON public.user_growth_points;

-- Create a secure leaderboard view that only shows anonymized ranking data
CREATE OR REPLACE VIEW public.growth_leaderboard AS
SELECT 
  -- Anonymous ranking information only
  ROW_NUMBER() OVER (ORDER BY total_points DESC) as rank,
  total_points,
  -- Don't expose user_id, streak_days, or other sensitive data
  'anonymous' as display_name,
  -- Only show point breakdowns for gamification, not user behavior tracking
  story_points,
  challenge_points,
  reversal_points
FROM public.user_growth_points
WHERE total_points > 0  -- Only show users with activity
ORDER BY total_points DESC
LIMIT 50;  -- Limit to top 50 to prevent data mining

-- Create a secure function to get user's own growth data with their rank
CREATE OR REPLACE FUNCTION public.get_user_growth_with_rank(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  user_id uuid,
  total_points integer,
  story_points integer,
  challenge_points integer,
  reversal_points integer,
  streak_days integer,
  current_rank bigint,
  last_activity_date date,
  updated_at timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to see their own data
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied: Can only view your own growth data';
  END IF;

  RETURN QUERY
  SELECT 
    ugp.user_id,
    ugp.total_points,
    ugp.story_points,
    ugp.challenge_points,
    ugp.reversal_points,
    ugp.streak_days,
    -- Calculate current rank without exposing other users' data
    (SELECT COUNT(*) + 1 FROM public.user_growth_points ugp2 WHERE ugp2.total_points > ugp.total_points) as current_rank,
    ugp.last_activity_date,
    ugp.updated_at
  FROM public.user_growth_points ugp
  WHERE ugp.user_id = p_user_id;
END;
$$;

-- Grant access to the leaderboard view for authenticated users only
GRANT SELECT ON public.growth_leaderboard TO authenticated;

-- Create RLS policy for the secure function
REVOKE ALL ON FUNCTION public.get_user_growth_with_rank FROM public;
GRANT EXECUTE ON FUNCTION public.get_user_growth_with_rank TO authenticated;