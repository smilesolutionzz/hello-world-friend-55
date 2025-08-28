-- Fix RLS policies for personalized_missions table
DROP POLICY IF EXISTS "Users can insert their own missions" ON public.personalized_missions;
DROP POLICY IF EXISTS "Users can view their own missions" ON public.personalized_missions;
DROP POLICY IF EXISTS "Users can update their own missions" ON public.personalized_missions;
DROP POLICY IF EXISTS "Users can delete their own missions" ON public.personalized_missions;

-- Enable RLS
ALTER TABLE public.personalized_missions ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies for personalized_missions
CREATE POLICY "Users can view their own missions"
ON public.personalized_missions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own missions"
ON public.personalized_missions
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own missions"
ON public.personalized_missions
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own missions"
ON public.personalized_missions
FOR DELETE
USING (user_id = auth.uid());

-- Allow service role to insert missions (for AI generation)
CREATE POLICY "Service role can manage all missions"
ON public.personalized_missions
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');