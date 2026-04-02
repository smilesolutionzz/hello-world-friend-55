-- Fix 1: Remove unrestricted UPDATE policy on user_packages
DROP POLICY IF EXISTS "System can update packages" ON user_packages;

-- Fix 2: Restrict user_growth_points leaderboard to own data only
DROP POLICY IF EXISTS "Authenticated users can view anonymized leaderboard" ON user_growth_points;
CREATE POLICY "Users can view own growth points" ON user_growth_points FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Fix 3: Make voice-recordings bucket private
UPDATE storage.buckets SET public = false WHERE id = 'voice-recordings';

-- Fix 4: Replace public SELECT policy on voice-recordings with ownership-scoped policy
DROP POLICY IF EXISTS "Voice recordings are publicly accessible" ON storage.objects;
CREATE POLICY "Users can read own voice recordings" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'voice-recordings' AND (storage.foldername(name))[1] = auth.uid()::text);