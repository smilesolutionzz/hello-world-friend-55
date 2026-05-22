
-- 1) b2b_followup_queue
DROP POLICY IF EXISTS "Admins can delete followup queue" ON public.b2b_followup_queue;
CREATE POLICY "Admins can delete followup queue"
ON public.b2b_followup_queue
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2) developmental_screening_results
DROP POLICY IF EXISTS "Service role can manage all screening results" ON public.developmental_screening_results;

-- 3) mind_track_self_checks
DROP POLICY IF EXISTS "self check public via share id" ON public.mind_track_self_checks;

CREATE OR REPLACE FUNCTION public.get_self_check_by_share_id(p_share_id text)
RETURNS TABLE (
  id uuid,
  share_id text,
  is_public boolean,
  level text,
  score integer,
  max_score integer,
  goal_id text,
  goal_title text,
  answers jsonb,
  questions jsonb,
  summary text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.share_id, s.is_public, s.level, s.score, s.max_score,
         s.goal_id, s.goal_title, s.answers, s.questions, s.summary, s.created_at
  FROM public.mind_track_self_checks s
  WHERE s.share_id = p_share_id AND s.is_public = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_self_check_by_share_id(text) TO anon, authenticated;

-- 4) payment_history
DROP POLICY IF EXISTS "Users can create their own payment records" ON public.payment_history;
DROP POLICY IF EXISTS "Users can update their own payment records" ON public.payment_history;

-- 5) user_challenges
DROP POLICY IF EXISTS "Users can update their own challenge progress" ON public.user_challenges;

-- 6) user_consultation_credits
DROP POLICY IF EXISTS credits_owner_insert ON public.user_consultation_credits;
DROP POLICY IF EXISTS credits_admin_insert ON public.user_consultation_credits;
CREATE POLICY credits_admin_insert
ON public.user_consultation_credits
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 7) user_subscriptions + subscriptions
DROP POLICY IF EXISTS users_insert_own_subscriptions ON public.user_subscriptions;
DROP POLICY IF EXISTS users_update_own_subscriptions ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
