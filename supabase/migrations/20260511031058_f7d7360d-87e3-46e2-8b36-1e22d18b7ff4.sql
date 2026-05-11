
-- 1) Lock down join_code column on b2b_partner_institutions
REVOKE SELECT (join_code, join_code_expires_at) ON public.b2b_partner_institutions FROM anon, authenticated;
GRANT SELECT (join_code, join_code_expires_at) ON public.b2b_partner_institutions TO service_role;

-- 2) Restrict memory_conversations public-share SELECT to authenticated users only
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'memory_conversations' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.memory_conversations', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can view their own memory conversations"
ON public.memory_conversations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_public = true);
