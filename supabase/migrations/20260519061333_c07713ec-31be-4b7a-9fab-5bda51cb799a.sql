
-- 1. b2b_partner_institutions: remove public SELECT exposing join_code etc.
DROP POLICY IF EXISTS "Anyone can view active partner institutions" ON public.b2b_partner_institutions;

-- 2. copilot_conversations: tighten UPDATE to owner-only
DROP POLICY IF EXISTS "Users update own copilot conversations" ON public.copilot_conversations;
CREATE POLICY "Users update own copilot conversations"
ON public.copilot_conversations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. user_reward_points: read-only for users
DROP POLICY IF EXISTS "Users can insert own reward points" ON public.user_reward_points;
DROP POLICY IF EXISTS "Users can update own reward points" ON public.user_reward_points;

-- 3b. user_points: read-only for users (remove ALL policy, keep SELECT)
DROP POLICY IF EXISTS "Users can update their own points" ON public.user_points;

-- 4. user_tokens: read-only for users
DROP POLICY IF EXISTS "user_tokens_insert" ON public.user_tokens;
DROP POLICY IF EXISTS "user_tokens_update" ON public.user_tokens;

-- 4b. tokens: read-only for users
DROP POLICY IF EXISTS "Users can insert their own tokens" ON public.tokens;
DROP POLICY IF EXISTS "Users can update their own tokens" ON public.tokens;
